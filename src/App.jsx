import React from "react";
import VideoProgressTracker from "./components/VideoProgressTracker";

function App() {
  return (
    <div className="App">
      <VideoProgressTracker videoUrl="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" />
    </div>
  );
}

export default App;
