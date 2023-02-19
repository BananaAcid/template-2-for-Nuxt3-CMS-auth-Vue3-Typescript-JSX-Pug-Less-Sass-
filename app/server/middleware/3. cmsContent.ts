/**
 * License: ISC Nabil Redmann 2023
 */
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

/* 
from: https://stackoverflow.com/a/64385468/1644202

usage:

async function run() {
  for await (const file of getFiles()) {
    console.log(file.path)
  }
}
*/
declare type GetFilesFileType = { name: string; path: string; type: ('dir' | 'file' | 'schema'); filepath: string; content: string; id: string; };
declare type GetFilesType = AsyncGenerator<GetFilesFileType>;
async function* getFiles(path = './', initialPath?:string):GetFilesType {
    const entries = await fs.readdir(path, { withFileTypes: true });
    
    initialPath = initialPath || path;

    for (let file of entries) {
        if (file.isDirectory()) {
            yield { ...file, path, type: 'dir', filepath: path + '/' + file.name + '/', 
                content: (path.replace(initialPath, '') + '/') + file.name.replace(/^[0-9]+\.\ */, ''), 
                id: (path.replace(initialPath, '') + '/' + file.name).replace(/^\/*/, '').replace(/[\///]/g, ':').replaceAll(' ', '-'),
            };
            yield* getFiles(`${path}/${file.name}`, initialPath);
        } else {
            yield { ...file, path, type: file.name.endsWith('.schema.json') ? 'schema' : 'file', filepath: path + '/' + file.name, 
              content:
                (path.replace(initialPath, '') + '/') + 
                file.name
                  .replace(/^[0-9]+\.\ */, '')
                  .replace('.json', ''),
              id: (path.replace(initialPath, '') + '/' + file.name).replace(/^\/*/, '').replace(/[\///]/g, ':').replaceAll(' ', '-'),
          };
        }
    }
}
/* generates
[
  {
    name: 'part2',
    path: '/project/sandbox/app/data/cms',
    type: 'dir',
    filepath: '/project/sandbox/app/data/cms/part2/',
    [Symbol(type)]: 2
  },
  {
    name: '3. third file.json',
    path: '/project/sandbox/app/data/cms/part2',
    type: 'file',
    filepath: '/project/sandbox/app/data/cms/part2/3. third file.json',
    content: '/part2/third file',
    id: 'part2:3.-third-file.json',
    [Symbol(type)]: 1
  }
]
*/


/* nuxt:content style ...
[
  {
    "title": "Hello Content V2",
    "_path": "/",
    "children": [
      {
        "title": "Hello Content V2",
        "_id": "content:index.md",
        "_path": "/"
      }
    ]
  },
  {
    "title": "Sub Folder",
    "_path": "/sub-folder",
    "children": [
      {
        "title": "About Content V2",
        "_id": "content:sub-folder:about.md",
        "_path": "/sub-folder/about"
      }
    ]
  }
]

*/

const pathRoot = process.cwd();
const pathData = fsSync.realpathSync( path.join(pathRoot, 'data', 'cms') );

console.log('PATH -------------', {pathRoot, pathData});


let naviList:(GetFilesFileType[]|null) = null;
let naviListMtime:(null|Date) = null;
let getNaviList = async (reload = false) => {
    let mtime = (await fs.stat(pathData)).mtime;
  
    if (!reload && naviList && naviListMtime == mtime) return naviList;
    naviListMtime = mtime;
    
    
    naviList = [];
    for await (const file of getFiles(pathData)) {
        naviList.push(file);
    }
    
    return naviList;
}


export default eventHandler(async (event) => {
    const req = event.node.req;
    
    //console.log('naviList', await getNaviList());
    
    
    if (req.url!.startsWith("/cms/api/content")) { 
        
        // provide to all routes and api
        let { id, data: sessionData, meta, clear, keepAlive } = await (globalThis as any).getNabilCmsAuth(event); // event.context.getNabilCmsAuth();
        
        /*
        console.log('DATA', {
          session:{id, sessionData, meta, clear}, req,
        });
        */
        
        
        let isAuthenticated = ():boolean => sessionData?.isAuthenticated || false;
        let isAdmin = ():boolean => sessionData?.isAuthenticated && sessionData?.data.isAdmin || false;
        
        
        const type = req.url!.replace(/^\/cms\/api\/content\/*/, '').replace(/\/$/, '').split('?').shift();
        
        
        const freeApis = ['status', 'isAuthenticated', 'isAdmin', 'get'];
        
        
        // the fallowing are allowed without login
        if (type && freeApis.indexOf(type) === -1 && !isAuthenticated()) {
            //@ts-ignore 2325 - type definition by nuxt is wrong
            setResponseStatus(event, 403);
            return {
                error: {
                    type: type,
                    url: req.url,
                    code: 403,
                    message: `Login first'`,
                },
            };
        }

        switch (type) {
            case 'isAuthenticated': 
                return {isAuthenticated: isAuthenticated()};
            case 'isAdmin': 
                return {isAdmin: isAdmin()};

            case 'status':
                return {a: 1}
                
            case 'navigation':
                return await getNaviList();
                
            case 'get':
                let getFn = async () => {
    console.log('req.url', req.url);
                    let params = new URLSearchParams(req.url!.split('?').pop());
                    let fileId = params.get('id');
    console.log('fileId', fileId);
                    if (!fileId) return { success: false, error: {message: 'no id' } };
                    let fList = await getNaviList();
                    let file = fList.find( el => el.id == fileId );
    console.log('file', file);
                    if (!file) return { success: false, error: {message: 'no matching id' } };
                    let content = await fs.readFile(file.filepath, { encoding: 'utf8' });
    console.log('content', content);
                    return content;
                }
                return await getFn();
                
            case 'set':
                let setFn = async () => {
                    let params = new URLSearchParams(req.url!.split('?').pop());
                    let fileId = params.get('id');
    console.log('fileId', fileId);
                    if (!fileId) return { success: false, error: {message: 'no id' } };
                    let fList = await getNaviList();
                    let file = fList.find( el => el.id == fileId );
    console.log('file', file);
                    if (!file) return { success: false, error: {message: 'no matching id' } };
                    let body = await readBody(event);
                    if (!body) return { success: false, error: {message: 'no body' } };
                    let success = true;
                    let error = {};
                    try {
                        // just in case
                        let bodyContent = typeof body === "object" ? JSON.stringify(body, null, 4) : body;
                        await fs.writeFile(file.filepath, bodyContent);
                    } catch (err: unknown) {
                        success = false;
                        error = { error: {
                            type: type,
                            url: req.url,
                            code: 404,
                            message: (err as Error).message,
                        }};
                    }
                    return {success, ...error};
                }
                return await setFn();
                
            default:
                //@ts-ignore 2325 - type definition by nuxt is wrong
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

});