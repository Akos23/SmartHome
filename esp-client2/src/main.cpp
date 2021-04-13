#include <Arduino.h>
#include <ArduinoJson.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"

//////////////////////////////////////////////////////////////////////////////////
//-----> ESP2: Takes care of the Guest bedroom the Bathroom and the Hall <-----//
////////////////////////////////////////////////////////////////////////////////

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
const uint8 B_lights = MCP_GPIO_A7;

//Connect the motion sensors to MCP
const uint8 B_MS = MCP_GPIO_B0;
const uint8 GB_MS = MCP_GPIO_B1;

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  {B_MS, "Bathroom"},
  {GB_MS, "Guest bedroom"}
};

//Tell the MCP how to configure the pins the devices are connected to
const std::vector<uint8> MCP_interruptPins = 
  {
    B_MS,
    GB_MS
  };

const std::vector<uint8> MCP_outputPins = 
{
  B_lights,
};

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = 2; //D4 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = 4; //D2 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = 5; //D1     and the mcp library uses that object by default, so we wont do anything with these pins

//mapping between devID(comes form browser-client) and physical pins
//-1 means that its not controlled by this ESP but probably by an other one 
const int8 lamps[] = 
{
  -1,//LR_standingLamp,
  -1,//K_UC_lights,
  -1,//K_KI_lights,
  -1,//H_lights,
  -1,//G_lights,
  B_lights
};

const int8 switches[] = 
{
  -1,     //LR_TV,
  -1,     //MB_TV
  -1,     //GB_TV,
  -1,     //K_ExFan
  -1,     //power saving mode?? --> its only a logical switch
  -1,     //main power --> everything except security related things
  -1      //security system
  -1      //silent alarm
};

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();

Adafruit_MCP23017 mcp;

void setup() {
  //Connect to local network
  setup_wifi();
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
}

//global variables
bool isSecuritySystemOn = false;
bool isAlarmOn = false;
bool isPowerSavingOn = false;

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();
}

ICACHE_RAM_ATTR void ISR_movementChanged()
{
  //Let's see which pin caused the interrupt and read it's value
  uint8 interruptPin = mcp.getLastInterruptPin();
  bool somethingMoved = mcp.digitalRead(interruptPin) == HIGH;
  
  //Then we create the topic and the message we want to send
  String topic = "update/" + pirToRoom[interruptPin] + "/motion";

  StaticJsonDocument<48> doc;
  doc["isOn"] = somethingMoved;
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

  const char* name = doc["name"]; //Who sent the message?
  
  if(topic == "control/alarm")
  {
    bool isOn = doc["isOn"]; 
    //...
    return;
  }
  

  //split the topic into subtopics
  std::vector<String> topics = getSubTopics(topic);
  const String card = topics[1];
  const String devType = topics[2];
  const uint devId = topics[3].toInt();

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
    }
  }
  else if(devType == "switch")
  {
   /* bool newValue = message == "true";
    const int8 physicalPin = switches[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, newValue); //for now we assume that every switch is connected to the mcu and not directly to the ESP
    }*/
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

  //These 2 types of devices get too many messages in a short period of time
  //So if the browser waited for conformation from the device to update their
  //UI then we wouldn't get a smooth experience
  if(!(devType == "rgb-led" || devType == "dimmer"))
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}