// @ts-nocheck
"use client";

import React, { useEffect, useRef } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

export default function Text() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startedRef = useRef(false);

  // Start listening (avoid repeated calls)
  const startListening = () => {
    if (startedRef.current && listening) return;
    startedRef.current = true;
    SpeechRecognition.startListening({ continuous: true, language: "hi-IN" });
  };

  // Stop listening
  const stopListening = () => {
    startedRef.current = false;
    SpeechRecognition.stopListening();
  };

  // Toggle listening
  const toggleListening = () => {
    if (listening) stopListening();
    else startListening();
  };

  // Press-any-key handling (ignore typing)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      toggleListening();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // listening intentionally in deps so toggle reads latest state
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <p className="text-gray-600">Browser does not support speech recognition. Use Chrome or Edge.</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Voice Assistant</h3>
          <p className="text-sm text-gray-500">Speak in Hindi/Hinglish — press any key or tap Start</p>
        </div>

        <div className="border rounded-lg p-4 bg-gray-50 min-h-[140px]">
          <div className="text-sm font-medium mb-2">Transcript</div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {transcript ? transcript : <span className="text-gray-400">No speech yet</span>}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 items-center">
          <button
            onClick={toggleListening}
            className={`col-span-2 rounded-lg py-3 text-lg font-semibold transition-shadow ${
              listening ? "bg-red-500 text-white" : "bg-blue-600 text-white"
            }`}
          >
            {listening ? "Listening — press any key to stop" : "Start"}
            <span className="ml-3">▶</span>
          </button>

          <div className="flex flex-col gap-2">
            <button
              onClick={stopListening}
              className="rounded-md border py-2 bg-white text-gray-700"
            >
              Stop
            </button>
            <button
              onClick={() => resetTranscript()}
              className="rounded-md border py-2 bg-white text-gray-700"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Microphone: {listening ? "Listening to your voice..." : "off"}
        </div>
      </div>
    </div>
  );
}
