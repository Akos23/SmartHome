import React, { Component } from "react";
import "./Slider.css";

class Slider extends Component {
  render() {
    const { value, min, max, device, onChangeHandler } = this.props;
    return (
      <div className="sliderContainer">
        <input
          type="range"
          min={min}
          max={max}
          className="slider"
          id={device.id}
          value={value}
          onChange={() => {
            const slider = document.getElementById(device.id);
            const newValue = slider.value;
            console.log(newValue);
            onChangeHandler(device, newValue);
          }}
        />
      </div>
    );
  }
}

Slider.defaultProps = {
  min: 0,
  max: 100,
};
export default Slider;
