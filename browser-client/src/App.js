import { Component } from "react";
import { Route } from "react-router";
import { ToastContainer, toast } from "react-toastify";
import NavigationMenu from "./components/NavigationMenu";
import LoginForm from "./components/LoginForm";
import mqtt from "mqtt";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";

class App extends Component {
  state = {
    client: undefined,
    account: { username: "", password: "" },
    error: "",
  };

  handleLogin = (e, history) => {
    //Don't reload the resources
    e.preventDefault();

    //Try to connect to the mqtt server with the given credentials
    const client = mqtt.connect("mqtt://192.168.1.19:8888", this.state.account);

    //What should we do if we can or cannot connect?
    client.on("connect", () => this.onConnect(history));
    client.on("error", (err) => this.onError(err));

    //Try to connect only once
    client.options.reconnectPeriod = 0;

    this.setState({ client });
  };

  //If we couldn't connect show an error message
  onError(err) {
    console.log("error");
    toast.error(err.toString(), {
      position: "top-center",
      autoClose: true,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }

  //We are connected...
  onConnect(history) {
    // Lets subscribe to the topics we are intrested in
    this.state.client.subscribe("update/#");
    this.state.client.subscribe("debug"); //here we can send debug information from ESP so we dont have to use the serial monitor
    this.state.client.subscribe("control/+/rgb-led/#");
    this.state.client.subscribe("control/+/dimmer/#");
    console.log("connected to broker");

    //Now we redirect the user to the navigation menu
    history.push("/home");
  }

  handleAccountChange = (e) => {
    const account = { ...this.state.account };
    account[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ account });
  };

  render() {
    return (
      <div className="App">
        <ToastContainer />
        <Route
          path="/home"
          render={(props) => (
            <NavigationMenu {...props} client={this.state.client} />
          )}
        />
        <Route
          path="/"
          exact
          render={(props) => (
            <LoginForm
              {...props}
              username={this.state.account.username}
              password={this.state.account.password}
              onChangeHandler={this.handleAccountChange}
              onSubmitHandler={this.handleLogin}
            />
          )}
        />
      </div>
    );
  }
}

export default App;
