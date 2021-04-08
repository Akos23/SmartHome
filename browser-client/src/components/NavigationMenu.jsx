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
      client: mqtt.connect("mqtt://192.168.1.7:8888"),
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
              isOn: false,
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
              devId: 0,
              name: "redLed",
              letter: "R",
              type: "rgb-led",
              value: 0,
            },
            {
              id: 1,
              devId: 1,
              name: "greenLed",
              letter: "G",
              type: "rgb-led",
              value: 0,
            },
            {
              id: 2,
              devId: 2,
              name: "blueLed",
              letter: "B",
              type: "rgb-led",
              value: 0,
            },
            {
              id: 3,
              devId: 0,
              name: "light effect",
              type: "effect-selector",
              effectID: 0,
              isActive: false,
            },
          ],
          //effect: { effectID: 0, isActive: false },
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
        isOn: false,
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
    // Lets subscribe to the topics we are intrested in
    this.state.client.subscribe("update/#");
    this.state.client.subscribe("control/+/rgb-led/#");
    this.state.client.subscribe("control/+/dimmer/#");
    console.log("connected to broker");
  }

  onMessage(topic, payload, packet) {
    console.log("message arrived: topic: " + topic + " mess.:" + payload);

    //split topic into subtopics
    const subtopics = topic.toString().split("/");
    const card = this.state.cards.find((card) => card.title === subtopics[1]);

    if (subtopics[2] === "motion") {
      return;
    }

    const device = card.devices.find(
      (device) =>
        device.type === subtopics[2] && device.devId === parseInt(subtopics[3])
    );
    const propName = subtopics[4];
    const message = payload.toString();
    let newValue;
    switch (propName) {
      case "isOn":
      case "isLocked":
      case "isActive":
        newValue = message === "true" ? true : false;
        break;
      case "value":
      case "effectID":
        newValue = parseInt(message);
        break;
      default:
        newValue = "default";
    }
    console.log(
      `card: ${card} device: ${device} propName:${propName} newValue: ${newValue}`
    );

    this.handleChange(card, device, propName, newValue);
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
    console.log(cards[index].devices[devIndex]);
    //Set the new value for this device
    cards[index].devices[devIndex][propName] = newValue;
    console.log(this.state.cards[index].devices[devIndex]);
    console.log(cards[index]);

    this.setState({ cards });
  };

  handleSwitch = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/isOn`;
    this.state.client.publish(topic, newValue.toString());
  };

  handleSlider = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/value`;
    this.state.client.publish(topic, newValue.toString(), { retain: true });
  };

  handleLockButton = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/isLocked`;
    this.state.client.publish(topic, newValue.toString());
  };

  handleStepper = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/value`;
    this.state.client.publish(topic, newValue.toString());
  };

  handleEffectCheckbox = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0/isActive`;
    this.state.client.publish(topic, newValue.toString());
  };

  handleEffectSelection = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0/effectID`;
    this.state.client.publish(topic, newValue.toString());
  };

  handleEffectUpdate = (card, propName, newValue) => {
    //Copy the cards array
    const cards = [...this.state.cards];

    //Copy the card that raised the event
    const index = cards.indexOf(card);
    cards[index] = { ...this.state.cards[index] };

    //Copy the effect of this card
    cards[index].effect = { ...this.state.cards[index].effect };

    //Set the new value for this device
    if (propName === "effectID") {
      cards[index].effect.effectID = newValue;
    } else {
      cards[index].effect.isActive = newValue;
      cards[index].effect.effectID = 0;
    }

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
