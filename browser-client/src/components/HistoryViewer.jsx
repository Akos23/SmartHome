import React, { Component } from "react";
import "./HistoryViewer.css";

class HistorViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: [
        {
          time: new Date(2021, 3, 3, 8, 30),
          name: "Dabasi Akos",
          action: "opened front door",
        },
        {
          time: new Date(2021, 3, 3, 8, 40),
          name: "Dabasi Akos",
          action: "turned off the alarm",
        },
        {
          time: new Date(2021, 3, 2, 12, 21),
          name: "Dabasi Akos",
          action: "closed front door",
        },
        {
          time: new Date(2021, 3, 1, 12, 21),
          name: "Dabasi Akos",
          action: "set alarm",
        },
        {
          time: new Date(2021, 3, 1, 12, 21),
          name: "Unknown",
          action: "tried to open front door",
        },
        {
          time: new Date(2021, 3, 1, 12, 21),
          name: " - ",
          action: "alarm went off",
        },
        {
          time: new Date(2021, 1, 4, 12, 21),
          name: "Dabasi Akos",
          action: "turned off alarm",
        },
        {
          time: new Date(2021, 1, 4, 12, 21),
          name: "Dabasi Akos",
          action: "opened front door",
        },
      ],
      timeFrame: 1,
    };
  }
  componentDidMount() {
    fetch("http://192.168.1.7:3333/history")
      .then((response) => response.json())
      .then((data) => {
        const logs = data.logs.map(({ time, name, action }) => {
          return {
            time: new Date(time),
            name: name,
            action: action,
          };
        });
        this.setState({ logs });
        //console.log(logs);
      });
  }
  onSelectionChange = () => {
    const newTimeFrame = document.getElementById("historyDropdown").value;

    this.setState({ timeFrame: newTimeFrame });
    console.log(newTimeFrame);
  };

  render() {
    const { logs, timeFrame } = this.state;
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const ellapsedMs = now.getTime() - log.time.getTime();
      const ellapsedH = ellapsedMs / 1000 / 60 / 60;
      console.log(now.toLocaleString("hu-HU"));
      console.log(log.time.toLocaleString("hu-HU"));
      console.log(ellapsedH);
      console.log(timeFrame);
      return ellapsedH < timeFrame;
    });

    return (
      <React.Fragment>
        <select
          className="customSelect"
          id="historyDropdown"
          onChange={this.onSelectionChange}
        >
          <option value={1}> int the last hour</option>
          <option value={24}>in the last day</option>
          <option value={2 * 24}>in the last 2 days</option>
          <option value={7 * 24}>in the last week</option>
          <option value={2 * 7 * 24}>in the last 2 weeks</option>
        </select>

        <div className="logMsgContainer">
          <hr className="logMsgDecorlineTop" />
          <div className="messages">
            {filteredLogs.map((message) => (
              <div className="messageBox">
                <div>
                  <div>{`time: ${message.time.toLocaleString("hu-HU")}`}</div>
                  <div>user: {message.name}</div>
                  <div>action: {message.action}</div>
                </div>
              </div>
            ))}
          </div>

          <hr className="logMsgDecorlineBottom" />
        </div>
      </React.Fragment>
    );
  }
}

export default HistorViewer;
