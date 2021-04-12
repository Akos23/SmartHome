const nodemailer = require("nodemailer");
const mqtt = require("mqtt");

const mqtt_server = "mqtt://192.168.1.19:1883";
const mqtt_username = "email service";
const mqtt_password = "19961224";
const mqtt_topic = "notifications";

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
  client.subscribe(mqtt_topic);
});

client.on("error", (err) => console.log(err.toString()));

client.on("message", function (topic, message) {
  //add time-stamp
  const now = new Date();

  if (message.toString() === "intrusion") {
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
