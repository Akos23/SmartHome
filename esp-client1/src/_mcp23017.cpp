#include <vector>
#include <Arduino.h>
#include "_mcp23017.h"

void clear_mcp_interrupts(Adafruit_MCP23017& mcp, const std::vector<uint8>& interruptPins)
{
    for (uint i = 0; i < interruptPins.size(); i++)
    {
        mcp.digitalRead(interruptPins[i]);
    }
}
void setup_mcp(Adafruit_MCP23017& mcp, const std::vector<uint8>& interruptPins, const std::vector<uint8>& outputPins)
{
    mcp.begin();

    //mirror INTA and INTB, in case of an interrupt send a logical LOW signal
    mcp.setupInterrupts(true, false, LOW);

    //Trigger an interrupt on input value changes
    for (uint i = 0; i < interruptPins.size(); i++)
    {
        uint8 pin = interruptPins[i];
        mcp.pinMode(pin, INPUT);
        mcp.setupInterruptPin(pin, CHANGE);
    }

    clear_mcp_interrupts(mcp, interruptPins);

    //Set up output pins
    for (uint i = 0; i < outputPins.size(); i++)
    {
        uint8 pin = outputPins[i];
        mcp.pinMode(pin, OUTPUT);
    }
    
}