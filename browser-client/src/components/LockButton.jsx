import React, { Component } from "react";
import "./LockButton.css";
//import lockOpen from "./icons/lock_open.png";
//import lockClosed from "./icons/lock_closed.png";
import lockOpen from "./icons/r_lock_open.svg";
import lockClosed from "./icons/r_lock_closed.svg";

class LockButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locked: true,
    };
  }
  onClickHandler = () => {
    const locked = !this.state.locked;
    this.setState({ locked });
  };
  render() {
    return (
      <div
        className="lockButton"
        onClick={() => this.onClickHandler()}
        data-locked={this.state.locked}
      >
        <img
          className="padlock"
          src={this.state.locked ? lockOpen : lockClosed}
          alt="image of a padlock"
        />
      </div>
    );
  }
}

export default LockButton;
