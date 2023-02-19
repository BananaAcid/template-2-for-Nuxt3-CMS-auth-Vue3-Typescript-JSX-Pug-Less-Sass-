export default eventHandler((event) => {
  console.log("/api/bar", event.context.session.id);
  return { route: "/api/bar", sessId: event.context.session.id };
});
