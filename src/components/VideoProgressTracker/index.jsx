import React, { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import ProgressBar from "./ProgressBar";
import ControlButtons from "./ControlButtons";
import StatsPanel from "./StatsPanel";
import { useVideoProgress } from "../../hooks/useVideoProgress";
import "./styles.css";

function VideoProgressTracker({ videoUrl }) {
  const {
    videoRef,
    intervals,
    totalDuration,
    currentTime,
    uniqueSecondsWatched,
    progressPercent,
    sessionCount,
    lastSavedTime,
    handleVideoEvents,
    saveProgress,
    resetProgress,
    jumpToMiddle,
    replayStart,
    getMergedIntervals,
  } = useVideoProgress(videoUrl);

  return (
    <div className="video-progress-tracker">
      <div className="player-container">
        <h1>Smart Video Progress Tracker</h1>

        <VideoPlayer
          videoRef={videoRef}
          videoUrl={videoUrl}
          onEvents={handleVideoEvents}
        />

        <ProgressBar
          progressPercent={progressPercent}
          uniqueSecondsWatched={uniqueSecondsWatched}
          totalDuration={totalDuration}
          intervals={getMergedIntervals()}
        />

        <ControlButtons
          onReset={resetProgress}
          onSave={saveProgress}
          onJump={jumpToMiddle}
          onReplay={replayStart}
        />
      </div>

      <StatsPanel
        uniqueSecondsWatched={uniqueSecondsWatched}
        currentTime={currentTime}
        sessionCount={sessionCount}
        lastSavedTime={lastSavedTime}
        intervals={getMergedIntervals()}
      />
    </div>
  );
}

export default VideoProgressTracker;
