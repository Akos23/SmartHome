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
  renderControls = (dev) => {
    const {
      card,
      onSwitchHandler,
      onSliderHandler,
      onLockButtonHandler,
      onStepperHandler,
    } = this.props;
    let component;
    switch (dev.type) {
      case "switch":
      case "lamp":
        component = (
          <Switch
            device={dev}
            onClickHandler={(device, newValue) =>
              onSwitchHandler(card, device, newValue)
            }
          />
        );
        break;
      case "slider":
        component = (
          <Slider
            value={dev.value}
            device={dev}
            onChangeHandler={(device, newValue) =>
              onSliderHandler(card, device, newValue)
            }
          />
        );
        break;
      case "lock":
        component = (
          <LockButton
            isLocked={dev.isLocked}
            device={dev}
            onClickHandler={(device, newValue) =>
              onLockButtonHandler(card, device, newValue)
            }
          />
        );
        break;
      case "window-stepper":
        component = (
          <StepperButton
            value={dev.value}
            unit={dev.unit}
            step={10}
            min={0}
            max={120}
            device={dev}
            onClickHandler={(device, newValue) =>
              onStepperHandler(card, device, newValue)
            }
          />
        );
        break;
      case "temp-stepper":
        component = (
          <StepperButton
            value={dev.value}
            unit={dev.unit}
            step={1}
            device={dev}
            onClickHandler={(device, newValue) =>
              onStepperHandler(card, device, newValue)
            }
          />
        );
        break;
      case "indicator":
        component = <label>{dev.value + dev.unit}</label>;
        break;
      default:
        component = <div>default</div>;
    }
    return component;
  };

  renderBody = () => {
    let cardBody;
    const { card, onSliderHandler } = this.props;
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
            <p className="wheatherLabel rain">precipitation : {rain} mm</p>
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
        const { redLed, greenLed, blueLed } = card.rgbLight;
        cardBody = (
          <React.Fragment>
            <div className="rgbSliderContainer">
              <p className="rgbRedLabel">R</p>
              <Slider
                value={redLed.value}
                min={0}
                max={255}
                device={redLed}
                onChangeHandler={(device, newValue) =>
                  onSliderHandler(card, device, newValue)
                }
              />
              <p className="rgbRedValue">{redLed.value}</p>
              <p className="rgbGreenLabel">G</p>
              <Slider
                value={greenLed.value}
                min={0}
                max={255}
                device={greenLed}
                onChangeHandler={(device, newValue) =>
                  onSliderHandler(card, device, newValue)
                }
              />
              <p className="rgbGreenValue">{greenLed.value}</p>
              <p className="rgbBlueLabel">B</p>
              <Slider
                value={blueLed.value}
                min={0}
                max={255}
                device={blueLed}
                onChangeHandler={(device, newValue) =>
                  card.onSliderHandler(card, device, newValue)
                }
              />
              <p className="rgbBlueValue">{blueLed.value}</p>
            </div>
            <div className="rgbEffectContainer">
              <label className="rgbEffectCheckbox">
                <input type="checkbox" name="checkbox" value="value" />
                {"  activate lighting effect"}
              </label>
              <label className="rgbEffectRadio1">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect1"}
              </label>
              <label className="rgbEffectRadio2">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect2"}
              </label>
              <label className="rgbEffectRadio3">
                <input type="radio" name="rgbEffect" value="value" />
                {"  effect3"}
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
        <div className={"card_body " + type}>{this.renderBody()}</div>
      </div>
    );
  }
}

export default Card;
