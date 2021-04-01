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
      case "switch":
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
      case "indicator":
        component = <label>{dev.value}</label>;
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
      case "general":
      case "room":
        cardBody = card.devices.map((dev) => (
          <React.Fragment key={dev.id}>
            <p>{dev.name}</p>
            {this.renderControls(dev)}
          </React.Fragment>
        ));
        break;
      case "rgb":
        cardBody = (
          <React.Fragment>
            <div className="rgbSliderContainer">
              <p className="rgbRedLabel">R</p>
              <Slider />
              <p className="rgbRedValue">val</p>
              <p className="rgbGreenLabel">G</p>
              <Slider />
              <p className="rgbGreenValue">val</p>
              <p className="rgbBlueLabel">B</p>
              <Slider />
              <p className="rgbBlueValue">val</p>
            </div>
            <div className="rgbEffectContainer">
              <label className="rgbEffectCheckbox">
                <input type="checkbox" name="checkbox" value="value" />
                {"  activate lighting effect"}
              </label>
              <label className="rgbEffectRadio1">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect"}
              </label>
              <label className="rgbEffectRadio2">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect"}
              </label>
              <label className="rgbEffectRadio3">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect"}
              </label>
            </div>
          </React.Fragment>
        );
        break;
      case "history":
        cardBody = (
          <React.Fragment>
            <select className="customSelect">
              <option value="0">int the last hour</option>
              <option value="1">in the last day</option>
              <option value="2">in the last 2 days</option>
              <option value="3">in the last week</option>
              <option value="4">in the last 2 weeks</option>
            </select>

            <div className="logMsgContainer">
              <hr className="logMsgDecorlineTop" />
              <div className="messages">
                {card.logs.map((message) => (
                  <div className="messageBox">
                    <div>
                      <div>time: {message.time}</div>
                      <div>user: {message.name}</div>
                      <div>action: {message.action}</div>
                    </div>
                  </div>
                ))}
              </div>

              <hr className="logMsgDecorlineBottom" />
            </div>
          </React.Fragment>
        );
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
        <hr className="card_decorLine" />
        <div className={"card_body " + type}>
          {this.renderBody(this.props.card)}
        </div>
      </div>
    );
  }
}

export default Card;
