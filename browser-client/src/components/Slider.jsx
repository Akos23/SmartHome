import React, { Component } from "react";
import "./Slider.css";

class Slider extends Component {
  render() {
    const { value, device, onChangeHandler } = this.props;
    return (
      <div className="sliderContainer">
        <input
          type="range"
          min="0"
          max="100"
          className="slider"
          id={device.id}
          value={value}
          onChange={() => {
            const slider = document.getElementById(device.id);
            const newValue = slider.value;
            console.log(newValue);
            onChangeHandler(newValue, device);
          }}
        />
      </div>
    );
  }
}

export default Slider;
