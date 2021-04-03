const aedes = require("aedes")(); //creates an instance: const aedes = aedes()
const httpServer = require("http").createServer();
const ws = require("websocket-stream");

//mqtt over websocket
const ws_port = 8888;
ws.createServer({ server: httpServer }, aedes.handle);

httpServer.listen(ws_port, function () {
  console.log("websocket server listening on port ", ws_port);
});

//mqtt
const server = require("net").createServer(aedes.handle);
const port = 1883;

server.listen(port, function () {
  console.log("mqtt server started and listening on port ", port);
});
