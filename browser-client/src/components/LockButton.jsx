import React, { Component } from "react";
import "./LockButton.css";
//import lockOpen from "./icons/lock_open.png";
//import lockClosed from "./icons/lock_closed.png";
import lockOpen from "./icons/r_lock_open.svg";
import lockClosed from "./icons/r_lock_closed.svg";

class LockButton extends Component {
  render() {
    const { isLocked, device, onClickHandler } = this.props;
    return (
      <div
        className="lockButton"
        onClick={() => onClickHandler(device, !isLocked)}
        data-locked={isLocked}
      >
        <img
          className="padlock"
          src={isLocked ? lockClosed : lockOpen}
          alt="padlock"
        />
      </div>
    );
  }
}

export default LockButton;
