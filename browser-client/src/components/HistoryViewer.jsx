import React, { Component } from "react";
import "./HistoryViewer.css";

class HistorViewer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logs: [],
      timeFrame: 1,
    };
  }
  updateLogs = () => {
    fetch("http://192.168.1.7:3333/api/history")
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
        console.log(logs);
      });
  };
  componentDidMount() {
    this.updateLogs();
  }
  onSelectionChange = () => {
    const newTimeFrame = document.getElementById("historyDropdown").value;

    this.setState({ timeFrame: newTimeFrame });
    this.updateLogs();
    //console.log(newTimeFrame);
  };

  render() {
    const { logs, timeFrame } = this.state;
    const now = new Date();
    const filteredLogs = logs.filter((log) => {
      const ellapsedMs = now.getTime() - log.time.getTime();
      const ellapsedH = ellapsedMs / 1000 / 60 / 60;
      //console.log(now.toLocaleString("hu-HU"));
      //console.log(log.time.toLocaleString("hu-HU"));
      //console.log(ellapsedH);
      //console.log(timeFrame);
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
            {filteredLogs.map((message, index) => (
              <div className="messageBox" key={index}>
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
