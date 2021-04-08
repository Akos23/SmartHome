#pragma once

#include <Adafruit_MCP23017.h>

constexpr uint8 MCP_GPIO_A0 = 0;
constexpr uint8 MCP_GPIO_A1 = 1;
constexpr uint8 MCP_GPIO_A2 = 2;
constexpr uint8 MCP_GPIO_A3 = 3;
constexpr uint8 MCP_GPIO_A4 = 4;
constexpr uint8 MCP_GPIO_A5 = 5;
constexpr uint8 MCP_GPIO_A6 = 6;
constexpr uint8 MCP_GPIO_A7 = 7;

constexpr uint8 MCP_GPIO_B0 = 8;
constexpr uint8 MCP_GPIO_B1 = 9;
constexpr uint8 MCP_GPIO_B2 = 10;
constexpr uint8 MCP_GPIO_B3 = 11;
constexpr uint8 MCP_GPIO_B4 = 12;
constexpr uint8 MCP_GPIO_B5 = 13;
constexpr uint8 MCP_GPIO_B6 = 14;
constexpr uint8 MCP_GPIO_B7 = 15;

void clear_mcp_interrupts(Adafruit_MCP23017& mcp, const std::vector<uint8>& interruptPins);

void setup_mcp(Adafruit_MCP23017& mcp, const std::vector<uint8>& interruptPins, const std::vector<uint8>& outputPins);