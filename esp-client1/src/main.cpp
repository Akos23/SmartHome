#include <Arduino.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <FastLED.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_AccelStepper.h"

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

///////////////////////////////////////////////////////////////////////////////////////////
// Defining how the devices are connected
//////////////////////////////////////////////////////////////////////////////////////////


//Connect to analog multiplexer
//Not used...

//Connect analog multiplexer to MCP
//Not used...

/*//Connect the LEDs to MCP
const uint8 LR_standingLamp = MCP_GPIO_A7;
const uint8 K_UC_lights = MCP_GPIO_A6;
const uint8 K_KI_ligths = MCP_GPIO_A5;

//Connect the motion sensors to MCP
const uint8 K_MS = MCP_GPIO_B0;
const uint8 LR_MS = MCP_GPIO_B1;

//Connect sliding door stepper motor to MCP
AccelStepper slidingDoor(AccelStepper::MotorInterfaceType::FULL4WIRE, 7,5,6,4, true, true);
const uint8 LR_door_s1 = MCP_GPIO_B7;
const uint8 LR_door_s2 = MCP_GPIO_B6;
const uint8 LR_door_s3 = MCP_GPIO_B5;
const uint8 LR_door_s4 = MCP_GPIO_B4;

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = D4; //GPIO2 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = D2; //GPIO4 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = D1; //GPIO5     and the mcp library uses that object by default, so we wont do anything with these pins*/

//Connect WS2812B RGB strip to ESP
const uint RGB_size = 8;
CRGB leds[RGB_size];
const uint8 RGB_pin = D5;

//Connect the LEDs to ESP
const uint8 LR_standingLamp = D8;
const uint8 K_UC_lights = D6;
const uint8 K_KI_ligths = D7;

//Connect the motion sensors to ESP
const uint8 K_MS = D1;
const uint8 LR_MS = D2;

//////////////////////////////////////////////////////////////////////////////////////////////
//mapping between devID(comes form browser-client) and physical pins
////////////////////////////////////////////////////////////////////////////////////////////


//-1 or nullptr means that its not controlled by this ESP but probably by an other one 
const int8 devIdToLamp[] = 
{
  LR_standingLamp,
  K_UC_lights,
  K_KI_ligths,
  -1,//H_lights1,
  -1,//G_lights,
  -1,//B_lights,
  -1,//H_lights2,
};

const int8 devIdToSwitch[] = 
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

const int8 devIdToDimmer[] =
{
  -1,//MB_dimmer,
  -1,//GB_dimmer
};

// Not used...
struct ServoData
{
  Servo* servo;
  bool isRightOpening;
};

ServoData devIdToServo[] = 
{
  {nullptr, true},
  {nullptr, false}
};

struct StepperData
{
  AccelStepper* stepper;
  double maxRevolutions;
};

StepperData devIdToStepper[] =
{
  {nullptr/*&slidingDoor*/, 4}, //sliding door
  {nullptr, 2.5},  //MB
  {nullptr, 2.5}, //GB
  {nullptr, 3}  //garage door
};

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  //{GB_MS, "Guest bedroom"},
  //{B_MS, "Bathroom"},
  //{MB_MS, "Main bedroom"},
  //{G_MS, "Garage"}
  {K_MS, "Kitchen"},
  {LR_MS, "Living room"}
};


////////////////////////////////////////////////////////////////////////////////////////
// Global constants, variables and declarations
///////////////////////////////////////////////////////////////////////////////////////

//constants
//const uint alarmFrequency = 300; //Hz
//const uint alarmSpeed = 500; //s

const uint stepperStepsPerRotation = 2038;
const uint stepperSpeed = 900;
const uint stepperMaxSpeed = 1000;

//const uint64 RFID_pollingIntervall = 2000;

//const uint lightSensorUpdateIntervall = 2000;
//const uint tempSensorUpdateIntervall = 3000;
//const uint rainSensorUpdateIntervall = 3000;

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();
//void getSensorReadings();
//void checkForRFIDCard();
void doLightingEffect(uint8 effect);


//global variables
//Adafruit_MCP23017 mcp;
bool isMainPowerOn = false;
bool isSecuritySystemOn = false;
bool isSilentAlarmOn = false;
bool isAlarmOn = false;
bool isPowerSavingOn = false;
bool isDoorOpen = false;
int  LR_temperatureSetPoint = 23;
uint8 lightingEffect = 0;


//////////////////////////////////////////////////////////////////////////////
// Setup and initialization
////////////////////////////////////////////////////////////////////////////


