import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Card from "./Card";
import "./NavigationMenu.css";
import SecurityAlert from "./SecurityAlert";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);

    //what are we gonna do here if we are not connected?
    //if (!this.props.client) this.props.history.push("/");

    let lampID = 0;
    let servoID = 0;
    let dimmerID = 0;
    let stepperID = 0;
    let switchID = 0;
    let tempSensorID = 0;
    let tempSetterID = 0;
    let lockID = 0;

    this.state = {
      cards: [
        {
          title: "Living room",
          type: "room",
          devices: [
            {
              id: 0,
              devId: lampID++, //0
              name: "standing lamp",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: switchID++, //0
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: tempSensorID++, //0
              name: "temperature",
              type: "temp-sensor",
              value: 23,
              unit: "°C",
            },
            {
              id: 3,
              devId: tempSetterID++, //0
              name: "set temperature",
              type: "temp-setter",
              value: 23,
              unit: "°C",
            },
            {
              id: 4,
              devId: servoID++, //0
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
              devId: dimmerID++, //0
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: switchID++, //1
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: stepperID++, //0
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
              devId: dimmerID++, //1
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: switchID++, //2
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: stepperID++, //1
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
              devId: lampID++, //1
              name: "under cabinet lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: lampID++, //2
              name: "kitchen island lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 2,
              devId: switchID++, //3
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
              devId: lampID++, //3
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: lockID++, //0
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
              devId: lampID++, //4
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: stepperID++, //2
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
              devId: lampID++, //5
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
              devId: tempSetterID++, //1
              name: "set temperature",
              type: "temp-setter",
              value: 23,
              unit: "°C",
            },
            {
              id: 2,
              devId: switchID++, //4
              name: "power saving mode",
              type: "switch",
              isOn: false,
            },
            {
              id: 3,
              devId: switchID++, //5
              name: "main power",
              type: "switch",
              isOn: true,
            },
            {
              id: 4,
              devId: switchID++, //6
              name: "security system",
              type: "switch",
              isOn: false,
            },
            {
              id: 5,
              devId: switchID++, //7
              name: "silent alarm",
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
    const { client } = this.props;
    //Specify the function that will handle incoming messages
    if (client) {
      client.on("message", (topic, payload, packet) =>
        this.onMessage(topic, payload, packet)
      );
      client.options.reconnectPeriod = 2000;
    }
  }

  onMessage(topic, payload, packet) {
    console.log("message arrived: topic: " + topic + " mess.:" + payload);

    //split topic into subtopics
    const subtopics = topic.toString().split("/");

    //We wont handle the following topics here:
    if (subtopics[2] === "motion") {
      return;
    }

    if (subtopics[1] === "history") {
      return;
    }

    if (subtopics[0] === "debug") {
      return;
    }

    const card = this.state.cards.find((card) => card.title === subtopics[1]);
    const device = card.devices.find(
      (device) =>
        device.type === subtopics[2] && device.devId === parseInt(subtopics[3])
    );
    const propName = subtopics[4];

    const message = payload.toString();

    //Check if everything has a valid value
    if (!(device && propName && message && card)) {
      console.log("invalid topic or message");
      return;
    }

    //Lets update here what we have to:
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

    if (device.name === "security system") {
      const action = newValue
        ? "armed the security system"
        : "disarmed the security system";
      const message = `${this.props.username},${action}`;
      this.props.client.publish(
        /*"logger/history", message*/ "notifications",
        "intrusion"
      );
    }

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
    //Set the new value for this device
    cards[index].devices[devIndex][propName] = newValue;

    this.setState({ cards });
  };

  handleSwitch = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/isOn`;
    this.props.client.publish(topic, newValue.toString());
  };

  handleSlider = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/value`;
    this.props.client.publish(topic, newValue.toString(), { retain: true });
  };

  handleLockButton = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/isLocked`;
    this.props.client.publish(topic, newValue.toString());
  };

  handleStepper = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}/value`;
    this.props.client.publish(topic, newValue.toString());
  };

  handleEffectCheckbox = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0/isActive`;
    this.props.client.publish(topic, newValue.toString());
  };

  handleEffectSelection = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0/effectID`;
    this.props.client.publish(topic, newValue.toString());
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

  handleAlarm = () => {
    this.props.history.push("/home");
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
          {/*<div className="movementIndicator"></div>
          <div className="lightsIndicator"></div>*/}
        </div>
        <Route
          path={"/home/intrusion"}
          render={(props) => (
            <SecurityAlert {...props} onButtonHandler={this.handleAlarm} />
          )}
        />
      </div>
    );
  }
}

export default NavigationMenu;
