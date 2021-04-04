#pragma once
#include <PubSubClient.h>

void reconnect();
void onMessage(String topic, byte *payload, unsigned int length);
