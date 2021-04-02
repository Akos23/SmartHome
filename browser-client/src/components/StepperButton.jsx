import React, { Component } from "react";
import "./StepperButton.css";

class StepperButton extends Component {
  render() {
    const { value, unit, step, min, max, device, onClickHandler } = this.props;
    const putCloseOpenButtons = min && max ? true : false;
    console.log(putCloseOpenButtons);
    return (
      <div className="stepperContainer" data-minmax={putCloseOpenButtons}>
        {/*Close button (<<)*/}
        {putCloseOpenButtons && (
          <div
            className="stepperButton"
            onClick={() => {
              if (value === min) return;
              this.onClickHandler(min, device);
            }}
          >
            &laquo;
          </div>
        )}
        {/*Decrement button (<)*/}
        <div
          className="stepperButton"
          onClick={() => {
            if (value === min) return;
            const newValue = value - step < min ? min : value - step;
            this.onClickHandler(device, newValue);
          }}
        >
          &lsaquo;
        </div>
        <div>{value + unit}</div>
        {/*Increment button (>) */}
        <div
          className="stepperButton"
          onClick={() => {
            if (value === max) return;
            const newValue = value + step > max ? max : value + step;
            this.onClickHandler(newValue, device);
          }}
        >
          &rsaquo;
        </div>
        {/*Open button (>>) */}
        {putCloseOpenButtons && (
          <div
            className="stepperButton"
            onClick={() => {
              if (value === max) return;
              onClickHandler(max, device);
            }}
          >
            &raquo;
          </div>
        )}
      </div>
    );
  }
}

export default StepperButton;
