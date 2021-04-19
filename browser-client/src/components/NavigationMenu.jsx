import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Card from "./Card";
import "./NavigationMenu.css";
import SecurityAlert from "./SecurityAlert";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);

    //what are we gonna do here if we are not connected?
    if (!this.props.client) this.props.history.push("/");

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
              devId: 0, //0
              name: "standing lamp",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: 0, //0
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: 0, //0
              name: "temperature",
              type: "temp-sensor",
              value: 23,
              unit: "°C",
            },
            {
              id: 3,
              devId: 0, //0
              name: "set temperature",
              type: "temp-setter",
              value: 23,
              unit: "°C",
            },
            {
              id: 4,
              devId: 0, //0
              name: "sliding door",
              type: "stepper",
              value: 0,
              unit: "%",
            },
          ],
        },
        {
          title: "Main bedroom",
          type: "room",
          devices: [
            {
              id: 0,
              devId: 0, //0
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: 0, //1
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: 1, //1
              name: "roller blind",
              type: "stepper",
              value: 0,
              unit: "%",
            },
            {
              id: 4,
              devId: 0, //0
              name: "right window",
              type: "servo",
              value: 0,
              unit: "°",
              min: 0,
              max: 90,
            },
            {
              id: 5,
              devId: 1, //1
              name: "left window",
              type: "servo",
              value: 0,
              unit: "°",
              min: 0,
              max: 90,
            },
          ],
        },
        {
          title: "Guest bedroom",
          type: "room",
          devices: [
            {
              id: 0,
              devId: 1, //1
              name: "dimmer lights",
              type: "dimmer",
              value: 0,
            },
            {
              id: 1,
              devId: 2, //2
              name: "TV",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: 2, //2
              name: "roller blind",
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
              devId: 1, //1
              name: "under cabinet lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: 2, //2
              name: "kitchen island lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 2,
              devId: 3, //3
              name: "exhaust fan",
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
              devId: 3, //3
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: 0, //0
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
              devId: 4, //4
              name: "lights",
              type: "lamp",
              isOn: false,
            },
            {
              id: 1,
              devId: 3, //3
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
              devId: 5, //5
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
              devId: 4, //4
              name: "power saving mode",
              type: "switch",
              isOn: false,
            },
            {
              id: 2,
              devId: 5, //5
              name: "main power",
              type: "switch",
              isOn: true,
            },
            {
              id: 3,
              devId: 6, //6
              name: "security system",
              type: "switch",
              isOn: false,
            },
            {
              id: 4,
              devId: 7, //7
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
      isAlarmOn: false,
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

  onMessage(topic, message) {
    console.log("message arrived: topic: " + topic + " mess.:" + message);

    //split topic into subtopics
    const subtopics = topic.toString().split("/");

    //Topic for debugging purposes
    if (subtopics[0] === "debug") {
      return;
    }

    //motion detection: update/room/motion
    if (subtopics[2] === "motion") {
      return;
    }

    const data = JSON.parse(message.toString());

    //update/alarm
    if (subtopics[1] === "alarm") {
      this.setState({ isAlarmOn: data.isOn });
      return;
    }

    //From here we know we should have this format:
    //  update/card/devType/devId
    //  control/card/dimmer/devId
    //  control/card/rgb-led/devId

    const card = this.state.cards.find((card) => card.title === subtopics[1]);
    const device = card.devices.find(
      (device) =>
        device.type === subtopics[2] && device.devId === parseInt(subtopics[3])
    );

    //Check if everything has a valid value
    if (!(device && card && data)) {
      console.log("invalid topic or message");
      return;
    }

    //Let's update the user interface
    this.updateUI(card, device, data);
  }

  //STATE UPDATES
  updateUI = (card, device, data) => {
    //Copy the cards array
    const cards = [...this.state.cards];

    //Copy the card that raised the event
    const index = cards.indexOf(card);
    cards[index] = { ...this.state.cards[index] };

    //Copy the devices of this card
    cards[index].devices = [...this.state.cards[index].devices];

    //Copy the device that raised the event and merge it with the new data
    const devIndex = cards[index].devices.indexOf(device);
    cards[index].devices[devIndex] = {
      ...this.state.cards[index].devices[devIndex],
      ...data,
    };

    this.setState({ cards });
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

  // EVENT HANDLERS - Sending messegas to broker
  handleSwitch = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}`;
    const message = {
      isOn: newValue,
      user: this.props.username,
    };
    this.props.client.publish(topic, JSON.stringify(message), { retain: true });
  };

  handleSlider = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}`;
    const message = {
      value: newValue,
    };
    this.props.client.publish(topic, JSON.stringify(message));
  };

  handleLockButton = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}`;
    const message = {
      isLocked: newValue,
      user: this.props.username,
    };
    this.props.client.publish(topic, JSON.stringify(message));
  };

  handleStepper = (card, device, newValue) => {
    const topic = `control/${card.title}/${device.type}/${device.devId}`;
    const message = {
      value: newValue,
    };
    this.props.client.publish(topic, JSON.stringify(message));
  };

  handleEffectCheckbox = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0`;
    const message = {
      isActive: newValue,
      effectID: card.devices[3].effectID,
    };
    this.props.client.publish(topic, JSON.stringify(message));
  };

  handleEffectSelection = (card, newValue) => {
    const topic = `control/${card.title}/effect-selector/0`;
    const message = {
      isActive: true,
      effectID: newValue,
    };
    this.props.client.publish(topic, JSON.stringify(message));
  };

  handleAlarm = () => {
    const { client, history } = this.props;
    this.setState({ isAlarmOn: false });
    const message = {
      isOn: false,
      user: this.props.username,
    };
    this.props.client.publish("control/alarm", JSON.stringify(message), {
      retain: true,
    });
    this.props.client.publish(
      "control/General/switch/6",
      JSON.stringify(message),
      { retain: true }
    );
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
        {/*<Route
          path={"/home/intrusion"}
          render={(props) => (
            <SecurityAlert {...props} onButtonHandler={this.handleAlarm} />
          )}
          />*/}
        {this.state.isAlarmOn && (
          <SecurityAlert onButtonHandler={this.handleAlarm} />
        )}
      </div>
    );
  }
}

export default NavigationMenu;
