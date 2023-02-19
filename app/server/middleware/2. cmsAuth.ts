/**
 * License: ISC Nabil Redmann 2023
 */


// NUXT-SESSION is not available in server-middlewares
// see: https://github.com/sidebase/nuxt-session/issues/50#issuecomment-1335933141


import { H3Event, SessionConfig } from "h3";
// needs compilerOptions.esModuleInterop = true in tsconfig.json !
import * as configJson from '~/data/cmsConfig.json';

const h3SessionCookieConfig:SessionConfig = {
    name: "sessionId_CMS",
    maxAge: 60 * 60 * 24 * 2,
    //cookie -> https://github.com/unjs/cookie-es/blob/main/src/types.ts
    cookie: {
        sameSite: 'none',
        //secure: false,  --fatal -- do not set (must always be true)
        path: '/',
        httpOnly: false,
    },
    
    password: configJson.cookiePassword,
};
/* use in middleware and api
let { id, data, update, clear } = await useSession(
    event,
    h3SessionCookieConfig
);
*/


// "MEMORY STORAGE" ... simplistic
let StoreMemory:{[id:string]:{created:number, alive?:number, data:{[key:string]:any}}} = {}; 
// StoreMemory clean up (invalidate logins after cookie maxage)
setInterval( () => {
    if (!h3SessionCookieConfig.maxAge) return;
    
    let now = Date.now();
    let max = h3SessionCookieConfig.maxAge * 1000;
    
    for (let key in StoreMemory) {
        let alive = StoreMemory[key].alive || StoreMemory[key].created;
        if (alive + max < now) {
            delete StoreMemory[key];
            console.log('StoreMemory cleared sessionId:', key);
        }
    }
}, 60 * 1000);

let NabilSessionStore = StoreMemory;
(globalThis as any).NabilSessionStore = NabilSessionStore;

let getNabilCmsAuth = async function(ev:H3Event) {
  let event = ev || this.event as H3Event; // this.event -> .bind({event})
  let storeRef = NabilSessionStore;
  
  let {
    id,
    //data: sessionData, // is empty, even with update({...obj})
    //update,
    clear,
  } = await useSession(event, h3SessionCookieConfig);
  
  let store = id ? storeRef[id] : null;
  
  return {
    id, 
    data: store?.data || {}, // contains { ... UserDatabase.data:{}, isAuthenticated:bool }
    meta: { 
      created: store?.created,
      alive: store?.alive || store?.created,
      maxAge: (h3SessionCookieConfig.maxAge || 0) * 1000,
    },
    clear: () => { if (store) { delete storeRef[id as string]; clear(); return true; } return false; },
    keepAlive: () => { if (store) { store.alive = Date.now(); return true; } return false; },
  };
};

// for other middlewares, where the event.context.getNabilCmsAuth is not set.
(globalThis as any).getNabilCmsAuth = getNabilCmsAuth;


let UserDatabase = configJson.UserDatabase;


export default eventHandler(async (event) => {
    const req = event.node.req;
    
    // provide to all routes and api
    event.context.getNabilCmsAuth = getNabilCmsAuth.bind({event});
    
    
    if (req.url!.startsWith("/cms")) {
        
        let { id: sessionId, /*data: useSessionData, update: sessionUpdate,*/ clear } = await useSession(
            event,
            h3SessionCookieConfig
        );
        
        let id = sessionId as string;
        
        let sessionData = /*useSessionData ||*/ NabilSessionStore[id]?.data || undefined;
        console.log('SESSION ID', id);



        //let isAuthenticated = () => event.context.session?.isAuthenticated || false;
        let isAuthenticated = ():boolean => sessionData?.isAuthenticated || false;


        let authenticate = (u:string, p:string) => {
            let user = UserDatabase.find( (v) => v.username == u && (v.password.length && v.password == p) || (v.passwordHash.length && v.passwordHash == p) );
            
            return {
                isAuthenticated: user?.data ? true : false,
                data: user?.data || {},
            };
        };




        //console.log('SESSION AVAILABLE?', insp(event.context.session), event.context.session);
        //test:  return {s: event.context.session};

        console.log("CMS -----", isAuthenticated(), sessionData);
        console.log('CMS URL:', req.method, req.url);
        
        if (!isAuthenticated() && req.url!.startsWith("/cms/login") && req.method == "GET") {
            // continue to go through to /pages/cms/login.vue
        }
        else if (req.url!.startsWith("/cms/login") && req.method == "POST" ) {
          
            let body = await readBody(event);

            let details = authenticate(body.name, body.password);
              
            if (details.isAuthenticated) {
                /*
                console.log('I', insp( event.context.session ));
                
                event.context.session.isAuthenticated = details.isAuthenticated;
                event.context.session.details = details;
                
                console.log('SESS', insp( event.context.session ));
                */
                //sessionData.isAuthenticated = details.isAuthenticated;
                //sessionData.details = details;
                
                sessionData = details;
                NabilSessionStore[id] = {created: Date.now(), data: details};
                
                // ERR_HTTP_HEADERS_SENT
                //try {
                //     sessionUpdate(oldData => details);
                //}catch(err){}
            }
            
            return details;
            
        }
        else if (isAuthenticated() && req.url!.startsWith("/cms/login")) {
            sendRedirect(event, '/cms', 203);
            return '<p>redirecting to <a href="/cms">cms</a></p>';
        }
        else if (req.url!.startsWith("/cms/api/auth")) {
            // auxiliary functions
            
            const type = req.url!.replace(/^\/cms\/api\/auth\/*/, '').replace(/\/$/, '').split('?').shift();
            
            const freeApis = ['status', 'isAuthenticated', 'id', 'keepAlive'];
            
            
            // the fallowing are allowed without login
            if (freeApis.indexOf(type) === -1 && !isAuthenticated()) {
                setResponseStatus(event, 403);
                return {
                    error: {
                        type: type,
                        url: req.url,
                        code: 403,
                        message: `Login first`,
                    },
                };
            }
            
            switch (type) {
                case 'isAuthenticated': 
                    return {isAuthenticated: isAuthenticated()};
                    
                case 'id':
                    return {id: id}

                case 'status':
                    return {a:1};
                    
                case 'keepAlive': // only if isAuthenticated
                    if (id && NabilSessionStore[id]) NabilSessionStore[id].alive = Date.now();
                    return {success: id && NabilSessionStore[id]?.alive ? true : false, isAuthenticated: isAuthenticated()};
                
                case 'logout':
                    delete NabilSessionStore[id];
                    let s = true;
                    try {
                        clear();
                    } catch(err) { s = false; }
                    return {success: s};
                
                default:
                    setResponseStatus(event, 403);
                    return {
                        error: {
                            type: type,
                            url: req.url,
                            code: 404,
                            message: `No API for '${type}'`,
                        },
                    };
            }
            
        }
        else if (!isAuthenticated()) {
            sendRedirect(event, '/cms/login', 203);
            return '<p>redirecting to <a href="/cms/login">login</a></p>';
        }

    }
    
});