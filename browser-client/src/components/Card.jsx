import React, { Component } from "react";
import Switch from "./Switch";
import "./Card.css";

class Card extends Component {
  onSwitchHandler = (device) => {
    this.props.handleSwitch(this.props.card, device);
  };

  renderControl = (dev) => {
    let component;
    switch (dev.type) {
      case "lamp":
        component = (
          <Switch device={dev} onClickHandler={this.onSwitchHandler} />
        );
        break;
      default:
        component = <div>default</div>;
    }
    return component;
  };

  render() {
    const { title, type, devices } = this.props.card;
    return (
      <div className="card ">
        <header className="card_header"> {title} </header>
        <hr />
        <div className={"card_body " + type}>
          {devices.map((dev) => (
            <React.Fragment>
              <p>{dev.name}</p>
              {this.renderControl(dev)}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}

export default Card;
