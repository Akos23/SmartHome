#include <Arduino.h>
#include <_wifi.h>
#include <_mqtt.h>

extern PubSubClient mqttClient;

void setup() {
  setup_wifi();
  pinMode(D4, OUTPUT); // standing lamp in the Living room
  digitalWrite(D4, HIGH);
  pinMode(D2, OUTPUT); // dimmer lights in Main bedroom
  analogWriteRange(1023);
}

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }

  mqttClient.loop();
}