#include <Arduino.h>
#include <ArduinoJson.h>
#include <Servo.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_alarm.h"
#include "_AccelStepper.h"

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

///////////////////////////////////////////////////////////////////////////////////////////
// Defining how the devices are connected
//////////////////////////////////////////////////////////////////////////////////////////

//Connect to analog multiplexer
const uint8 lightSensor1 = 0; 
const uint8 lightSensor2 = 1; 
const uint8 lightSensor3 = 2; 
const uint8 lightSensor4 = 3;
const uint8 lightSensor5 = 4;
const uint8 tempSensor = 5;
const uint8 rainSensor = 6;

//Connect analog multiplexer to MCP
const uint8 MUX_s0 = MCP_GPIO_A6;
const uint8 MUX_s1 = MCP_GPIO_A5;
const uint8 MUX_s2 = MCP_GPIO_A4;

//Connect LEDs to MCP
const uint8 G_lights = MCP_GPIO_A7;

//Connect the motion sensors to MCP
const uint8 MB_MS = MCP_GPIO_B0;
const uint8 G_MS = MCP_GPIO_B1;

//Connect garage door stepper motor to MCP
AccelStepper garageDoor(AccelStepper::MotorInterfaceType::FULL4WIRE, 0,2,1,3, true, true);
const uint8 G_door_s1 = MCP_GPIO_A0;
const uint8 G_door_s2 = MCP_GPIO_A1;
const uint8 G_door_s3 = MCP_GPIO_A2;
const uint8 G_door_s4 = MCP_GPIO_A3;

//Connect roller blind to stepper motor
AccelStepper rollerBlind(AccelStepper::MotorInterfaceType::FULL4WIRE, 7,5,6,4, true, true);
const uint8 MB_rollerBlind_s1 = MCP_GPIO_B7;
const uint8 MB_rollerBlind_s2 = MCP_GPIO_B6;
const uint8 MB_rollerBlind_s3 = MCP_GPIO_B5;
const uint8 MB_rollerBlind_s4 = MCP_GPIO_B4;

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = D4; //GPIO2 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = D2; //GPIO4 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = D1; //GPIO5     and the mcp library uses that object by default, so we wont do anything with these pins

//Connect servos to the ESP
Servo MB_RightWindow;
const uint8 MB_RightWindowPin = D6;

Servo MB_LeftWindow;
const uint8 MB_LeftWindowPin = D7;

//Connect alarm to the ESP
const uint8 alarm = D5;

//Connect dimmer lights to the ESP
const uint8 MB_dimmer = D8;




//////////////////////////////////////////////////////////////////////////////////////////////
//mapping between devID(comes form browser-client) and physical pins
////////////////////////////////////////////////////////////////////////////////////////////

//-1 or nullptr means that its not controlled by this ESP but probably by an other one 
const int8 devIdToLamp[] = 
{
  -1,//LR_standingLamp,
  -1,//K_UC_lights,
  -1,//K_KI_lights,
  -1,//H_lights1,
  G_lights,//G_lights,
  -1//B_lights
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
  MB_dimmer,
  -1, //guest bedroom dimmer lights
};

struct ServoData
{
  Servo* servo;
  bool isRightOpening;
};

ServoData devIdToServo[] = 
{
  {&MB_RightWindow, true},
  {&MB_LeftWindow, false}
};

struct StepperData
{
  AccelStepper* stepper;
  double maxRevolutions;
};

StepperData devIdToStepper[] =
{
  {nullptr, 4}, //sliding door
  {&rollerBlind, 2.5},  //MB
  {nullptr, 2.5}, //GB
  {&garageDoor, 3}  //garage door
};

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  //{GB_MS, "Guest bedroom"},
  //{B_MS, "Bathroom"},
  {MB_MS, "Main bedroom"},
  {G_MS, "Garage"}
  //{K_MS, "Kitchen"},
  //{LR_MS, "Living room"}
};


////////////////////////////////////////////////////////////////////////////////////////
// Global constants, variables and declarations
///////////////////////////////////////////////////////////////////////////////////////

//constants
const uint alarmFrequency = 300; //Hz
const uint alarmSpeed = 500; //s

const uint stepperStepsPerRotation = 2038;
const uint stepperSpeed = 900;
const uint stepperMaxSpeed = 1000;

//const uint64 RFID_pollingIntervall = 2000;

const uint lightSensorUpdateIntervall = 2000;
const uint tempSensorUpdateIntervall = 3000;
const uint rainSensorUpdateIntervall = 3000;

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();
void getSensorReadings();

//global variables
Adafruit_MCP23017 mcp;
bool isMainPowerOn = false;
bool isSecuritySystemOn = false;
bool isSilentAlarmOn = false;
bool isAlarmOn = false;
bool isPowerSavingOn = false;
bool isDoorOpen = false;
int  LR_temperatureSetPoint = 23;



//////////////////////////////////////////////////////////////////////////////
// Setup and initialization
////////////////////////////////////////////////////////////////////////////

