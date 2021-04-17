#include <_mqtt.h>
#include <_wifi.h>

extern WiFiClient wifiClient;
void onMessage(String topic, byte *payload, unsigned int length);
const char* mqtt_server = "192.168.1.19";
const char* mqtt_username = "ESP1";
const char* mqtt_password = "19961224";
const std::vector<String> mqtt_topics = 
{
  "control/#",
  "update/alarm",
  "update/General/switch/6",
};

PubSubClient mqttClient(mqtt_server, 1883, onMessage, wifiClient);

void reconnect()
{
  while (!mqttClient.connected())
  {

    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (mqttClient.connect(clientId.c_str(), mqtt_username, mqtt_password))
    {
      for(int i = 0; i<mqtt_topics.size(); i++)
      {
        mqttClient.subscribe(mqtt_topics[i].c_str());
      }
      String message(mqtt_username);
      message += " is connected";
      mqttClient.publish("debug", message.c_str());
    }
    else
    {
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
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

