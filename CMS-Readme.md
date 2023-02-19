# Nabil CMS

License: ISC Nabil Redmann 2023

For now, uses the h3-session support, and usus its own memoryStore.

Planned: 
1. use encrpted passwords (not plaintext)
2. Bearer-Token instead of session-cookie
3. using of inbuilt nuxt-storage (memoryStore, Redis, ...)
4. example JsonForms implementation on cms/index.vue


## Base files:

Note: *The order matters, the cmsAuth has to be before cmsContent.*

- server/
    - middleware/
        1. cmsAuth.ts
        2. cmsContent.ts

- pages/
    - cms/
        - index.vue (custom dashboard, cmsAuth will redirect here)
        - login.vue (custom login page, cmsAuth will redirect here)

- data/
    - cmsConfig.json (cms configuration)
    - cms/
        - ... .json (the content that will be loaded by cmsContent)
        - ... .schema.json (may be used to generate JsonForms)

- middleware
    - ... route with auth testing
    
## acessing the auth / content 

1. in server/middlewares
    - use `let { id, data: sessionData, meta, clear, keepAlive } = await (globalThis as any).getNabilCmsAuth(event);`
    
2. in server/api
    - use `let { id, data, meta, clear, keepAlive } = await event.context.getNabilCmsAuth();`

change data: `data.counter++;`
    - data is a normal object, that will be persistent
 
### returned properties:
- id:string = session id
- data:{} = any data you added
- meta:{created, alive, maxAge} = created is the JS-timestamp(ms), alive the last keepAlive() was called or it got created and is used to dispose the session data (alive + maxAge), maxAge is the maxAge(ms) to keep the session data 
- clear() = call it to delete all session data
- keepAlive() = prolong the auto disposal of the session data

## rest endpoints:

To access them, use $fetch or any variant.

Example, do login:
```ts
declare type LoginReturnType = { isAuthenticated: boolean; data: {} };
let data: LoginReturnType = await $fetch("/cms/login", {
    method: "POST",
    body: {name: '', password: ''},
});

if (data.isAuthenticated) { navigateTo('/cms')}; // or just reload the page ...
```

Example, doing it from the dev-console:
```js
await fetch("/cms/login", {
    method: "POST",
    body: JSON.stringify({name: 'john', password: '1111'}),
}).then(d=>d.json()).isAuthenticated;
```

Example, in mount or setup - check if session is still active:
```ts
   let {
      data: keepAliveData,
      refresh: keepAliveRefresh,
    } = await useFetch("/cms/api/auth/keepAlive");
    // options API
    this.keepAliveData = keepAliveData; // ref<{success:bool, isAuthenticated:bool}>
    // or composition API
    // const keepAliveData = ref(keepAliveData);

    const timerKeepAlive = window.setInterval(async () => {
      keepAliveRefresh();
    }, 5000);
    
    // add  removeInterval(timerKeepAlive);  in  beforeUnmount().
```


- /cms/login = get -> /pages/login.vue, post -> needs body:{name,password} => { isAuthenticated: boolean, data: {} }
- /cms/api/auth
    - /isAuthenticated GET = (needs no authentication) => {isAuthenticated:bool}
    - /id GET = (needs no authentication) => {id:string}
    - /status GET = (needs no authentication)  => {}
    - /keepAlive GET = (needs no authentication) => {success:bool, isAuthenticated:bool} (success:false if no session is active)
    - /logout GET = (needs authentication) => {success:bool} (success:false if no session is active)
    
- /cms/api/content
    - /isAuthenticated GET = (needs no authentication) => {isAuthenticated:bool}
    - /isAdmin GET = (needs no authentication) => {isAdmin:bool} - checks UserDatabase{ [ ..., data: { isAdmin:bool }]} - is unsave, just for UI info
    - /status GET = (needs no authentication)  => {}
    - /navigation GET = gets the all files and folders from /data/cms/
    - /get?id=... GET = (needs no authentication) => returns the content of the identified file
    - /set?id=... POST = (needs authentication) => updates the content of the identified file, anything in posted body
    