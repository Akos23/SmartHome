#include <Arduino.h>
#include <ArduinoJson.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_AccelStepper.h"
#include "FastLED.h"

//#define FASTLED_ESP8266_RAW_PIN_ORDER

//////////////////////////////////////////////////////////////////////
//-----> ESP1: Takes care of the Kitchen and the Living room <-----//
////////////////////////////////////////////////////////////////////

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
const uint8 LR_standingLamp = MCP_GPIO_A7;
const uint8 K_UC_lights = MCP_GPIO_A6;
const uint8 K_KI_ligths = MCP_GPIO_A5;
const uint8 K_exhaustFan = MCP_GPIO_A4;

//Connect the motion sensors to MCP
const uint8 K_MS = MCP_GPIO_B0;
const uint8 LR_MS = MCP_GPIO_B1;

//Connect sliding door stepper motor to MCP
AccelStepper slidingDoor(AccelStepper::MotorInterfaceType::FULL4WIRE, 7,5,6,4, true, true);
const uint8 LR_door_s1 = MCP_GPIO_B7;
const uint8 LR_door_s2 = MCP_GPIO_B6;
const uint8 LR_door_s3 = MCP_GPIO_B5;
const uint8 LR_door_s4 = MCP_GPIO_B4;

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  {K_MS, "Kitchen"},
  {LR_MS, "Living room"}
};

//Tell the MCP how to configure the pins the devices are connected to
const std::vector<uint8> MCP_interruptPins = 
  {
    K_MS,
    LR_MS
  };

const std::vector<uint8> MCP_outputPins = 
{
  LR_standingLamp,
  K_UC_lights,
  K_KI_ligths,
  K_exhaustFan
};

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = 2; //D4 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = 4; //D2 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = 5; //D1     and the mcp library uses that object by default, so we wont do anything with these pins

//Connect WS2812B RGB strip to ESP
const uint RGB_size = 8;
CRGB leds[RGB_size];
const uint8 RGB_pin = D5;

//mapping between devID(comes form browser-client) and physical pins
//-1 means that its not controlled by this ESP but probably by an other one 
const int8 lamps[] = 
{
  LR_standingLamp,
  K_UC_lights,
  K_KI_ligths,
  -1,//H_lights,
  -1,//G_lights,
  -1,//bathroom lights
};

const int8 switches[] = 
{
  -1,     //LR_TV,
  -1,     //MB_TV
  -1,     //GB_TV,
  K_exhaustFan,     //K_ExFan
  -1,     //power saving mode?? --> its only a logical switch
  -1,     //main power --> everything except security related things
  -1      //security system
  -1      //silent alarm
};

const double stepperLimits[] = 
{
  4, //LR sliding door
  2.5, //MB roller blind
  2.5, //GB roller blind
  2.5 //garage door
};

AccelStepper* devIdToStepper[] =
{
  nullptr,
  nullptr,
  nullptr,
  &slidingDoor
};

//other constants
const uint64 RFID_pollingIntervall = 2000;

const uint stepperStepsPerRotation = 2038;
const uint stepperSpeed = 900;
const uint stepperMaxSpeed = 1000;

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();
void doLightingEffect(uint8 effect);

//global variables
Adafruit_MCP23017 mcp;
bool isSecuritySystemOn = false;
bool isAlarmOn = false;
bool isDoorOpen = false;
uint8 lightingEffect = 0;

void setup() {
  //Connect to local network
  setup_wifi();
  
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
  
  //Setup steppers
  slidingDoor.setMCP(&mcp,LR_door_s1, LR_door_s3, LR_door_s2, LR_door_s4);
  slidingDoor.setMaxSpeed(stepperMaxSpeed);

  //Setup WS2812B RGB
  FastLED.addLeds<WS2812B, 5, GRB>(leds, RGB_size);
}

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();
  
  slidingDoor.runSpeedToPosition();

  if(lightingEffect)
    doLightingEffect(lightingEffect);
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
  String topic = "control/alarm";

  StaticJsonDocument<100> doc;
  doc["isOn"] = true;
  doc["user"] = "A Bad Person";
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

  if(topic == "update/alarm")
  {
    isAlarmOn = doc["isOn"];
    return;
  }
  
  if(topic == "update/General/switch/6") //security system
  {
    isSecuritySystemOn = doc["isOn"];
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
    bool newValue = doc["isOn"];
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
    /*uint newValue = doc["value"];

    Servo* servo = devIdToServo[devId];

    if(!servo)
      return;
    
    uint setPoint = map(newValue,0,100,0,90);
    servo->write(setPoint);*/
  }
  else if(devType == "stepper")
  {
    //which device it is?
    AccelStepper* stepper = devIdToStepper[devId];

    //Is it controlled by this ESP?
    if(!stepper)
      return;

    //depending on the device remap the set position
    int newPosition = map(doc["value"], 0, 100, 0, stepperLimits[devId]*stepperStepsPerRotation);

    //Should we move forwards or backwards?
    int currentPos = stepper->currentPosition();
    int direction = newPosition - currentPos > 0 ? 1 : -1;

    //Set the new position and speed of the controlled device
    stepper->moveTo(newPosition);
    stepper->setSpeed(direction * stepperSpeed);
    sendUpdate = true;
  }
  else if(devType == "lock")
  {
    //TODO...
  }
  else if(devType == "effect-selector")
  {
    if(doc["isActive"])
      lightingEffect = doc["effectID"];
    else
    {
      lightingEffect = -1;
      for(uint i = 0; i < RGB_size; i++)
        leds[i] = CRGB(0, 0, 0);

      FastLED.show();
    }

    sendUpdate = true;
  }
  else if(devType == "rgb-led")
  {
    for(uint i = 0; i < RGB_size; i++)
      leds[i][devId] = doc["value"];
    
    FastLED.show();
  }

  //TODO: Wheather(sensors)

  //////////////////////////////////////////////////////////////////////

  topic.replace("control", "update");

  if(sendUpdate)
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}

void doLightingEffect(uint8 effect)
{
  static uint effect1Speed = 50;
  static uint effect2Speed = 100;
  static uint effect3Speed = 50;
  static uint64 tLastStep = millis();
  static uint step = 0;
  static CRGB color = CRGB(255, 0, 0);
  static CHSV hueColor = CHSV(0, 255, 150);
  
  switch(effect)
  {
    case 1:
      if(millis() - tLastStep < effect1Speed)
        return;

      
      for(int i = 0; i < RGB_size; i++)
        leds[i] = CRGB(0, 0, 0);

      leds[step] = color;

      step++;
      if(step == RGB_size)
      {
        step = 0;
        color = CRGB(random(0,255), random(0,255), random(0,255));
        leds[0] = color;
      }
      else
      {
        leds[step] = color;
      }

      tLastStep = millis();

      FastLED.show();
      break;
    case 2:
      if(millis() - tLastStep < effect2Speed)
        return;

      leds[step] = hueColor;

      step++;
      if(step == RGB_size)
      {
        step = 0;
        hueColor.hue = (hueColor.hue + 20) > 255 ? 0 : (hueColor.hue + 20) % 255;
      }
      tLastStep = millis();

      FastLED.show();
      break;
    case 3:
      if(millis() - tLastStep < effect3Speed)
        return;

      for(int i = 0; i < RGB_size; i++)
        leds[i] = hueColor;

      hueColor.hue = (hueColor.hue + 5) > 255 ? 0 : (hueColor.hue + 5) % 255;
      
      tLastStep = millis();

      FastLED.show();
      
      break;

  }
}