import { useState, useEffect, useRef } from "react";

export function useVideoProgress(videoUrl) {
  // State variables
  const [intervals, setIntervals] = useState([]);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState("Never");
  const [uniqueSecondsWatched, setUniqueSecondsWatched] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const prevTimeRef = useRef(0);
  const intervalsRef = useRef([]);

  // Constants
  const STORAGE_KEY = `video-progress-${videoUrl.split("/").pop()}`;
  const UPDATE_INTERVAL = 250; // ms between updates to reduce performance impact

  // Get merged intervals (for UI display and calculations)
  const getMergedIntervals = () => {
    if (intervals.length === 0) return [];

    const sortedIntervals = [...intervals].sort((a, b) => a.start - b.start);
    const mergedIntervals = [{ ...sortedIntervals[0] }];

    for (let i = 1; i < sortedIntervals.length; i++) {
      const current = sortedIntervals[i];
      const last = mergedIntervals[mergedIntervals.length - 1];

      // Consider intervals adjacent if they're within 0.1 seconds
      if (current.start <= last.end + 0.1) {
        last.end = Math.max(last.end, current.end);
      } else {
        mergedIntervals.push({ ...current });
      }
    }

    return mergedIntervals;
  };

  // Calculate total unique seconds watched from intervals
  const calculateUniqueSecondsWatched = () => {
    if (intervals.length === 0) return 0;

    const mergedIntervals = getMergedIntervals();

    // Calculate total unique seconds
    let totalSeconds = 0;
    mergedIntervals.forEach((interval) => {
      totalSeconds += interval.end - interval.start;
    });

    return totalSeconds;
  };

  // Update progress calculations
  const updateProgress = () => {
    const uniqueSeconds = calculateUniqueSecondsWatched();
    const percent = totalDuration ? (uniqueSeconds / totalDuration) * 100 : 0;

    setUniqueSecondsWatched(uniqueSeconds);
    setProgressPercent(percent);

    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Start tracking a new interval
  const startTracking = () => {
    if (!isPlaying && videoRef.current && !isSeeking) {
      setIsPlaying(true);
      const newInterval = {
        start: videoRef.current.currentTime,
        end: videoRef.current.currentTime,
      };
      setCurrentInterval(newInterval);

      // Update both state and ref
      setIntervals((prev) => {
        const updated = [...prev, newInterval];
        intervalsRef.current = updated;
        return updated;
      });

      prevTimeRef.current = videoRef.current.currentTime;
    }
  };

  // Update the current interval end time
  const updateTracking = () => {
    const now = Date.now();

    // Throttle updates to improve performance
    if (now - lastUpdateTime < UPDATE_INTERVAL) return;
    setLastUpdateTime(now);

    if (isPlaying && videoRef.current && !isSeeking) {
      const currentTime = videoRef.current.currentTime;
      const prevTime = prevTimeRef.current;

      // Check if we jumped (skipped) significantly
      const timeDifference = currentTime - prevTime;
      const significantJump = Math.abs(timeDifference) > 1.5; // More than 1.5 second jump

      if (significantJump && timeDifference > 0) {
        // If we skipped forward while playing, end current interval and start a new one
        setIntervals((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              end: prevTime, // End at the previous position before skipping
            };
          }

          // Add new interval at current position
          const newInterval = {
            start: currentTime,
            end: currentTime,
          };
          intervalsRef.current = [...updated, newInterval];
          return [...updated, newInterval];
        });

        setCurrentInterval({
          start: currentTime,
          end: currentTime,
        });
      } else {
        // Normal playback - update current interval
        setIntervals((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              end: currentTime,
            };
          }
          intervalsRef.current = updated;
          return updated;
        });

        setCurrentInterval((prev) =>
          prev ? { ...prev, end: currentTime } : null
        );
      }

      prevTimeRef.current = currentTime;
    }
  };

  // End the current tracking interval
  const endTracking = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentInterval(null);

      // Remove any zero-length intervals
      setIntervals((prev) => {
        const filtered = prev.filter(
          (interval) => interval.end > interval.start
        );
        intervalsRef.current = filtered;
        return filtered;
      });

      updateProgress();
    }
  };

  // Save progress to local storage
  const saveProgress = () => {
    try {
      const data = {
        intervals: intervalsRef.current,
        lastPosition: videoRef.current?.currentTime || 0,
        duration: totalDuration,
        sessionCount: sessionCount + 1,
        lastSaved: new Date().toLocaleString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSessionCount(data.sessionCount);
      setLastSavedTime(data.lastSaved);

      // Use a non-blocking notification instead of alert
      const notification = document.createElement("div");
      notification.className = "save-notification";
      notification.textContent = "Progress saved successfully!";
      notification.style.cssText =
        "position:fixed; top:20px; right:20px; background:green; color:white; padding:10px; border-radius:5px; z-index:1000;";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    } catch (error) {
      console.error("Error saving progress:", error);
      alert(
        "Failed to save progress. Local storage may be unavailable or full."
      );
    }
  };

  // Load progress from local storage
  const loadProgress = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);

      if (savedData) {
        const data = JSON.parse(savedData);
        const loadedIntervals = data.intervals || [];
        setIntervals(loadedIntervals);
        intervalsRef.current = loadedIntervals;
        setSessionCount(data.sessionCount || 0);
        setLastSavedTime(data.lastSaved || "Never");

        // Resume from last position if available
        if (data.lastPosition && videoRef.current) {
          videoRef.current.currentTime = data.lastPosition;
        }

        updateProgress();
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }
  };

  // Reset all progress
  const resetProgress = () => {
    // Create a custom confirm dialog instead of window.confirm
    if (
      window.confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      setIntervals([]);
      intervalsRef.current = [];
      setCurrentInterval(null);
      setIsPlaying(false);
      setSessionCount(0);
      setLastSavedTime("Never");

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error("Error removing from localStorage:", error);
      }

      // Reset video position
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }

      updateProgress();

      // Use a non-blocking notification
      const notification = document.createElement("div");
      notification.className = "reset-notification";
      notification.textContent = "Progress has been reset.";
      notification.style.cssText =
        "position:fixed; top:20px; right:20px; background:#d9534f; color:white; padding:10px; border-radius:5px; z-index:1000;";
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);
    }
  };

  // Jump to 50% (for testing)
  const jumpToMiddle = () => {
    if (videoRef.current && totalDuration) {
      videoRef.current.currentTime = totalDuration * 0.5;
    }
  };

  // Replay first 20 seconds (for testing)
  const replayStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .catch((err) => console.error("Error playing video:", err));

      setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }, 20000);
    }
  };

  // Video event handlers
  const handleVideoEvents = {
    onLoadedMetadata: () => {
      if (videoRef.current) {
        setTotalDuration(videoRef.current.duration);
      }
    },
    onPlay: () => {
      startTracking();
    },
    onPause: () => {
      endTracking();
    },
    onSeeking: () => {
      setIsSeeking(true);
      endTracking();
    },
    onSeeked: () => {
      setIsSeeking(false);
      if (!videoRef.current.paused) {
        startTracking();
      }
    },
    onTimeUpdate: () => {
      updateTracking();
    },
    onEnded: () => {
      endTracking();
    },
  };

  // Setup and cleanup effects
  useEffect(() => {
    loadProgress();

    return () => {
      // Save progress on component unmount
      if (intervalsRef.current.length > 0) {
        try {
          const data = {
            intervals: intervalsRef.current,
            lastPosition: videoRef.current?.currentTime || 0,
            duration: totalDuration,
            sessionCount: sessionCount + 1,
            lastSaved: new Date().toLocaleString(),
          };

          localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
          console.error("Error saving progress on unmount:", error);
        }
      }
    };
  }, []);

  // Effect to update progress when intervals change
  useEffect(() => {
    updateProgress();
  }, [intervals, totalDuration]);

  return {
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
  };
}
