// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    /*"@nuxt/content" /*"@sidebase/nuxt-session"*/
  ],

  /*
  content: {
    // https://content.nuxtjs.org/api/configuration
  },
  */

  /*
  // https://github.com/sidebase/nuxt-session#configuration
  session: {
    session: {
      expiryInSeconds: 60 * 60 * 24 * 2, // 2 days session timeout
      // allows to work in an iframe here on codesandbox
      cookieSameSite: "none",
      cookieSecure: true,

      // persistent storage with Redis
      // storageOptions: {
      //   driver: 'redis',
      //   options: {
      //     url: 'redis://localhost:6379'
      //   }
      // },
    },
    // if you want to save login status and more,
    //  you CAN NOT USE the API-endpoints (security/manipulation)
    // api: {
    //   isEnabled: false,
    // }
  },
  */

  // default options:
  /* session: {
    // Module is enabled
    isEnabled: true,
    session: {
      // Sessions expire after 600 seconds = 10 minutes
      expiryInSeconds: 60 * 10,
      // Session ids are 64 characters long
      idLength: 64,
      // All session data is stored in a "sub-storage" that uses the `sessions` prefix
      storePrefix: "sessions",
      // The session cookie same site policy is `lax`
      cookieSameSite: "lax",
      // `Secure` attribute of session cookie is set to `true`
      cookieSecure: true,
      // `HttpOnly` attribute of session cookie is set to `true`
      cookieHttpOnly: true,
      // In-memory storage is used (these are `unjs/unstorage` options)
      storageOptions: {
        driver: "memory",
        options: {},
      },
      // The request-domain is strictly used for the cookie, no sub-domains allowed
      domain: false,
      // Sessions aren't pinned to the user's IP address
      ipPinning: false,
      // Expiration of the sessions are not reset to the original expiryInSeconds on every request
      rolling: false,
    },
    api: {
      // The API is enabled
      isEnabled: true,
      // `PATCH, GET, POST, DELETE /api/session` HTTP requests are possible
      methods: ["patch", "get", "post", "delete"],
      // The sessions endpoints are mounted at `/api/session`
      basePath: "/api/session",
    },
  }, */
});
