const mqtt = require("mqtt");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const mqtt_server = "mqtt://192.168.1.19:1883";
const mqtt_topics = [
  "update/Hall/lock/0",
  "update/alarm",
  "update/General/switch/6",
];

const mqtt_username = "logger service";
const mqtt_password = "19961224";

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
const client = mqtt.connect(mqtt_server, {
  username: mqtt_username,
  password: mqtt_password,
});

client.on("connect", () => {
  for (let i = 0; i < mqtt_topics.length; i++) {
    client.subscribe(mqtt_topics[i]);
  }
});

client.on("error", (err) => console.log(err.toString()));

client.on("message", function (topic, message) {
  const data = JSON.parse(message.toString());

  const now = new Date();
  let name;
  let action;

  //front door
  if (topic.toString() === "update/Hall/lock/0") {
    action = data.isLocked ? "closed front door" : "opened front door";
    name = data.name;
  }

  //security system
  if (topic.toString() === "update/General/switch/6") {
    action = data.isOn
      ? "armed the security system"
      : "disarmed the security system";
    name = data.name;
  }

  //alarm
  if (topic.toString() === "update/alarm") {
    action = data.isOn ? "entered your home" : "switched off the alarm";
    name = data.name;
  }

  //construct the new record
  const record = {
    name: name,
    action: action,
    time: now.getTime(),
  };

  console.log(`new record added:`);
  console.log(record);

  //save it to both: our "permanent" and in memory database
  stream.write(JSON.stringify(record, null, 2) + ",\n", (err) => {});
  database.logs.push(record);
});
