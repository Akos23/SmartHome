#include <_mqtt.h>
#include <_wifi.h>

extern WiFiClient wifiClient;

//broker server IP címe
const char *mqtt_server = "192.168.1.5";
PubSubClient mqttClient(mqtt_server, 1883, onMessage, wifiClient);

void reconnect()
{
  while (!mqttClient.connected())
  {
    Serial.print("Attempting MQTT connection...");

    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (mqttClient.connect(clientId.c_str()))
    {
      Serial.println("connected");
      mqttClient.subscribe("control/#"); //to all the topics that start with control/
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void onMessage(String topic, byte *payload, unsigned int length)
{
  String message = payloadToString(payload, length);
  Serial.println("Message arrived on topic: " + topic + ". Message: " + message);

  //split the topic into subtopics
  std::vector<String> topics = getSubTopics(topic);

  //Here we will control some device and if everything was fine
  //then we publish a message to the broker for the browser-clients 
  //so that they can update their states --> UI

  topic.replace("control", "update");

  bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
  mqttClient.publish(topic.c_str(), message.c_str(), retain);
}

std::vector<String> getSubTopics(String topic)
{
  std::vector<String> result;
  String subTopic;
  char nextChar;
  for (uint i = 0; i < topic.length(); i++)
  {
    nextChar = topic[i];
    if (nextChar == '/')
    {
      result.push_back(subTopic);
      subTopic.clear();
    }
    else
    {
      subTopic += nextChar;
    }
  }
  result.push_back(subTopic);
  return result;
}

String payloadToString(byte *payload, uint length)
{
  String message;
  for (uint i = 0; i < length; i++)
  {
    message += (char)payload[i];
  }
  return message;
}

