import React, { Component, Fragment } from "react";
import "./Card.css";

class Card extends Component {
  render() {
    const {
      title,
    } = this.props;
    return (
      <div className={"card " + title} >
        <header className="card_header"> {title} </header>
        <hr />
        <div className="card_body">
          Controls...
        </div>
      </div>
    );
  }
}

export default Card;
