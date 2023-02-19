export default eventHandler((event) => {
  console.log("/api/foo", event.context.session.id);
  return { route: "/api/foo", sessId: event.context.session.id };
});
