import React, { Component } from "react";
import warningsign from "./icons/warning.svg";
import "./SecurityAlert.css";

class SecurityAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { onButtonHandler } = this.props;
    return (
      <div className="alert">
        <img src={warningsign} />
        <p>Someone entered your home!</p>
        <button onClick={() => onButtonHandler()}>Turn off alarm</button>
      </div>
    );
  }
}

export default SecurityAlert;
