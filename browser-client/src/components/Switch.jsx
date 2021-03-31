import React, { Component } from "react";
import "./Switch.css";

class Switch extends Component {
  render() {
    const { type, isOn } = this.props.device;
    return (
      <input
        className={"switch " + type}
        type="checkbox"
        checked={isOn}
        onChange={() => this.props.onClickHandler(this.props.device)}
      />
    );
  }
}

export default Switch;
