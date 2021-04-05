import React, { Component } from "react";
import "./LoginForm.css";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleSubmit = (e) => {
    e.preventDefault();
    console.log("onsubmit");
    this.props.history.push("/home");
  };
  render() {
    return (
      <form className="loginForm" onSubmit={this.handleSubmit}>
        <div className="loginContainer">
          <label htmlFor="username" className="login">
            Login
          </label>
          <input
            id="username"
            type="text"
            autoComplete="off"
            placeholder="username"
          />
          <input id="password" type="text" placeholder="password" />
          <button className="loginButton">May I come in?</button>
        </div>
      </form>
    );
  }
}

export default LoginForm;
