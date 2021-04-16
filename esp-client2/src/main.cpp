#include <Arduino.h>
#include <ArduinoJson.h>
#include <MFRC522.h>
#include <map>
#include "_wifi.h"
#include "_mqtt.h"
#include "_mcp23017.h"
#include "_AccelStepper.h"
#include "Servo.h"

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

//Connect rooler blind stepper motor to MCP
AccelStepper rollerBlind(AccelStepper::MotorInterfaceType::FULL4WIRE, 7,5,6,4, true, true);
const uint8 GB_rollerBlind_s1 = MCP_GPIO_B7;
const uint8 GB_rollerBlind_s2 = MCP_GPIO_B6;
const uint8 GB_rollerBlind_s3 = MCP_GPIO_B5;
const uint8 GB_rollerBlind_s4 = MCP_GPIO_B4;

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
const uint8 MCP_INTB = D4; //GPIO2 --> this can only function as an active low input becuase it is pulled high internally
const uint8 MCP_SDA = D2; //GPIO4 --> Wire.h already has a global TwoWire object initialized with these 2 pins
const uint8 MCP_SCL = D1; //GPIO5     and the mcp library uses that object by default, so we wont do anything with these pins

//Connect servos to the ESP
Servo MB_window;
const uint8 MB_windowServo = D6;

//Conncect the RFID reader to the ESP
const uint8 RFID_RST = D0;
const uint8 RFID_SDA = D8; //SS
MFRC522 mfrc522(RFID_SDA, RFID_RST);

//Authetnticated RFID tags
std::map<String,String> users = 
{
  {"01 02 03 04","Ákos Dabasi"},
  {"23 50 D0 18","Ildikó Orawetz"},
  {"B3 7A D0 18","László Dabasi"},
  {"B9 96 75 B3","Balázs Dabasi"}
};

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
  -1,     //security system
  -1,     //silent alarm
};

Servo* devIdToServo[] = 
{
  &MB_window,
  nullptr, //GB window
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
  &rollerBlind,
  nullptr,
};

//other constants
const uint64 RFID_pollingIntervall = 2000;

const uint stepperStepsPerRotation = 2038;
const uint stepperSpeed = 900;
const uint stepperMaxSpeed = 1000;

//Forward declarations
extern PubSubClient mqttClient;
ICACHE_RAM_ATTR void ISR_movementChanged();
void checkForRFIDCard();

//global variables
Adafruit_MCP23017 mcp;
bool isSecuritySystemOn = false;
bool isAlarmOn = false;
bool isDoorOpen = false;

void setup() {
  //Connect to local network
  setup_wifi();
  
  //Setup MCP with interrupt
  //On MCP: interrupt on change
  //On ESP: interrupt on Falling edge (active low)
  setup_mcp(mcp, MCP_interruptPins, MCP_outputPins);
  pinMode(MCP_INTB, INPUT);
  attachInterrupt(digitalPinToInterrupt(MCP_INTB), ISR_movementChanged, FALLING);
  
  //Setup RFID reader
  SPI.begin();        
  mfrc522.PCD_Init(); 

  //Setup steppers
  rollerBlind.setMCP(&mcp,GB_rollerBlind_s1, GB_rollerBlind_s3, GB_rollerBlind_s2, GB_rollerBlind_s4);
  rollerBlind.setMaxSpeed(stepperMaxSpeed);

  //Setup servos
  MB_window.attach(MB_windowServo);
}

void loop() {
  
  if (!mqttClient.connected())
  {
    reconnect();
  }
  //this function keeps the connection alive and calls the onMessage function whenever
  //a message arrives on one of the topics we subscribed to
  mqttClient.loop();
  
  checkForRFIDCard();

  rollerBlind.runSpeedToPosition();
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
  doc["name"] = "A Bad Person";
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
    doc["name"] = users[key];
    doc["isLocked"] = isDoorOpen;
  }
  else
  {
    doc["name"] = "Unknown";
    doc["isLocked"] = isDoorOpen;
  }

  String message;
  serializeJson(doc, message);
  mqttClient.publish("update/Hall/lock/0",message.c_str());

  prev = millis();
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
    uint newValue = doc["value"];

    Servo* servo = devIdToServo[devId];

    if(!servo)
      return;
    
    uint setPoint = map(newValue,0,100,0,90);
    servo->write(setPoint);
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

  //TODO: RGB, History(RFID), Wheather(sensors)

  //////////////////////////////////////////////////////////////////////

  topic.replace("control", "update");

  if(sendUpdate)
  {
    bool retain = true; //broker will store the last message so when a new brower-client connect it will get this message and will know the current state
    mqttClient.publish(topic.c_str(), message.c_str(), retain);
  }
}