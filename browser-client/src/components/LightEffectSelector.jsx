import React, { Component } from "react";
import "./LightEffectSelector.css";

class LightEffectSelector extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { effectSelector, onCheckHandler, onSelectHandler } = this.props;
    return (
      <div
        className="rgbEffectContainer"
        data-activate={effectSelector.isActive}
      >
        <label className="rgbEffectCheckbox">
          <input
            type="checkbox"
            name="checkbox"
            value="value"
            checked={effectSelector.isActive}
            onChange={() => onCheckHandler(!effectSelector.isActive)}
          />
          {"  activate lighting effect"}
        </label>
        {effectSelector.isActive && (
          <React.Fragment>
            <label className="rgbEffectRadio1">
              <input
                type="radio"
                name="rgbEffect"
                value="value"
                checked={effectSelector.effectID === 1}
                onClick={() => onSelectHandler(1)}
              />
              {"  effect1"}
            </label>
            <label className="rgbEffectRadio2">
              <input
                type="radio"
                name="rgbEffect"
                value="value"
                checked={effectSelector.effectID === 2}
                onClick={() => onSelectHandler(2)}
              />
              {"  effect2"}
            </label>
            <label className="rgbEffectRadio3">
              <input
                type="radio"
                name="rgbEffect"
                value="value"
                checked={effectSelector.effectID === 3}
                onClick={() => onSelectHandler(3)}
              />
              {"  effect3"}
            </label>
          </React.Fragment>
        )}
      </div>
    );
  }
}

export default LightEffectSelector;
