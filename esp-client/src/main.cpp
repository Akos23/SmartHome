#include <Arduino.h>
#include <_wifi.h>
#include <_mqtt.h>
#include <_mcp23017.h>
#include <map>

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

//Connect the LEDs/TVs to MCP
const uint8 LR_standingLamp = MCP_GPIO_A0;
const uint8 LR_TV = MCP_GPIO_A1;
const uint8 GB_TV = MCP_GPIO_A2;
const uint8 K_UC_lights = MCP_GPIO_A3;
const uint8 K_KI_lights = MCP_GPIO_A4;
const uint8 H_lights = MCP_GPIO_A5;
const uint8 G_lights = MCP_GPIO_A6;
const uint8 B_lights = MCP_GPIO_A7;

//Connect the motion sensors to MCP
const uint8 LR_MS = MCP_GPIO_B0;
const uint8 GB_MS = MCP_GPIO_B1;
const uint8 MB_MS = MCP_GPIO_B2;
const uint8 K_MS = MCP_GPIO_B3;
const uint8 H_MS = MCP_GPIO_B4;
const uint8 G_MS = MCP_GPIO_B5;
const uint8 B_MS = MCP_GPIO_B6;

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  {LR_MS, "Living room"},
  {GB_MS, "Guest bedroom"},
  {MB_MS, "Main bedroom"},
  {K_MS, "Kitchen"},
  {H_MS, "Hall"},
  {G_MS, "Garage"},
  {B_MS, "Bathroom"}
};

//Connect the alarm
//...

//Tell the MCP how to configure the pins the devices are connected to
const std::vector<uint8> MCP_interruptPins = 
  {
    LR_MS,
    GB_MS,
    MB_MS,
    K_MS,
    H_MS,
    G_MS,
    B_MS
  };

const std::vector<uint8> MCP_outputPins = 
{
  LR_standingLamp,
  LR_TV,
  GB_TV,
  K_UC_lights,
  K_KI_lights,
  H_lights,
  G_lights,
  B_lights
};


extern PubSubClient mqttClient;
Adafruit_MCP23017 mcp;
ICACHE_RAM_ATTR void ISR_movementChanged();

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = 14; //D5
const uint8 MCP_SDA = 4; //D2 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = 5; //D1     and the mcp library uses that object by default, so we wont do anything with these pins

//mapping between devID(comes form browser-client) and physical pins
//-1 means that its not controlled by this ESP but probably by an other one 
const int8 lamps[] = 
{
  LR_standingLamp,
  K_UC_lights,
  K_KI_lights,
  H_lights,
  G_lights,
  B_lights
};

const int8 switches[] = 
{
  LR_TV,
  -1,     //MB_TV
  GB_TV,
  -1,     //K_ExFan
  -1,     //power saving mode?? --> its only a logical switch
  -1,     //main power --> everything except security related things
  -1     //logical switch
};
void setup() {
  //Connect to local network
  setup_wifi();
  //Setup MCP with interrupt
  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  mcp.readGPIOAB();
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, RISING);

}

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
  uint8 interruptPin = mcp.getLastInterruptPin();
  bool somethingMoved = mcp.digitalRead(interruptPin) == HIGH;

  String topic = "update/" + pirToRoom[interruptPin] + "/motion";

  mqttClient.publish(topic.c_str(), somethingMoved ? "true" : "false");
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
    bool newValue = message == "true";
    const int8 physicalPin = lamps[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, newValue); //for now we assume that every lamp is connected to the mcu and not directly to the ESP
    }
  }
  else if(devType == "switch")
  {
    bool newValue = message == "true";
    const int8 physicalPin = switches[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, newValue); //for now we assume that every switch is connected to the mcu and not directly to the ESP
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

  //These 2 types of devices get too many messages in a short period of time
  //So if the browser waited for conformation from the device to update their
  //UI then we wouldn't get a smooth experience
  if(!(devType == "rgb-led" || devType == "dimmer"))
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}