void setup() {
  //Connect to local network
  setup_wifi();
  
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  //Tell the MCP how to configure the pins the devices are connected to
  /*const std::vector<uint8> MCP_interruptPins = 
    {
      K_MS,
      LR_MS
    };

  const std::vector<uint8> MCP_outputPins = 
  {
    LR_standingLamp,
    K_UC_lights,
    K_KI_ligths,
  };

  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
  
  //Setup steppers
  slidingDoor.setMCP(&mcp,LR_door_s1, LR_door_s3, LR_door_s2, LR_door_s4);
  slidingDoor.setMaxSpeed(stepperMaxSpeed);
*/
  //Setup lamps
  pinMode(LR_standingLamp,OUTPUT);
  pinMode(K_KI_ligths,OUTPUT);
  pinMode(K_UC_lights,OUTPUT);
  
  //Setup motion sensors
  pinMode(K_MS, INPUT);
  attachInterrupt(digitalPinToInterrupt(K_MS), ISR_movementChanged, RISING);

  pinMode(LR_MS, INPUT);
  attachInterrupt(digitalPinToInterrupt(LR_MS), ISR_movementChanged, RISING);

  //Setup WS2812B RGB
  FastLED.addLeds<WS2812B, 5, GRB>(leds, RGB_size);
}


///////////////////////////////////////////////////////////////////////////
// Program Logic
///////////////////////////////////////////////////////////////////////////

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();
  
  //slidingDoor.runSpeedToPosition();

  if(lightingEffect)
    doLightingEffect(lightingEffect);
}

//This interrupt is triggered whenever the motion sensors output changes:
//It outputs a HIGH signal as long as it senses motion + 2seconds after the motion stopped
ICACHE_RAM_ATTR void ISR_movementChanged()
{
  //Let's see which pin caused the interrupt and read it's value
  //We have to read it in order to clear the interrupt
  //uint8 interruptPin = mcp.getLastInterruptPin();
  //bool somethingMoved = mcp.digitalRead(interruptPin) == HIGH;
  
  
  //For now we only care if they are trying to rob us
  if(!isSecuritySystemOn)
    return;

  //Trigger the alarm only for the Rising edge
  //if(!somethingMoved)
  //  return;

  //If the alarm is already on, dont trigger it again
  if(isAlarmOn)
    return;

  //Then we create the topic and the message we want to send
  //String topic = "update/" + pirToRoom[interruptPin] + "/motion";
  String topic = "control/alarm";

  StaticJsonDocument<100> doc;
  doc["isOn"] = true;
  doc["user"] = "A Bad Person";
  doc["room"] = "Living room & Kitchen"; //pirToRoom[interruptPin];

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
    const int8 physicalPin = devIdToLamp[devId];
    if(physicalPin > -1)
    {
      //mcp.digitalWrite(physicalPin, doc["isOn"]); //for now we assume that every lamp is connected to the mcu and not directly to the ESP
      digitalWrite(physicalPin, doc["isOn"]);
      sendUpdate = true;
    }
  }
  else if(devType == "switch")
  {
    switch(devId)
    {
      case 4: //Logical switches
        isPowerSavingOn = doc["isOn"];
        sendUpdate = true;
        break;
      case 5:
        isMainPowerOn = doc["isOn"];
        sendUpdate = true;
        break;
      case 6:
        isSecuritySystemOn = doc["isOn"];
        break;
      case 7:
        isSilentAlarmOn = doc["isOn"];
        sendUpdate = true;
        break;
      default:  //Physical switches
        const int8 physicalPin = devIdToSwitch[devId];
        if(physicalPin > -1)
        {
          //mcp.digitalWrite(physicalPin, doc["isOn"]); //for now we assume that every switch is connected to the mcu and not directly to the ESP
          digitalWrite(physicalPin, doc["isOn"]);
          sendUpdate = true;
        }
    }
  }
  else if(devType == "temp-setter")
  {
    //For now it can be only set in the living room:
    if(devId == 0)
    {
      LR_temperatureSetPoint = doc["value"];
      sendUpdate = true;
    }
  }
  else if(devType == "dimmer")
  {
    const int8 physicalPin = devIdToDimmer[devId];
    if(physicalPin > -1)
    {
      const uint brightness = map(doc["value"], 0, 100, 0, 1023);
      analogWrite(physicalPin, brightness);
    }  
  }
  else if(devType == "servo")
  {
    const ServoData& servoData = devIdToServo[devId];

    if(!servoData.servo)
      return;
    
    uint newValue = doc["value"];
    //remap to the middle range because servos tend to jitter around their limits and we only need 90 degrees 
    uint setPoint = servoData.isRightOpening ? 150 - newValue : 70 + newValue;
    
    servoData.servo->write(setPoint);
    
    sendUpdate = true;
  }
  else if(devType == "stepper")
  {
     //which device it is?
    AccelStepper* stepper = devIdToStepper[devId].stepper;

    if(!stepper)
      return;

    //depending on the device remap the set position
    int newPosition = map(doc["value"], 0, 100, 0, devIdToStepper[devId].maxRevolutions*stepperStepsPerRotation);

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
    //H_frontDoorLock.write(doc["isLocked"] ? 70 : 120);
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

      
      for(uint i = 0; i < RGB_size; i++)
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

      for(uint i = 0; i < RGB_size; i++)
        leds[i] = hueColor;

      hueColor.hue = (hueColor.hue + 5) > 255 ? 0 : (hueColor.hue + 5) % 255;
      
      tLastStep = millis();

      FastLED.show();
      
      break;

  }
}