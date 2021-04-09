#pragma once
#include <PubSubClient.h>

void reconnect();
void onMessage(String topic, byte *payload, unsigned int length);

std::vector<String> getSubTopics(String topic);
String payloadToString(byte *payload, uint length);