/**
 * License: ISC Nabil Redmann 2023
 */
export default eventHandler(async (event) => {
  /*
    // data is always empty
    let {
        id,
        data: sessionData, // data is always empty, even when using update({obj})
        update,
        clear,
    } = await useSession(event, event.context.h3SessionCookieConfig);

    let data = event.context.NabilSessionStore[id];
    */
  //console.log("/api/get-login", id, sessionData, event.context.session, data);

  let { id, data, meta, clear, keepAlive } =
    await event.context.getNabilCmsAuth();

  data.counter = data.counter || 0;
  data.counter++;

  console.log("/api/get-login", id, data);

  return {
    route: "/api/get-login",
    id,
    data,
    meta,
  };
});
