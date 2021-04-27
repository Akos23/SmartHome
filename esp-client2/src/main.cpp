#include <Arduino.h>
#include <ArduinoJson.h>
#include <MFRC522.h>
#include <Servo.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_AccelStepper.h"

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

///////////////////////////////////////////////////////////////////////////////////////////
// Defining how the devices are connected
//////////////////////////////////////////////////////////////////////////////////////////


//Connect to analog multiplexer
//Not used...

//Connect analog multiplexer to MCP
//Not used...

//Connect the LEDs to MCP
const uint8 B_lights = MCP_GPIO_A7;
const uint8 H_lights1 = MCP_GPIO_A6;
const uint8 H_lights2 = MCP_GPIO_A5;

//Connect the motion sensors to MCP
const uint8 B_MS = MCP_GPIO_B0;
const uint8 GB_MS = MCP_GPIO_B1;

//Connect roller blind stepper motor to MCP
AccelStepper rollerBlind(AccelStepper::MotorInterfaceType::FULL4WIRE, 7,5,6,4, true, true);
const uint8 GB_rollerBlind_s1 = MCP_GPIO_B7;
const uint8 GB_rollerBlind_s2 = MCP_GPIO_B6;
const uint8 GB_rollerBlind_s3 = MCP_GPIO_B5;
const uint8 GB_rollerBlind_s4 = MCP_GPIO_B4;

//Connect the MCP23017 to the ESP
const uint8 MCP_INTB = D4; //GPIO2 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = D2; //GPIO4 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = D1; //GPIO5     and the mcp library uses that object by default, so we wont do anything with these pins

//Connect servos to the ESP
//Servo H_frontDoorLock;
//const uint8 H_frontDoorLockPin = D6;

//Conncect the RFID reader to the ESP
const uint8 RFID_RST = D0;
const uint8 RFID_SDA = D8; //SS
MFRC522 mfrc522(RFID_SDA, RFID_RST);

//Connect dimmer lights to the ESP
//const uint8 GB_dimmer = D6; //1; //TX



//////////////////////////////////////////////////////////////////////////////////////////////
//mapping between devID(comes form browser-client) and physical pins
////////////////////////////////////////////////////////////////////////////////////////////


//-1 or nullptr means that its not controlled by this ESP but probably by an other one 
const int8 devIdToLamp[] = 
{
  -1,//LR_standingLamp,
  -1,//K_UC_lights,
  -1,//K_KI_lights,
  H_lights1,
  -1,//G_lights,
  B_lights,
  H_lights2,
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
  {nullptr, 4}, //sliding door
  {nullptr, 2.5},  //MB
  {&rollerBlind, 2.5}, //GB
  {nullptr, 3}  //garage door
};

//To know which sensor is for which room 
std::map<uint8, String> pirToRoom = 
{
  {GB_MS, "Guest bedroom"},
  {B_MS, "Bathroom"},
  //{MB_MS, "Main bedroom"},
  //{G_MS, "Garage"}
  //{K_MS, "Kitchen"},
  //{LR_MS, "Living room"}
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

const uint64 RFID_pollingIntervall = 2000;

//const uint lightSensorUpdateIntervall = 2000;
//const uint tempSensorUpdateIntervall = 3000;
//const uint rainSensorUpdateIntervall = 3000;

//Authetnticated RFID tags
std::map<String,String> users = 
{
  {"01 02 03 04","Ákos Dabasi"},
  {"23 50 D0 18","Ildikó Orawetz"},
  {"B3 7A D0 18","László Dabasi"},
  {"B9 96 75 B3","Balázs Dabasi"}
};

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();
//void getSensorReadings();
void checkForRFIDCard();
//void doLightingEffect(uint8 effect);


//global variables
Adafruit_MCP23017 mcp;
bool isMainPowerOn = false;
bool isSecuritySystemOn = false;
bool isSilentAlarmOn = false;
bool isAlarmOn = false;
bool isPowerSavingOn = false;
bool isDoorOpen = false;
int  LR_temperatureSetPoint = 23;
//uint8 lightingEffect = 0;


//////////////////////////////////////////////////////////////////////////////
// Setup and initialization
////////////////////////////////////////////////////////////////////////////

//Tell the MCP how to configure the pins the devices are connected to
const std::vector<uint8> MCP_interruptPins = 
{
  GB_MS,
  B_MS,
};

const std::vector<uint8> MCP_outputPins =   //stepper pins are set to OUTPUT in setMCP func.
{
  B_lights,
  H_lights1,
  H_lights2,
};

void setup() {
  //Connect to local network
  setup_wifi();
  
  //Setup dimmer lights
  //pinMode(GB_dimmer, FUNCTION_3); //changes TX to regular GPIO pin
  //pinMode(GB_dimmer, OUTPUT);
  //digitalWrite(GB_dimmer, LOW);

  //Setup servos
  //H_frontDoorLock.write(70);
  //H_frontDoorLock.attach(H_frontDoorLockPin);
  
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)

  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
  
  //Setup steppers
  rollerBlind.setMCP(&mcp,GB_rollerBlind_s1, GB_rollerBlind_s3, GB_rollerBlind_s2, GB_rollerBlind_s4);
  rollerBlind.setMaxSpeed(stepperMaxSpeed);

  //Setup RFID reader
  SPI.begin();        
  mfrc522.PCD_Init(); 
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
  
  rollerBlind.runSpeedToPosition();

  checkForRFIDCard();

  //In case an interrupt gets stuck
  if(!digitalRead(D4))
    clear_mcp_interrupts(mcp, MCP_interruptPins);
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

void checkForRFIDCard()
{
  //Let's just check every 2 seconds
  static uint64 prev = millis();
  if(millis()-prev < RFID_pollingIntervall)
    return; 

  prev = millis();

  if ( ! mfrc522.PICC_IsNewCardPresent())
        return;

  // Select one of the cards
  if ( ! mfrc522.PICC_ReadCardSerial())
      return;

  // Read the key
  String key= "";
  for (byte i = 0; i < mfrc522.uid.size; i++) 
  {
    key += String(mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    key += String(mfrc522.uid.uidByte[i], HEX);
  }
  key.toUpperCase();
  key = key.substring(1);

  StaticJsonDocument<48> doc;

  //Check if its authorized
  if(users.find(key)!= users.end())
  {
    isDoorOpen = !isDoorOpen;
    doc["user"] = users[key];
    doc["isLocked"] = isDoorOpen;
  }
  else
  {
    doc["user"] = "Unknown";
    doc["isLocked"] = isDoorOpen;
  }

  String message;
  serializeJson(doc, message);
  mqttClient.publish("update/Hall/lock/0",message.c_str());
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
    //H_frontDoorLock.write(doc["isLocked"] ? 70 : 120);
    sendUpdate = true;
  }

  //////////////////////////////////////////////////////////////////////

  topic.replace("control", "update");

  if(sendUpdate)
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}