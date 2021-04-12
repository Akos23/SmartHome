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

  mqtt_server = "mqtt://192.168.1.19:8888";
  mqtt_topics = [
    "update/#",
    "debug",
    "control/+/rgb-led/#",
    "control/+/dimmer/#",
  ];
  handleLogin = (e, history) => {
    //Don't reload the resources
    e.preventDefault();

    //Try to connect to the mqtt server with the given credentials
    const client = mqtt.connect(this.mqtt_server, this.state.account);

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
    for (let i = 0; i < this.mqtt_topics.length; i++) {
      this.state.client.subscribe(this.mqtt_topics[i]);
    }

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
    const { client, account } = this.state;
    return (
      <div className="App">
        <ToastContainer />
        <Route
          path="/home"
          render={(props) => (
            <NavigationMenu
              {...props}
              client={client}
              username={account.username}
            />
          )}
        />
        <Route
          path="/"
          exact
          render={(props) => (
            <LoginForm
              {...props}
              username={account.username}
              password={account.password}
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
