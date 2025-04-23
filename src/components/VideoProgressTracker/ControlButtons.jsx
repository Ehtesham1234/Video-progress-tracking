import React from 'react';

function ControlButtons({ onReset, onSave, onJump, onReplay }) {
  return (
    <div className="controls">
      <button onClick={onReset} className="control-button">
        Reset Progress
      </button>
      <button onClick={onSave} className="control-button">
        Save Progress
      </button>
      <button onClick={onJump} className="control-button">
        Jump to 50% (Test Skip)
      </button>
      <button onClick={onReplay} className="control-button">
        Replay First 20s (Test Rewatch)
      </button>
    </div>
  );
}

export default ControlButtons;