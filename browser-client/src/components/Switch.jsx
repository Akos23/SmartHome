import React, { Component } from "react";
import "./Switch.css";

class Switch extends Component {
  render() {
    const { className, device, onClickHandler } = this.props;
    return (
      <input
        className={"switch " + (className ? className : "")}
        type="checkbox"
        checked={device.isOn}
        onChange={() => onClickHandler(this.props.device)}
      />
    );
  }
}

export default Switch;
