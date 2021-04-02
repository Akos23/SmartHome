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
            { id: 2, name: "dimmer lights", type: "slider" },
            { id: 3, name: "door", type: "lock" },
            { id: 4, name: "window", type: "stepper" },
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
        { title: "Mood lighting", type: "rgb", devices: [] },
        {
          title: "History",
          type: "history",
          logs: [
            {
              time: "01/04/2021 08:55",
              name: "Dabasi Akos",
              action: "opened front door",
            },
            {
              time: "01/04/2021 08:55",
              name: "Dabasi Akos",
              action: "turned off the alarm",
            },
            {
              time: "01/04/2021 09:55",
              name: "Dabasi Akos",
              action: "closed front door",
            },
            {
              time: "01/04/2021 09:55",
              name: "Dabasi Akos",
              action: "set alarm",
            },
            {
              time: "01/04/2021 10:55",
              name: "Unknown",
              action: "tried to open front door",
            },
            { time: "01/04/2021 11:55", name: " - ", action: "alarm went off" },
            {
              time: "01/04/2021 12:00",
              name: "Dabasi Akos",
              action: "turned off alarm",
            },
            {
              time: "01/04/2021 13:55",
              name: "Dabasi Akos",
              action: "opened front door",
            },
          ],
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
              value: "23°C",
            },
            { id: 1, name: "set temperature", type: "stepper" },
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

  handleLightSwitch = (card, device) => {
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
    cards[index].devices[devIndex].isOn = !cards[index].devices[devIndex].isOn;

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
                    handleSwitch={this.handleLightSwitch}
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
