#include <Arduino.h>
#include "_alarm.h"

void doAlarm(uint16 freq1, uint16 freq2, uint64 speed, uint8 pin)
{
  static uint64 alarmCounter = millis();
  static bool on = true;
  
  if(millis() - alarmCounter > speed){
    tone(pin, on ? freq1 : freq2);
    on = !on;
    alarmCounter = millis();
  }
}