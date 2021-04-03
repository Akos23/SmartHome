import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Card from "./Card";
import "./NavigationMenu.css";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cards: [
        {
          title: "Living room",
          type: "room",
          devices: [
            { id: 0, name: "standing lamp", type: "lamp", isOn: true },
            { id: 1, name: "ceiling lights", type: "lamp", isOn: false },
            { id: 2, name: "dimmer lights", type: "slider", value: 0 },
            { id: 3, name: "door", type: "lock", isLocked: false },
            {
              id: 4,
              name: "window",
              type: "window-stepper",
              value: 0,
              unit: "°",
            },
          ],
        },
        {
          title: "Main bedroom",
          type: "room",
          devices: [{ id: 0, name: "wall lamp", type: "lamp", isOn: false }],
        },
        { title: "Guest bedroom", type: "room", devices: [] },
        { title: "Kitchen", type: "room", devices: [] },
        { title: "Hall", type: "room", devices: [] },
        { title: "Garage", type: "room", devices: [] },
        { title: "Bathroom", type: "room", devices: [] },
        {
          title: "Mood lighting",
          type: "rgb",
          devices: [
            {
              id: 0,
              name: "redLed",
              letter: "R",
              type: "rgb-slider",
              value: 0,
            },
            {
              id: 1,
              name: "greenLed",
              letter: "G",
              type: "rgb-slider",
              value: 0,
            },
            {
              id: 2,
              name: "blueLed",
              letter: "B",
              type: "rgb-slider",
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
              type: "indicator",
              value: 20,
              unit: "°C",
            },
            {
              id: 1,
              name: "set temperature",
              type: "temp-stepper",
              value: 23,
              unit: "°C",
            },
            { id: 2, name: "power saving mode", type: "switch", isOn: false },
            { id: 3, name: "main power", type: "switch", isOn: true },
            { id: 4, name: "alarm", type: "switch", isOn: false },
          ],
        },
      ],
      overview: {
        title: "Overview",
        isOn: true,
      },
    };
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
