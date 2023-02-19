/**
 * License: ISC Nabil Redmann 2023
 */
export default eventHandler((event) => {
  console.log(event.node.req.method + " " + event.node.req.url);
});
