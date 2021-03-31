import React, { Component } from "react";
import "./Slider.css";

class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 10,
    };
  }

  handleOnchange = () => {
    const slider = document.getElementById("sldr");
    const val = slider.value;
    console.log(val);
    this.setState({ value: val });
  };
  render() {
    return (
      <div className="slidecontainer">
        <input
          type="range"
          min="0"
          max="100"
          className="slider"
          value={this.state.value}
          onChange={() => this.handleOnchange()}
          id="sldr"
        />
      </div>
    );
  }
}

export default Slider;