void setup() {
  
  //Setup alarm
  pinMode(alarm, OUTPUT);
  digitalWrite(alarm, LOW);
  noTone(alarm);

  //Connect to local network
  setup_wifi();

  //Setup dimmer lights
  pinMode(MB_dimmer, OUTPUT);
  digitalWrite(MB_dimmer, LOW);

  //Setup servos
  MB_RightWindow.write(150);
  MB_LeftWindow.write(70);
  MB_RightWindow.attach(MB_RightWindowPin);
  MB_LeftWindow.attach(MB_LeftWindowPin);

  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  //Tell the MCP how to configure the pins the devices are connected to
  const std::vector<uint8> MCP_interruptPins = 
    {
      MB_MS,
      G_MS,
    };

  const std::vector<uint8> MCP_outputPins =   //stepper pins are set to OUTPUT in setMCP func.
  {
    G_lights,
    MUX_s0,
    MUX_s1,
    MUX_s2
  };

  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);

  //Setup steppers
  garageDoor.setMCP(&mcp,G_door_s1, G_door_s3, G_door_s2, G_door_s4);
  garageDoor.setMaxSpeed(stepperMaxSpeed);

  rollerBlind.setMCP(&mcp,MB_rollerBlind_s1, MB_rollerBlind_s3, MB_rollerBlind_s2, MB_rollerBlind_s4);
  rollerBlind.setMaxSpeed(stepperMaxSpeed);
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
  
  if(isAlarmOn)
    doAlarm(0, alarmFrequency, alarmSpeed, alarm);

  garageDoor.runSpeedToPosition();
  rollerBlind.runSpeedToPosition();

  getSensorReadings();
  
}

//This interrupt is triggered whenever the motion sensors output changes:
//It outputs a HIGH signal as long as it senses motion + 2seconds after the motion stopped
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
  //Only if silent alarm is not enabled we set off the alarm
  if(!isSilentAlarmOn)
    isAlarmOn = true;

  //And let the others know
  String topic = "update/alarm";

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

  if(topic == "control/alarm")
  {
    if(!isSilentAlarmOn)
      isAlarmOn = doc["isOn"];

    if(!isAlarmOn)
      noTone(alarm);

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

  if(devType == "lamp")
  {
    const int8 physicalPin = devIdToLamp[devId];
    if(physicalPin > -1)
    {
      mcp.digitalWrite(physicalPin, doc["isOn"]); //for now we assume that every lamp is connected to the mcu and not directly to the ESP
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
        sendUpdate = true;
        break;
      case 7:
        isSilentAlarmOn = doc["isOn"];
        sendUpdate = true;
        break;
      default:  //Physical switches
        const int8 physicalPin = devIdToSwitch[devId];
        if(physicalPin > -1)
        {
          mcp.digitalWrite(physicalPin, doc["isOn"]); //for now we assume that every switch is connected to the mcu and not directly to the ESP
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
    //TODO...
  }

  //////////////////////////////////////////////////////////////////////

  topic.replace("control", "update");

  //The ESP sends updates only on devices that are actually controlled by it
  if(sendUpdate)
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}

int readMUX(uint8 selected)
{ 
  if(selected > 7)
    return 0;

  mcp.digitalWrite(MUX_s0, 0b00000001 & selected); 
  mcp.digitalWrite(MUX_s1, 0b00000010 & selected);
  mcp.digitalWrite(MUX_s2, 0b00000100 & selected);
  return analogRead(A0);
}

void getSensorReadings()
{
  static uint64 tLastLightReading = millis();
  static uint64 tLastTempReading = millis();
  static uint64 tLastRainReading = millis();

  

  if(millis() - tLastLightReading > lightSensorUpdateIntervall)
  {
    //For now we are only intrested in the max brightness you can get and not where it comes from
    uint maxBrightness = readMUX(lightSensor1);
    maxBrightness = (uint)readMUX(lightSensor2) > maxBrightness ? readMUX(lightSensor2) : maxBrightness;
    maxBrightness = (uint)readMUX(lightSensor3) > maxBrightness ? readMUX(lightSensor3) : maxBrightness;
    maxBrightness = (uint)readMUX(lightSensor4) > maxBrightness ? readMUX(lightSensor4) : maxBrightness;
    maxBrightness = (uint)readMUX(lightSensor5) > maxBrightness ? readMUX(lightSensor5) : maxBrightness;

    String message;
    StaticJsonDocument<100> doc; 
    doc["brightness"] = maxBrightness;
    serializeJson(doc, message);

    mqttClient.publish("update/Wheather/brightness", message.c_str());
    tLastLightReading = millis();
  }
  if(millis() - tLastTempReading > tempSensorUpdateIntervall)
  {
    uint degrees = readMUX(tempSensor)*3300/1023/10;

    String message;
    StaticJsonDocument<100> doc;
    doc["degrees"] = degrees;
    serializeJson(doc, message);

    mqttClient.publish("update/Wheather/degrees", message.c_str());
    tLastTempReading = millis();
  }
  if(millis() - tLastRainReading > rainSensorUpdateIntervall)
  {
    uint rain = readMUX(rainSensor);

    String message;
    StaticJsonDocument<100> doc;
    doc["rain"] = map(rain, 0, 1023, 1023, 0);
    serializeJson(doc, message);

    mqttClient.publish("update/Wheather/rain", message.c_str());
    tLastRainReading = millis();
  }
}