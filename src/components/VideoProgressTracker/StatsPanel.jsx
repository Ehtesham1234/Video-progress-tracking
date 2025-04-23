import React from 'react';
import { formatTime } from '../../utils/timeUtils';

function StatsPanel({ uniqueSecondsWatched, currentTime, sessionCount, lastSavedTime, intervals }) {
  const renderWatchedIntervalsText = () => {
    if (intervals.length === 0) {
      return 'No intervals recorded yet';
    } else {
      return intervals.map(interval => 
        `[${formatTime(interval.start)} - ${formatTime(interval.end)}]`
      ).join(', ');
    }
  };

  return (
    <div className="stats">
      <h2>Progress Stats</h2>
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-title">Unique Seconds Watched</div>
          <div className="stat-value">{Math.round(uniqueSecondsWatched)}s</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Current Position</div>
          <div className="stat-value">{formatTime(currentTime)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Watch Sessions</div>
          <div className="stat-value">{sessionCount}</div>
        </div>
        <div className="stat-box">
          <div className="stat-title">Last Saved</div>
          <div className="stat-value">{lastSavedTime}</div>
        </div>
      </div>
      
      <h3>Watched Intervals</h3>
      <div className="watched-intervals">
        {renderWatchedIntervalsText()}
      </div>
    </div>
  );
}

export default StatsPanel;