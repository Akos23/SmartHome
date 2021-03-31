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
        { title: "RGB", type: "rgb", devices: [] },
        { title: "History", type: "history", devices: [] },
        { title: "Wheather", type: "wheather", devices: [] },
        { title: "General", type: "general", devices: [] },
      ],
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
    return this.state.cards.map((card) => {
      let { title } = card;
      return (
        <React.Fragment key={title}>
          <div className={"Tile " + title.replace(/\s+/g, "")}>
            <Link to={title}>{title}</Link>
          </div>
          <Route
            path={"/" + title}
            render={(props) => (
              <Card card={card} handleSwitch={this.handleLightSwitch} />
            )}
          />
        </React.Fragment>
      );
    });
  }
}

export default NavigationMenu;
