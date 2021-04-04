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
import HistorViewer from "./HistoryViewer";
import LightEffectSelector from "./LightEffectSelector";

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
      case "dimmer":
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
      case "rgb-led":
        component = (
          <Slider
            value={dev.value}
            min={0}
            max={255}
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
      case "servo":
      case "stepper":
        component = (
          <StepperButton
            value={dev.value}
            unit={dev.unit}
            step={10}
            min={0}
            max={100}
            device={dev}
            onClickHandler={(device, newValue) =>
              onStepperHandler(card, device, newValue)
            }
          />
        );
        break;
      case "temp-setter":
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
      case "temp-sensor":
        component = <label>{dev.value + dev.unit}</label>;
        break;
      case "effect-selector":
        component = "";
        break;
      default:
        component = <div>default</div>;
    }
    return component;
  };

  renderBody = () => {
    let cardBody;
    const { card, onEffectCheckboxHandler, onSelectEffectHandler } = this.props;
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
        cardBody = (
          <React.Fragment>
            <div className="rgbSliderContainer">
              {card.devices.map((dev) => (
                <React.Fragment key={dev.id}>
                  <p className={dev.name + "Label"}>{dev.letter}</p>
                  {this.renderControls(dev)}
                  <p className={dev.name + "Value"}>{dev.value}</p>
                </React.Fragment>
              ))}
            </div>
            <LightEffectSelector
              effectSelector={card.devices.find(
                (dev) => dev.type === "effect-selector"
              )}
              onCheckHandler={(newValue) =>
                onEffectCheckboxHandler(card, newValue)
              }
              onSelectHandler={(newEffectID) =>
                onSelectEffectHandler(card, newEffectID)
              }
            />
          </React.Fragment>
        );
        break;
      case "history":
        cardBody = <HistorViewer />;
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
