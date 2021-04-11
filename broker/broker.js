const aedes = require("aedes")(); //creates an instance: const aedes = aedes()
const ws = require("websocket-stream");

//mqtt server listening on websocket port
//It is built on an http server
const wsServer = require("http").createServer();
ws.createServer({ server: wsServer }, aedes.handle);
const ws_port = 8888;

wsServer.listen(ws_port, function () {
  console.log(
    `websocket server on ${wsServer.address().address} listening on port ${
      wsServer.address().port
    }`
  );
});

//mqtt server listening on raw TCP port
const tcpServer = require("net").createServer(aedes.handle);
const tcp_port = 1883;

tcpServer.listen(tcp_port, function () {
  console.log(
    `TCP server on ${tcpServer.address().address} listening on port ${
      tcpServer.address().port
    }`
  );
});

//Authentication
aedes.authenticate = (client, username, password, callback) => {
  const isAuthorized = String(password) === "19961224";
  console.log(
    `${client.id} as ${username} wants to connect: ${
      isAuthorized ? "accepted" : "denied"
    } `
  );
  callback(null, isAuthorized);
};
