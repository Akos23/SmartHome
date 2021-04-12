const nodemailer = require("nodemailer");
const mqtt = require("mqtt");

const mqtt_server = "mqtt://192.168.1.19:1883";
const mqtt_username = "email service";
const mqtt_password = "19961224";
const mqtt_topics = ["update/alarm"];

const email_sender = "bmesmarthome.server@gmail.com";
const email_password = "rFs0945kG";
const email_receiver = "dabasi.akos@gmail.com";

//EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: email_sender,
    pass: email_password,
  },
});

//MQTT
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

  //add time-stamp
  const now = new Date();

  if (topic.toString() === "update/alarm" && data.isOn) {
    //Sending an email alert
    const mailOptions = {
      from: email_sender,
      to: email_receiver,
      subject: "Security Breach!",
      text: "Someone set off the alarm in your home. Call the cops!",
      priority: "high",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
});
