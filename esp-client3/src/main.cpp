#include <Arduino.h>
#include <ArduinoJson.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_alarm.h"

///////////////////////////////////////////////////////////////////////
//-----> ESP3: Takes care of the Main bedroom and the Garage  <-----//
/////////////////////////////////////////////////////////////////////

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

//Connect the devices to MCP
const uint8 G_lights = MCP_GPIO_A7;

//Connect the motion sensors to MCP
const uint8 MB_MS = MCP_GPIO_B0;
const uint8 G_MS = MCP_GPIO_B1;

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  {MB_MS, "Main bedroom"},
  {G_MS, "Garage"}
};

//Tell the MCP how to configure the pins the devices are connected to
const std::vector<uint8> MCP_interruptPins = 
  {
    MB_MS,
    G_MS
  };

const std::vector<uint8> MCP_outputPins = 
{
  G_lights,
};

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = D4; //GPIO2 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = D2; //GPIO4 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = D1; //GPIO5     and the mcp library uses that object by default, so we wont do anything with these pins

//Connect alarm to the ESP
const uint8 alarm = D5;

//mapping between devID(comes form browser-client) and physical pins
//-1 means that its not controlled by this ESP but probably by an other one 
const int8 lamps[] = 
{
  -1,//LR_standingLamp,
  -1,//K_UC_lights,
  -1,//K_KI_lights,
  -1,//H_lights,
  G_lights,//G_lights,
  -1//B_lights
};

const int8 switches[] = 
{
  -1,     //LR_TV,
  -1,     //MB_TV
  -1,     //GB_TV,
  -1,     //K_ExFan
  -1,     //power saving mode?? --> its only a logical switch
  -1,     //main power --> everything except security related things
  -1,     //security system
  -1,     //silent alarm
};

//other constants
const uint alarmFrequency = 300; //Hz
const uint alarmSpeed = 500; //s

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();

//global variables
Adafruit_MCP23017 mcp;
bool isSecuritySystemOn = false;
bool isSilentAlarmOn = false;
bool isAlarmOn = false;
bool isPowerSavingOn = false;
bool isDoorOpen = false;

void setup() {
  
  //Setup alarm
  pinMode(alarm, OUTPUT);
  digitalWrite(alarm, LOW);
  noTone(alarm);

  //Connect to local network
  setup_wifi();
  
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
  
}


void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();
  
  if(isAlarmOn)
    doAlarm(0, alarmFrequency, alarmSpeed, alarm);
}

ICACHE_RAM_ATTR void ISR_movementChanged()
{
  //Let's see which pin caused the interrupt and read it's value
  //We have to read it in order to clear the interrupt
  uint8 interruptPin = mcp.getLastInterruptPin();
  bool somethingMoved = mcp.digitalRead(interruptPin) == HIGH;
  
  //For now we only care if they are trying to rob us
  if(!isSecuritySystemOn)
    return;

  //Trigger the alarm only for the Rising edge
  if(!somethingMoved)
    return;

  //If the alarm is already on, dont trigger it again
  if(isAlarmOn)
    return;

  //Then we create the topic and the message we want to send
  //String topic = "update/" + pirToRoom[interruptPin] + "/motion"; 
  //String topic = "control/alarm"; --> in case of other ESPs

  //Since this ESP controls the alarm:
  //We set off the alarm
  isAlarmOn = true;

  //And let the others know
  String topic = "update/alarm";

  StaticJsonDocument<48> doc;
  doc["isOn"] = true;
  doc["name"] = "A Bad Person";
  doc["room"] = pirToRoom[interruptPin];
  
  String message;
  serializeJson(doc, message);

  //Finally we send it to the broker
  mqttClient.publish(topic.c_str(), message.c_str());
}

void onMessage(String topic, byte *payload, unsigned int length)
{
  String message = payloadToString(payload, length);

  //Parsing the message and checking for errors
  StaticJsonDocument<100> doc;
  DeserializationError error = deserializeJson(doc, payload, length);

  if (error) {
    mqttClient.publish("debug", error.c_str());
    return;
  }

  //const char* name = doc["name"]; //Who sent the message?
  
  if(topic == "control/alarm")
  {
    if(!isSilentAlarmOn)
      isAlarmOn = doc["isOn"];

    if(!isAlarmOn)
      noTone(alarm);

    //String deb("alarm: ");
    //deb+= String(isSecuritySystemOn) + " silent: " + String(isSilentAlarmOn) + "new: " + String(isAlarmOn);
    //mqttClient.publish("debug", deb.c_str());

    topic.replace("control", "update");
    bool retain = true;
    mqttClient.publish(topic.c_str(), message.c_str(), retain);

    return;
  }
  
  //split the topic into subtopics
  std::vector<String> topics = getSubTopics(topic);
  const String card = topics[1];
  const String devType = topics[2];
  const uint devId = topics[3].toInt();

  bool sendUpdate = false;
  ///////////////////////////////////////////////////////////////////////
  //Here we will control some device and if everything was fine
  //then we publish a message to the broker for the browser-clients 
  //so that they can update their states --> UI

  //Test: controlling the standing lamp in the living room
  if(devType == "lamp")
  {
    bool newValue = doc["isOn"];
    const int8 physicalPin = lamps[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, newValue); //for now we assume that every lamp is connected to the mcu and not directly to the ESP
      sendUpdate = true;
    }
  }
  else if(devType == "switch")
  {
    if(devId == 6) //Security system
    {
      isSecuritySystemOn = doc["isOn"];
      sendUpdate = true;
    }

    if(devId == 7) //Silent alarm
    {
      isSilentAlarmOn = doc["isOn"];
      sendUpdate = true;
    }

    bool newValue = message == "true";
    const int8 physicalPin = switches[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, newValue); //for now we assume that every switch is connected to the mcu and not directly to the ESP
      sendUpdate = true;
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
    //TODO...
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

  //The ESP sends updates only on devices that are actually controlled by it
  if(sendUpdate)
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}