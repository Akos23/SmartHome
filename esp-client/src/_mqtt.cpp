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
  
}

