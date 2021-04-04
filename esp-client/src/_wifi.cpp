#include <_wifi.h>
#include <fstream>
#include "../wifi_credentials.h"

WiFiClient wifiClient;

void setup_wifi()
{
    //Start serial monitor
    Serial.begin(115200);

    Serial.print("\n Connecting to ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}