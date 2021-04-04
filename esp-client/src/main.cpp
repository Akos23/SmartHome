#include <Arduino.h>
#include <_wifi.h>
#include <_mqtt.h>

extern PubSubClient mqttClient;

void setup() {
  setup_wifi();
}

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }

  mqttClient.loop();
}