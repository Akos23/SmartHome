import React, { Component } from "react";
import "./StepperButton.css";

class StepperButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 10,
    };
  }

  handleOnClickOpen = () => {
    this.setState({ value: 100 });
  };
  handleOnClickClose = () => {
    this.setState({ value: 0 });
  };
  handleOnIncrement = () => {
    const value = this.state.value + 10 > 100 ? 100 : this.state.value + 10;
    this.setState({ value });
  };
  handleOnDecrement = () => {
    const value = this.state.value - 10 < 0 ? 0 : this.state.value - 10;
    this.setState({ value });
  };
  render() {
    return (
      <div className="stepperContainer">
        <div
          className="stepperButton closeButton"
          onClick={() => this.handleOnClickClose()}
        >
          &laquo;
        </div>
        <div
          className="stepperButton decrement"
          onClick={() => this.handleOnDecrement()}
        >
          &lsaquo;
        </div>
        <div>{this.state.value + "%"}</div>
        <div
          className="stepperButton increment"
          onClick={() => this.handleOnIncrement()}
        >
          &rsaquo;
        </div>
        <div
          className="stepperButton openButton"
          onClick={() => this.handleOnClickOpen()}
        >
          &raquo;
        </div>
      </div>
    );
  }
}

export default StepperButton;
