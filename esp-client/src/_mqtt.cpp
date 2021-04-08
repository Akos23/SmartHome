#include <_mqtt.h>
#include <_wifi.h>

extern WiFiClient wifiClient;
void onMessage(String topic, byte *payload, unsigned int length);
const char *mqtt_server = "192.168.1.7";

PubSubClient mqttClient(mqtt_server, 1883, onMessage, wifiClient);

void reconnect()
{
  while (!mqttClient.connected())
  {

    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);

    // Attempt to connect
    if (mqttClient.connect(clientId.c_str()))
    {
      mqttClient.subscribe("control/#"); //to all the topics that start with control/
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

