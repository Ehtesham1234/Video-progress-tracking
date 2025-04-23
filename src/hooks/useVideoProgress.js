import { useState, useEffect, useRef } from "react";

export function useVideoProgress(videoUrl) {
 
  const [intervals, setIntervals] = useState([]);
  const [currentInterval, setCurrentInterval] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalDuration, setTotalDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [lastSavedTime, setLastSavedTime] = useState("Never");
  const [uniqueSecondsWatched, setUniqueSecondsWatched] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);


  const videoRef = useRef(null);


  const STORAGE_KEY = `video-progress-${videoUrl.split("/").pop()}`;

 
  const getMergedIntervals = () => {
    if (intervals.length === 0) return [];

    const sortedIntervals = [...intervals].sort((a, b) => a.start - b.start);
    const mergedIntervals = [{ ...sortedIntervals[0] }];

    for (let i = 1; i < sortedIntervals.length; i++) {
      const current = sortedIntervals[i];
      const last = mergedIntervals[mergedIntervals.length - 1];

      if (current.start <= last.end) {
        last.end = Math.max(last.end, current.end);
      } else {
        mergedIntervals.push({ ...current });
      }
    }

    return mergedIntervals;
  };


  const calculateUniqueSecondsWatched = () => {
    if (intervals.length === 0) return 0;

    const mergedIntervals = getMergedIntervals();


    let totalSeconds = 0;
    mergedIntervals.forEach((interval) => {
      totalSeconds += interval.end - interval.start;
    });

    return totalSeconds;
  };


  const updateProgress = () => {
    const uniqueSeconds = calculateUniqueSecondsWatched();
    const percent = totalDuration ? (uniqueSeconds / totalDuration) * 100 : 0;

    setUniqueSecondsWatched(uniqueSeconds);
    setProgressPercent(percent);

    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

 

  const startTracking = () => {
    if (!isPlaying && videoRef.current && videoRef.current.currentTime > 0) {
      setIsPlaying(true);
      const newInterval = {
        start: videoRef.current.currentTime,
        end: videoRef.current.currentTime,
      };
      setCurrentInterval(newInterval);
      setIntervals((prev) => [...prev, newInterval]); 
    }
  };


  const updateTracking = () => {
    if (isPlaying && videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      setIntervals((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            end: currentTime,
          };
        }
        return updated;
      });
      setCurrentInterval((prev) =>
        prev ? { ...prev, end: currentTime } : null
      );
    }
  };


  const endTracking = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setCurrentInterval(null);

     
      setIntervals((prev) =>
        prev.filter((interval) => interval.end > interval.start)
      );

      updateProgress();
    }
  };


  const saveProgress = () => {
    const data = {
      intervals: intervals,
      lastPosition: videoRef.current?.currentTime || 0,
      duration: totalDuration,
      sessionCount: sessionCount + 1,
      lastSaved: new Date().toLocaleString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSessionCount(data.sessionCount);
    setLastSavedTime(data.lastSaved);

    alert("Progress saved successfully!");
  };


  const loadProgress = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      const data = JSON.parse(savedData);
      setIntervals(data.intervals || []);
      setSessionCount(data.sessionCount || 0);
      setLastSavedTime(data.lastSaved || "Never");

  
      if (data.lastPosition && videoRef.current) {
        videoRef.current.currentTime = data.lastPosition;
      }

      updateProgress();
    }
  };

 
  const resetProgress = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all progress? This cannot be undone."
      )
    ) {
      setIntervals([]);
      setCurrentInterval(null);
      setIsPlaying(false);
      setSessionCount(0);
      setLastSavedTime("Never");

      localStorage.removeItem(STORAGE_KEY);

     
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }

      updateProgress();
      alert("Progress has been reset.");
    }
  };

 
  const jumpToMiddle = () => {
    if (videoRef.current && totalDuration) {
      videoRef.current.currentTime = totalDuration * 0.5;
    }
  };

   const replayStart = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();

      setTimeout(() => {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
        }
      }, 20000);
    }
  };

 
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
      endTracking();
      startTracking();
    },
    onTimeUpdate: () => {
      updateTracking();
    },
    onEnded: () => {
      endTracking();
    },
  };


  useEffect(() => {
    loadProgress();
  }, []);

  
  useEffect(() => {
    updateProgress();
  }, [intervals, totalDuration]);
  useEffect(() => {
    console.log("Merged Intervals:", getMergedIntervals());
    console.log("Unique Seconds:", calculateUniqueSecondsWatched());
  }, [intervals]);
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
