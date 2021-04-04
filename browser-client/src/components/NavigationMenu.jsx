import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Card from "./Card";
import mqtt from "mqtt";
import "./NavigationMenu.css";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    let lampID = 0;
    let servoID = 0;
    let dimmerID = 0;
    let stepperID = 0;
    let switchID = 0;
    let tempSensorID = 0;
    let tempSetterID = 0;
    let lockID = 0;

    this.state = {
      client: mqtt.connect("mqtt://192.168.1.5:8888"),
      cards: [
        {
          title: "Living room",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++,
              name: "standing lamp",
              type: "lamp",
              isOn: true,
            },
            {
              id: 1,
              devId: switchID++,
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: tempSensorID++,
              name: "temperature",
              type: "temp-sensor",
              value: 23,
              unit: "°C",
            },
            {
              id: 3,
              devId: tempSetterID++,
              name: "set temperature",
              type: "temp-setter",
              value: 23,
              unit: "°C",
            },
            {
              id: 4,
              devId: servoID++,
              name: "window",
              type: "servo",
              value: 0,
              unit: "°",
            },
          ],
        },
        {
          title: "Main bedroom",
          type: "room",
          devices: [
            {
              id: 0,
              devId: dimmerID++,
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: switchID++,
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: stepperID++,
              name: "shutter",
              type: "stepper",
              value: 0,
              unit: "%",
            },
          ],
        },
        {
          title: "Guest bedroom",
          type: "room",
          devices: [
            {
              id: 0,
              devId: dimmerID++,
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: switchID++,
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: stepperID++,
              name: "shutter",
              type: "stepper",
              value: 0,
              unit: "%",
            },
          ],
        },
        {
          title: "Kitchen",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++,
              name: "under cabinet lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: lampID++,
              name: "kitchen island lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 2,
              devId: switchID++,
              name: "extractor fan",
              type: "switch",
              isOn: false,
            },
          ],
        },
        {
          title: "Hall",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++,
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: lockID++,
              name: "front door",
              type: "lock",
              isLocked: false,
            },
          ],
        },
        {
          title: "Garage",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++,
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: stepperID++,
              name: "garage door",
              type: "stepper",
              value: 0,
              unit: "%",
            },
          ],
        },
        {
          title: "Bathroom",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++,
              name: "lights",
              type: "lamp",
              isOn: false,
            },
          ],
        },
        {
          title: "Mood lighting",
          type: "rgb",
          devices: [
            {
              id: 0,
              name: "redLed",
              letter: "R",
              type: "rgb-led",
              value: 0,
            },
            {
              id: 1,
              name: "greenLed",
              letter: "G",
              type: "rgb-led",
              value: 0,
            },
            {
              id: 2,
              name: "blueLed",
              letter: "B",
              type: "rgb-led",
              value: 0,
            },
          ],
          effect: { effectID: 0, isActive: false },
        },
        {
          title: "History",
          type: "history",
        },
        {
          title: "Wheather",
          type: "wheather",
          measurments: {
            degrees: 23,
            humidity: 15,
            rain: 0,
            brightness: 60,
            wind: 10,
          },
        },
        {
          title: "General",
          type: "general",
          devices: [
            {
              id: 0,
              name: "room temperature",
              type: "temp-sensor",
              value: 20,
              unit: "°C",
            },
            {
              id: 1,
              devId: tempSetterID++,
              name: "set temperature",
              type: "temp-setter",
              value: 23,
              unit: "°C",
            },
            {
              id: 2,
              devId: switchID++,
              name: "power saving mode",
              type: "switch",
              isOn: false,
            },
            {
              id: 3,
              devId: switchID++,
              name: "main power",
              type: "switch",
              isOn: true,
            },
            {
              id: 4,
              devId: switchID++,
              name: "alarm",
              type: "switch",
              isOn: false,
            },
          ],
        },
      ],
      overview: {
        title: "Overview",
        isOn: true,
      },
    };
  }

  componentDidMount() {
    this.state.client.on("connect", () => this.onConnect());
    this.state.client.on("message", (topic, payload, packet) =>
      this.onMessage(topic, payload, packet)
    );
  }

  onConnect() {
    //Lets subscribe to the topics we are intrested in
    this.state.client.subscribe("update/test/#");
    console.log("connected to broker");
  }

  onMessage(topic, payload, packet) {
    console.log("message arrived: topic: " + topic + " mess.:" + payload);
  }

  handleChange = (card, device, propName, newValue) => {
    //Copy the cards array
    const cards = [...this.state.cards];

    //Copy the card that raised the event
    const index = cards.indexOf(card);
    cards[index] = { ...this.state.cards[index] };

    //Copy the devices of this card
    cards[index].devices = [...this.state.cards[index].devices];

    //Copy the device that raised the event
    const devIndex = cards[index].devices.indexOf(device);
    cards[index].devices[devIndex] = {
      ...this.state.cards[index].devices[devIndex],
    };

    //Set the new value for this device
    cards[index].devices[devIndex][propName] = newValue;
    const dev = cards[index].devices[devIndex];
    const topic =
      "update/test/" + cards[index].title + "/" + dev.type + "/" + dev.devId;
    this.state.client.publish(topic, "damn, it works!");
    console.log("message sent: " + card.title + "/" + dev.name);

    return cards;
  };

  handleSwitch = (card, device, newValue) => {
    const cards = this.handleChange(card, device, "isOn", newValue);
    this.setState({ cards });
  };

  handleSlider = (card, device, newValue) => {
    const cards = this.handleChange(card, device, "value", newValue);
    this.setState({ cards });
  };

  handleLockButton = (card, device, newValue) => {
    const cards = this.handleChange(card, device, "isLocked", newValue);
    this.setState({ cards });
  };

  handleStepper = (card, device, newValue) => {
    const cards = this.handleChange(card, device, "value", newValue);
    this.setState({ cards });
  };

  handleEffectCheckbox = (card, newValue) => {
    //Copy the cards array
    const cards = [...this.state.cards];

    //Copy the card that raised the event
    const index = cards.indexOf(card);
    cards[index] = { ...this.state.cards[index] };

    //Copy the effect of this card
    cards[index].effect = { ...this.state.cards[index].effect };

    //Set the new value for this device
    cards[index].effect.isActive = newValue;
    cards[index].effect.effectID = 0;

    this.setState({ cards });
  };

  handleEffectSelection = (card, newValue) => {
    //Copy the cards array
    const cards = [...this.state.cards];

    //Copy the card that raised the event
    const index = cards.indexOf(card);
    cards[index] = { ...this.state.cards[index] };

    //Copy the effect of this card
    cards[index].effect = { ...this.state.cards[index].effect };

    //Set the new value for this device
    cards[index].effect.effectID = newValue;

    this.setState({ cards });
  };

  render() {
    return (
      <div className="navMenuContainer">
        {this.state.cards.map((card) => {
          let { title } = card;
          return (
            <React.Fragment key={title}>
              <div className={"Tile " + title.replace(/\s+/g, "")}>
                <Link to={"home/" + title}>{title}</Link>
              </div>
              <Route
                path={"/home/" + title}
                render={(props) => (
                  <Card
                    {...props}
                    card={card}
                    onSwitchHandler={this.handleSwitch}
                    onSliderHandler={this.handleSlider}
                    onLockButtonHandler={this.handleLockButton}
                    onStepperHandler={this.handleStepper}
                    onEffectCheckboxHandler={this.handleEffectCheckbox}
                    onSelectEffectHandler={this.handleEffectSelection}
                  />
                )}
              />
            </React.Fragment>
          );
        })}
        <div
          className={"Tile " + this.state.overview.title.replace(/\s+/g, "")}
        >
          <label>{this.state.overview.title}</label>
          <div className="movementIndicator"></div>
          <div className="lightsIndicator"></div>
        </div>
      </div>
    );
  }
}

export default NavigationMenu;
