#include <Arduino.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_alarm.h"
#include "Servo.h"


/*
  LR: living room
  GB: guest bedroom
  MB: main bedroom
  K: kitchen  UC: under cabinet KI: kitchen island
  H: hall
  G: garage
  B: bathroom
  MS: motion sensor
*/
extern PubSubClient mqttClient;

//Connect the alarm to ESP
const uint8 alarm = D2;

//Connect window controllers to ESP
const uint8 LR_window = D5;
Servo LR_servo;

const int8 switches[] = 
{
  -1,
  -1,     //MB_TV
  -1,
  -1,     //K_ExFan
  -1,     //power saving mode --> its only a logical switch
  -1,     //main power --> everything except security related things
  alarm   //alarm --> logical switch
};

const uint8 windows[] = 
{
  LR_window
};

void setup() {
  //Connect to local network
  setup_wifi();

  LR_servo.attach(LR_window);
}

bool isAlarmOn = false;
void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();

  if(isAlarmOn)
    doAlarm(0,300,500);
}

void onMessage(String topic, byte *payload, unsigned int length)
{
  String message = payloadToString(payload, length);

  //split the topic into subtopics
  std::vector<String> topics = getSubTopics(topic);
  const String card = topics[1];
  const String devType = topics[2];
  const uint devId = topics[3].toInt();
  const String propName = topics[4];

  ///////////////////////////////////////////////////////////////////////
  //Here we will control some device and if everything was fine
  //then we publish a message to the broker for the browser-clients 
  //so that they can update their states --> UI

  //Test: controlling the standing lamp in the living room
  if(devType == "lamp")
  {

  }
  else if(devType == "switch")
  {
    bool newValue = message == "true";
    const int8 physicalPin = switches[devId];
    if(physicalPin == alarm)
    {
        isAlarmOn = newValue;
        if(!newValue)
          noTone(alarm);
    }
  }
  else if(devType == "temp-setter")
  {
    //TODO...
  }
  else if(devType == "dimmer")
  {
    //TODO...
  }
  else if(devType == "servo")
  {
    uint newValue = message.toInt();
    const int8 physicalPin = windows[devId];
    if(physicalPin == LR_window)
    {
      uint setPoint = map(newValue,0,100,0,180);
      LR_servo.write(setPoint);
    }
  }
  else if(devType == "stepper")
  {
    //TODO...
  }
  else if(devType == "lock")
  {
    //TODO...
  }

  //TODO: RGB, History(RFID), Wheather(sensors)

  //////////////////////////////////////////////////////////////////////

  topic.replace("control", "update");

  //These 2 types of devices get too many messages in a short period of time
  //So if the browser waited for conformation from the device to update their
  //UI then we wouldn't get a smooth experience
  if(!(devType == "rgb-led" || devType == "dimmer"))
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}