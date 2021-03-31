import React, { Component } from "react";
import Switch from "./Switch";
import "./Card.css";
import Slider from "./Slider";
import LockButton from "./LockButton";
import StepperButton from "./StepperButton";
import clearSunny from "./icons/wheather/day_clear.svg";
import partialCloud from "./icons/wheather/day_partial_cloud.svg";
import cloudy from "./icons/wheather/cloudy.svg";
import rainy from "./icons/wheather/day_rain.svg";

class Card extends Component {
  onSwitchHandler = (device) => {
    this.props.handleSwitch(this.props.card, device);
  };

  renderControls = (dev) => {
    let component;
    switch (dev.type) {
      case "lamp":
        component = (
          <Switch device={dev} onClickHandler={this.onSwitchHandler} />
        );
        break;
      case "slider":
        component = <Slider />;
        break;
      case "lock":
        component = <LockButton />;
        break;
      case "stepper":
        component = <StepperButton />;
        break;
      default:
        component = <div>default</div>;
    }
    return component;
  };

  renderBody = (card) => {
    let cardBody;
    switch (card.type) {
      case "wheather":
        const { degrees, humidity, brightness, rain, wind } = card.measurments;
        cardBody = (
          <React.Fragment>
            <div>
              <p className="temperaturValue">{degrees}&#8451;</p>
            </div>
            <img className="wheatherImage" src={rainy} />
            <p className="wheatherLabel brightness">
              {" "}
              brightness : {brightness} %
            </p>
            <p className="wheatherLabel humidity">humidity : {humidity} % </p>
            <p className="wheatherLabel rain">precipitation : {rain} %</p>
            <p className="wheatherLabel wind">wind : {wind} km/h</p>
          </React.Fragment>
        );
        break;
      case "room":
        cardBody = card.devices.map((dev) => (
          <React.Fragment key={dev.id}>
            <p>{dev.name}</p>
            {this.renderControls(dev)}
          </React.Fragment>
        ));
        break;
      default:
        cardBody = <div>undefined card</div>;
    }
    return cardBody;
  };

  render() {
    const { title, type } = this.props.card;
    return (
      <div className="card ">
        <header className="card_header"> {title} </header>
        <hr />
        <div className={"card_body " + type}>
          {this.renderBody(this.props.card)}
        </div>
      </div>
    );
  }
}

export default Card;
