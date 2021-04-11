import React, { Component } from "react";
import "./LoginForm.css";

class LoginForm extends Component {
  render() {
    const { username, password, onChangeHandler, onSubmitHandler } = this.props;
    return (
      <form
        className="loginForm"
        onSubmit={(e) => onSubmitHandler(e, this.props.history)}
      >
        <div className="loginContainer">
          <label htmlFor="username" className="login">
            Login
          </label>
          <input
            id="username"
            name="username"
            value={username}
            onChange={(e) => onChangeHandler(e)}
            type="text"
            autoComplete="off"
            placeholder="username"
          />
          <input
            id="password"
            name="password"
            value={password}
            onChange={(e) => onChangeHandler(e)}
            type="password"
            autoComplete="off"
            placeholder="password"
          />
          <button className="loginButton">May I come in?</button>
        </div>
      </form>
    );
  }
}

export default LoginForm;
