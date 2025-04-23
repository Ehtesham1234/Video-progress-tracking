import React from 'react';

function ProgressBar({ progressPercent, uniqueSecondsWatched, totalDuration, intervals }) {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span>Overall Progress: <strong>{progressPercent.toFixed(1)}%</strong></span>
        <span>
          Time Watched: <strong>{Math.round(uniqueSecondsWatched)}s</strong> / 
          <span>{Math.round(totalDuration)}s</span>
        </span>
      </div>
      
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercent}%` }}
        />
        <div className="watched-segments">
          {intervals.map((interval, index) => {
            const startPercent = (interval.start / totalDuration) * 100;
            const widthPercent = ((interval.end - interval.start) / totalDuration) * 100;
            
            return (
              <div 
                key={index}
                className="segment" 
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;