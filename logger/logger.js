const mqtt = require("mqtt");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

//Load our "database" in memory and convert it to a JSON object
let raw = fs.readFileSync("database.json");
raw = raw.slice(0, raw.lastIndexOf(","));
let database = JSON.parse(`{"logs":[${raw}]}`);
console.log(`current database:`);
console.log(database);

//Create a stream for expanding our database with new log messages
const stream = fs.createWriteStream("database.json", { flags: "a" });

//Set up express and listen on port 3333 for GET/POST requests
const app = express();

//Adding middleware
app.use(cors());
app.use(express.json());

app.get("/api/history", (req, res) => {
  res.send(database); //if someone asks for it give them tha database
});

/*app.post("/history", (req, res) => {
  const record = req.body;
  stream.write(JSON.stringify(record, null, 2) + ",\n", (err) => {});
  database.logs.push(record);
});*/

app.listen(3333, () =>
  console.log("Logger service started listening on port 3333")
);

//New log messages will arrive on the update/history topic of our broker
const client = mqtt.connect("mqtt://192.168.1.19:1883", {
  username: "logger service",
  password: "19961224",
});

client.on("connect", () => {
  client.subscribe("logger/history", (err) => {
    if (!err) {
      client.publish("debug", "logger service connected");
      console.log("connected to broker");
    }
  });
});

client.on("error", (err) => console.log(err.toString()));

client.on("message", function (topic, message) {
  // message format: name,action
  const data = message.toString().split(",");
  //add time-stamp
  const now = new Date();
  //construct the new record
  const record = {
    name: data[0],
    action: data[1],
    time: now.getTime(),
  };
  console.log(`new record added: ${record}`);

  //save it to both: our "permanent" and in memory database
  stream.write(JSON.stringify(record, null, 2) + ",\n", (err) => {});
  database.logs.push(record);
});
