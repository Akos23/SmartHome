#include <_wifi.h>
#include <fstream>
#include "../wifi_credentials.h"

WiFiClient wifiClient;

void setup_wifi()
{
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
    }
}