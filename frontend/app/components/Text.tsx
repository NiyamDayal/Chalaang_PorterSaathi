// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

/**
 * Improved SaathiAssistant
 * - uses NEXT_PUBLIC_ASSISTANT_URL or defaults to /api/assistant/query
 * - prevents duplicate sends
 * - shows processing state
 * - persists conversation to localStorage
 * - checks mic permission before starting
 * - uses aria-live for accessibility
 */

type ConversationEntry = {
  speaker: "user" | "saathi" | "system";
  text: string;
  timestamp?: number;
};

const STORAGE_KEY = "saathi_conversation_v1";
const API_URL = process.env.NEXT_PUBLIC_ASSISTANT_URL || "/api/assistant/query";

export default function SaathiAssistant() {
  const [conversation, setConversation] = useState<ConversationEntry[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const lastSentRef = useRef<string | null>(null);
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();
  const startedRef = useRef(false);
  const mountedRef = useRef(true);

  // Persist conversation
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversation));
    } catch {}
  }, [conversation]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      try {
        window.speechSynthesis?.cancel();
      } catch {}
    };
  }, []);

  // Ask backend and append reply — avoids duplicates using lastSentRef
  const askSaathi = async (userQuery: string) => {
    const text = (userQuery || "").trim();
    if (!text || lastSentRef.current === text) return;
    lastSentRef.current = text;

    setIsProcessing(true);
    setConversation((p) => [...p, { speaker: "user", text, timestamp: Date.now() }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: 1, text, lang: "hi" }),
      });

      if (!res.ok) {
        // try to extract error message
        let msg = `Server error (${res.status})`;
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      const reply = data.reply ?? (data?.message ?? "Maaf, kuch galat hua.");

      // append assistant reply
      setConversation((p) => [...p, { speaker: "saathi", text: reply, timestamp: Date.now() }]);
      speakText(reply);
    } catch (err: any) {
      const msg = err?.message || "Network error";
      setConversation((p) => [...p, { speaker: "system", text: msg, timestamp: Date.now() }]);
    } finally {
      if (mountedRef.current) setIsProcessing(false);
    }
  };

  // Text-to-speech
  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // When recognition stops (final transcript), send it to backend
  useEffect(() => {
    // Only send if recognition ended and we have transcript (and not processing)
    if (!listening && transcript && !isProcessing) {
      // double-check duplicate prevention
      const trimmed = transcript.trim();
      if (trimmed && lastSentRef.current !== trimmed) {
        askSaathi(trimmed);
      }
      resetTranscript();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, transcript]);

  // start/stop functions
  const startListening = async () => {
    // request microphone permission once to avoid silent failures
    try {
      // optional permission check; some browsers don't support navigator.permissions for 'microphone'
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // quick request for permission (no recording)
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (permErr) {
      setConversation((p) => [...p, { speaker: "system", text: "Microphone permission was denied.", timestamp: Date.now() }]);
      return;
    }

    if (startedRef.current && listening) return;
    startedRef.current = true;
    try {
      SpeechRecognition.startListening({ continuous: false, language: "hi-IN" });
    } catch (err) {
      setConversation((p) => [...p, { speaker: "system", text: "Could not start microphone.", timestamp: Date.now() }]);
    }
  };

  const stopListening = () => {
    startedRef.current = false;
    try {
      SpeechRecognition.stopListening();
    } catch {}
  };

  const toggleListening = () => {
    if (isProcessing) return; // don't interrupt when processing
    if (listening) stopListening();
    else {
      resetTranscript();
      startListening();
    }
  };

  // Press-any-key to toggle (ignore typing in inputs)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName ?? "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      toggleListening();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // listening intentionally included so handler sees latest state
  }, [listening, isProcessing]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <p className="text-gray-600">Your browser does not support speech recognition. Use Chrome/Edge (desktop).</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gradient-to-br from-white to-blue-50 rounded-xl border p-6 shadow-sm">
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* left: transcript + conversation */}
        <div className="col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">Voice Assistant</div>
              <div className="text-sm text-gray-500">Speak in Hindi/Hinglish — press any key or tap mic</div>
            </div>
            <div className="text-sm text-gray-500">{isProcessing ? "Saathi is thinking..." : ""}</div>
          </div>

          {/* Transcript (aria-live) */}
          <div className="rounded-lg border p-4 bg-white min-h-[120px]">
            <div className="text-sm font-medium text-gray-700 mb-2">Transcript</div>
            <div className="text-gray-800 whitespace-pre-wrap" aria-live="polite">
              {transcript ? transcript : <span className="text-gray-400">No speech yet</span>}
            </div>
          </div>

          {/* conversation history */}
          <div className="mt-4 space-y-2 max-h-48 overflow-auto" aria-live="polite">
            {conversation.map((c, i) => (
              <div
                key={i}
                className={`p-3 rounded-md ${c.speaker === "user" ? "bg-blue-50 text-gray-900" : c.speaker === "saathi" ? "bg-gray-100 text-gray-900" : "bg-red-50 text-gray-800"}`}
              >
                <div className="text-xs font-semibold uppercase mb-1">{c.speaker}</div>
                <div className="text-sm">{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right: big mic button */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-medium text-gray-700 mb-3">Press mic to talk</div>

          <button
            onClick={toggleListening}
            disabled={isProcessing}
            aria-pressed={listening}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform focus:outline-none ${
              listening ? "bg-blue-600 animate-pulse" : "bg-blue-600 hover:scale-105"
            } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
            title={listening ? "Stop listening" : "Start listening"}
          >
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3z" fill="white" />
              <path d="M19 11a1 1 0 10-2 0 5 5 0 01-10 0 1 1 0 10-2 0 7 7 0 006 6.92V21h2v-3.08A7 7 0 0019 11z" fill="white" />
            </svg>
          </button>

          <div className="mt-4 text-sm text-gray-600 font-semibold">Porter Saathi</div>

          <div className="mt-6 space-y-2 w-full">
            <button onClick={stopListening} className="w-full rounded-md border py-2 bg-white text-gray-700" disabled={!listening}>Stop</button>
            <button onClick={() => { resetTranscript(); setConversation([]); lastSentRef.current = null; }} className="w-full rounded-md border py-2 bg-white text-gray-700">Reset</button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">Microphone: {listening ? "on" : "off"}</div>
    </div>
  );
}
