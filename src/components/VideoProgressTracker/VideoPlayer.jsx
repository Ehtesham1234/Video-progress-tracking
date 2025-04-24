import React from "react";

function VideoPlayer({ videoRef, videoUrl, onEvents }) {
  const {
    onLoadedMetadata,
    onPlay,
    onPause,
    onSeeking,
    onSeeked,
    onTimeUpdate,
    onEnded,
  } = onEvents;

  return (
    <video
      ref={videoRef}
      className="video-player"
      controls
      onLoadedMetadata={onLoadedMetadata}
      onPlay={onPlay}
      onPause={onPause}
      onSeeking={onSeeking}
      onSeeked={onSeeked} 
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
    >
      <source src={videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default VideoPlayer;
