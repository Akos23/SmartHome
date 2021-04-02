import React, { Component } from "react";
import "./StepperButton.css";

class StepperButton extends Component {
  render() {
    const { value, unit, step, min, max, device, onClickHandler } = this.props;
    const putCloseOpenButtons = min !== undefined && max !== undefined;
    return (
      <div className="stepperContainer" data-minmax={putCloseOpenButtons}>
        {/*Close button (<<)*/}
        {putCloseOpenButtons && (
          <div
            className="stepperButton"
            onClick={() => {
              if (value === min) return;
              onClickHandler(device, min);
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
            onClickHandler(device, newValue);
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
            onClickHandler(device, newValue);
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
              onClickHandler(device, max);
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
