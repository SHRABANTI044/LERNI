import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

let modelsLoadPromise;

const mapEmotion = (emotion) => {
  const labels = {
    angry: 'Angry',
    disgust: 'Disgusted',
    fear: 'Fearful',
    happy: 'Happy',
    sad: 'Sad',
    surprised: 'Surprised',
    neutral: 'Neutral',
  };
  return labels[emotion] || null;
};

export const SUPPORTED_EXPRESSIONS = ['Angry', 'Disgusted', 'Fearful', 'Happy', 'Sad', 'Surprised', 'Neutral'];

// Timeouts so "Starting…" can never hang forever.
const CAMERA_TIMEOUT_MS = 15000;
const PLAY_TIMEOUT_MS = 8000;
const MODEL_TIMEOUT_MS = 60000;

const withTimeout = (promise, ms, label) => Promise.race([
  promise,
  new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms)),
]);

// Thresholds: ignore low-confidence frames, smooth across several frames.
const CONFIDENCE_THRESHOLD = 45;
const SMOOTHING_WINDOW = 6;

const getSmoothedEstimate = (history) => {
  const recent = history.slice(-SMOOTHING_WINDOW);
  if (recent.length < 3) return null;
  const confident = recent.filter((h) => h.confidence >= CONFIDENCE_THRESHOLD && h.emotion);
  if (confident.length < 3) return null;
  const counts = {};
  confident.forEach((h) => { counts[h.emotion] = (counts[h.emotion] || 0) + 1; });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top || top[1] < 3) return null;
  const matches = confident.filter((h) => h.emotion === top[0]);
  const avg = Math.round(matches.reduce((s, h) => s + h.confidence, 0) / matches.length);
  return { emotion: top[0], confidence: avg, frames: matches.length };
};

const stopMediaStream = (stream) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

