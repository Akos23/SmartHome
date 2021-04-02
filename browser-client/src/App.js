import { Route } from "react-router";
import "./App.css";
import NavigationMenu from "./components/NavigationMenu";
import LoginForm from "./components/LoginForm";

function App() {
  return (
    <div className="App">
      <Route path="/home" render={(props) => <NavigationMenu {...props} />} />
      <Route path="/" exact render={(props) => <LoginForm {...props} />} />
    </div>
  );
}

export default App;
