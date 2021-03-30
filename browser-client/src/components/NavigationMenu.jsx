import React, { Component } from "react";
import { Route, Link } from "react-router-dom";
import Card from "./Card";
import "./NavigationMenu.css";

class NavigationMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tiles: [
        "Living room",
        "Main bedroom",
        "Guest bedroom",
        "Kitchen",
        "Hall",
        "Garage",
        "Bathroom",
        "RGB",
        "History",
        "Wheather",
        "General",
      ],
    };
  }
  render() {
    return this.state.tiles.map((title) => (
      <React.Fragment>
        <div className={"Tile " + title}>
          <Link to={title}>{title}</Link>
        </div>
        <Route path={"/" + title} render={(props) => <Card title={title} />} />
      </React.Fragment>
    ));
  }
}

export default NavigationMenu;