export const useEmotionDetection = (videoRef, onEmotionChange) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [smoothedEmotion, setSmoothedEmotion] = useState(null);
  const [detectionStatus, setDetectionStatus] = useState('off');
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [startupStep, setStartupStep] = useState('');

  const streamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const isDetectingRef = useRef(false);
  const onEmotionChangeRef = useRef(onEmotionChange);
  onEmotionChangeRef.current = onEmotionChange;
  const pausedRef = useRef(false);
  const detectRef = useRef(null);

  const pauseDetection = useCallback(() => {
    pausedRef.current = true;
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    isDetectingRef.current = false;
    if (isMountedRef.current) setDetectionStatus('paused');
    setIsPaused(true);
  }, []);

  const resumeDetection = useCallback(() => {
    // Resume frame processing on the existing stream (camera stays on).
    if (!streamRef.current || !isMountedRef.current) return;
    pausedRef.current = false;
    setIsPaused(false);
    setDetectionStatus('no-face');
    if (!detectionIntervalRef.current && detectRef.current) {
      const requestId = requestIdRef.current;
      detectionIntervalRef.current = setInterval(() => detectRef.current(requestId), 500);
    }
  }, []);

  const loadModels = useCallback(async () => {
    if (!modelsLoadPromise) {
      modelsLoadPromise = Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]).catch((loadError) => {
        modelsLoadPromise = null;
        throw loadError;
      });
    }

    await modelsLoadPromise;
  }, []);

  const detectEmotions = useCallback(async (requestId) => {
    if (
      requestIdRef.current !== requestId
      || isDetectingRef.current
      || pausedRef.current
      || !videoRef.current
      || videoRef.current.readyState < 2
    ) return;

    isDetectingRef.current = true;

    try {
      const detections = await faceapi.detectAllFaces(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 })
      ).withFaceExpressions();

      if (requestIdRef.current !== requestId || !isMountedRef.current) return;

      if (!detections || detections.length === 0) {
        setDetectionStatus('no-face');
        return;
      }

      const largestFace = detections.reduce((largest, current) => {
        const largestBox = largest.detection.box;
        const currentBox = current.detection.box;
        return currentBox.width * currentBox.height > largestBox.width * largestBox.height
          ? current
          : largest;
      });
      const [emotion, probability] = Object.entries(largestFace.expressions)
        .reduce((highest, entry) => entry[1] > highest[1] ? entry : highest, ['neutral', 0]);
      const mappedEmotion = mapEmotion(emotion);
      const roundedConfidence = Math.round(probability * 100);

      if (!mappedEmotion || roundedConfidence < CONFIDENCE_THRESHOLD) {
        setDetectionStatus('unclear');
        return;
      }

      const entry = { emotion: mappedEmotion, confidence: roundedConfidence, timestamp: Date.now() };
      setEmotionHistory((history) => {
        const next = [...history, entry].slice(-20);
        const smoothed = getSmoothedEstimate(next);
        setSmoothedEmotion(smoothed);
        setDetectionStatus(smoothed ? 'ready' : 'unclear');
        if (smoothed && onEmotionChangeRef.current) onEmotionChangeRef.current(smoothed.emotion, smoothed.confidence);
        return next;
      });
      setCurrentEmotion(mappedEmotion);
      setConfidence(roundedConfidence);
    } catch (detectionError) {
      if (requestIdRef.current === requestId && isMountedRef.current) {
        setError(`Emotion estimates paused because face detection failed: ${detectionError.message}`);
        setDetectionStatus('error');
        requestIdRef.current += 1;
        if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsWebcamOn(false);
        setCurrentEmotion(null);
        setConfidence(0);
        setEmotionHistory([]);
      }
    } finally {
      isDetectingRef.current = false;
    }
  }, [videoRef]);
  detectRef.current = detectEmotions;

  const stopDetection = useCallback(() => {
    requestIdRef.current += 1;
    setError(null);

    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    stopMediaStream(streamRef.current);
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    isDetectingRef.current = false;
    if (isMountedRef.current) {
      setIsLoading(false);
      setIsWebcamOn(false);
      setIsPaused(false);
      pausedRef.current = false;
      setCurrentEmotion(null);
      setConfidence(0);
      setSmoothedEmotion(null);
      setEmotionHistory([]);
      setDetectionStatus('off');
    }
  }, [videoRef]);

  const startDetection = useCallback(async () => {
    // Only called from an explicit user click; never auto-start.
    stopDetection();
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setError(null);
    setIsLoading(true);
    setModelsReady(false);
    setDetectionStatus('loading');
    setStartupStep('Requesting camera permission…');

    let requestingCameraPermission = true;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support webcam access.');
      }

      const stream = await withTimeout(
        navigator.mediaDevices.getUserMedia({ audio: false, video: true }),
        CAMERA_TIMEOUT_MS,
        'Camera request'
      );
      requestingCameraPermission = false;
      setStartupStep('Camera granted. Starting preview…');

      if (requestIdRef.current !== requestId || !isMountedRef.current) {
        stopMediaStream(stream);
        return;
      }

      if (!videoRef.current) {
        stopMediaStream(stream);
        throw new Error('The webcam preview is not ready. Please try again.');
      }

      streamRef.current = stream;
      stream.getTracks().forEach((track) => {
        track.addEventListener('ended', () => {
          if (
            requestIdRef.current === requestId
            && isMountedRef.current
            && streamRef.current === stream
          ) {
            stopDetection();
            setError('The camera stopped unexpectedly. Check that it is still connected and that another app is not using it, then try turning it on again. You can continue the lesson without emotion support.');
            setDetectionStatus('error');
          }
        }, { once: true });
      });
      videoRef.current.srcObject = stream;
      // Show preview IMMEDIATELY (before play/models) so a play() hang is visible, not silent.
      setIsWebcamOn(true);
      setDetectionStatus('no-face');
      try {
        await withTimeout(videoRef.current.play(), PLAY_TIMEOUT_MS, 'Video preview');
      } catch (playError) {
        // Non-fatal: stream may still render. Log and continue to models.
        // eslint-disable-next-line no-console
        console.warn('[emotion] video play() issue (continuing):', playError?.message || playError);
      }
      setStartupStep('Preview started. Loading expression models…');
      if (requestIdRef.current !== requestId || !isMountedRef.current) {
        stopMediaStream(stream);
        return;
      }
      // Load AI models WITHOUT killing the preview on failure: camera and
      // expression estimates are independent. Preview stays on for debugging.
      setModelsLoading(true);
      try {
        await withTimeout(loadModels(), MODEL_TIMEOUT_MS, 'Model download');
        if (requestIdRef.current !== requestId || !isMountedRef.current) return;
        setModelsReady(true);
        setStartupStep('');
      } catch (modelError) {
        if (requestIdRef.current !== requestId || !isMountedRef.current) return;
        setModelsReady(false);
        setDetectionStatus('error');
        setStartupStep('');
        setError(`Camera is on, but emotion models could not load (${modelError.message || 'network error'}). Check your internet connection, then use Retry. You can keep studying.`);
        return;
      } finally {
        if (requestIdRef.current === requestId && isMountedRef.current) setModelsLoading(false);
      }

      if (requestIdRef.current !== requestId || !isMountedRef.current) return;

      detectionIntervalRef.current = setInterval(() => detectRef.current(requestId), 500);
    } catch (startError) {
      if (requestIdRef.current === requestId && isMountedRef.current) {
        stopMediaStream(streamRef.current);
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
        setIsWebcamOn(false);
        setCurrentEmotion(null);
        setConfidence(0);
        setSmoothedEmotion(null);
        setEmotionHistory([]);
        setDetectionStatus('error');

        if (requestingCameraPermission && (startError.name === 'NotAllowedError' || startError.name === 'PermissionDeniedError')) {
          setError('Camera permission was denied. You can continue the lesson without emotion support.');
        } else if (startError.name === 'NotFoundError' || startError.name === 'DevicesNotFoundError') {
          setError('No webcam was found. You can continue the lesson without emotion support.');
        } else if (startError.name === 'NotReadableError' || startError.name === 'TrackStartError') {
          setError('The camera could not start. It may be in use by another app; close other apps using the camera and try again. You can continue the lesson without emotion support.');
        } else if (startError.name === 'OverconstrainedError') {
          setError('The camera could not start with the settings supported by this device. Check that the webcam is connected, then try again. You can continue the lesson without emotion support.');
        } else {
          setError(`${startError.message || 'Emotion support could not start.'} You can continue the lesson without it.`);
        }
      }
    } finally {
      if (requestIdRef.current === requestId && isMountedRef.current) {
        setIsLoading(false);
        setStartupStep('');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detectEmotions, loadModels, stopDetection, videoRef]);

  // Retry only the model load (camera already on): keeps preview alive.
  const retryModels = useCallback(async () => {
    if (!streamRef.current || !isMountedRef.current) return;
    setError(null);
    setModelsLoading(true);
    setDetectionStatus('loading');
    try {
      await loadModels();
      if (!isMountedRef.current) return;
      setModelsReady(true);
      setDetectionStatus('no-face');
      if (!detectionIntervalRef.current && detectRef.current) {
        const requestId = requestIdRef.current;
        detectionIntervalRef.current = setInterval(() => detectRef.current(requestId), 500);
      }
    } catch (modelError) {
      if (!isMountedRef.current) return;
      setModelsReady(false);
      setDetectionStatus('error');
      setError(`Camera is on, but emotion models still could not load (${modelError.message || 'network error'}). You can keep studying.`);
    } finally {
      if (isMountedRef.current) setModelsLoading(false);
    }
  }, [loadModels]);

  const getEmotionBreakdown = useCallback(() => {
    if (emotionHistory.length === 0) return [];

    const counts = emotionHistory.reduce((result, { emotion }) => {
      result[emotion] = (result[emotion] || 0) + 1;
      return result;
    }, {});
    const colors = {
      Happy: '#fbbf24',
      Sad: '#3b82f6',
      Angry: '#ef4444',
      Disgusted: '#8b5cf6',
      Fearful: '#f97316',
      Surprised: '#0ea5e9',
      Neutral: '#6b7280',
    };

    return Object.entries(counts).map(([emotion, count]) => ({
      emotion,
      percentage: Math.round((count / emotionHistory.length) * 100),
      color: colors[emotion] || '#6b7280',
    }));
  }, [emotionHistory]);

  useEffect(() => {
    isMountedRef.current = true;
    const videoElement = videoRef.current;
    return () => {
      isMountedRef.current = false;
      requestIdRef.current += 1;
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
      stopMediaStream(streamRef.current);
      streamRef.current = null;
      if (videoElement) {
        try { videoElement.pause(); } catch { /* noop */ }
        videoElement.srcObject = null;
      }
    };
  }, [videoRef]);

  return {
    isLoading,
    error,
    currentEmotion,
    confidence,
    smoothedEmotion,
    detectionStatus,
    emotionHistory,
    isWebcamOn,
    isPaused,
    modelsReady,
    modelsLoading,
    startupStep,
    startDetection,
    stopDetection,
    clearError: () => setError(null),
    pauseDetection,
    resumeDetection,
    retryModels,
    getEmotionBreakdown,
  };
};

export default useEmotionDetection;
