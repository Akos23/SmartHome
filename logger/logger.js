const mqtt = require("mqtt");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

//Set up express and listen on port 3333 for GET requests
const app = express();
app.use(cors());

app.get("/history", (req, res) => {
  res.send(database); //if someone asks for it give them tha database
});

app.listen(3333, () =>
  console.log("Logger service started listening on port 3333")
);

//Load our "database" in memory and convert it to a JSON object
let raw = fs.readFileSync("database.json");
raw = raw.slice(0, raw.lastIndexOf(","));
let database = JSON.parse(`{"logs":[${raw}]}`);
console.log(`current database:`);
console.log(database);

//Create a stream for expanding our database with new log messages
const stream = fs.createWriteStream("database.json", { flags: "a" });

//New log messages will arrive on the update/history topic of our broker
const client = mqtt.connect("mqtt://192.168.1.19:1883");
client.on("connect", function () {
  client.subscribe("update/history", function (err) {
    if (!err) {
      client.publish("debug", "logger service connected");
      console.log("connected to broker");
    }
  });
});

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
