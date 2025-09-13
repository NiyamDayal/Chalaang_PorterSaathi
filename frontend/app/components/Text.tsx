// //@ts-nocheck
// "use client";
// import { FC } from "react";
// import SpeechRecognition, {
//   useSpeechRecognition,
// } from "react-speech-recognition";

// interface TextProps {}

// const Text: FC<TextProps> = ({}) => {
//   const {
//     transcript,
//     listening,
//     resetTranscript,
//     browserSupportsSpeechRecognition,
//   } = useSpeechRecognition();

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Browser does not support speech recognition.</span>;
//   }

//   return (
//     <div>
//       <h1 className="lg:text-5xl font-bold underline decoration-wavy text-2xl">
//         Speech to text
//       </h1>
//       <p className=" mt-6 pb-32 mb-4 rounded-md bg-base-100 lg:w-96 lg:h-48 w-64 h-64">
//         <span className="ml-2 font-bold text-xl bg-base-100">generated text:</span>
//         {transcript}
//       </p>
//         <p className="mb-2 text-xl font-bold">Microphone: {listening ? 'Listing to your voice..' : 'off'}</p>
//       <div className="flex gap-3">
//         <button className="btn btn-primary btn-sm" onClick={SpeechRecognition.startListening}>Start</button>
//         <button className="btn btn-secondary btn-sm" onClick={SpeechRecognition.stopListening}>Stop</button>
//         <button className="btn btn-accent btn-sm" onClick={resetTranscript}>Reset</button>
//       </div>
//     </div>
//   );
// };

// export default Text;

"use client";

import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './SaathiAssistant.css';

// Define TypeScript interfaces for the conversation entries
interface ConversationEntry {
  speaker: 'user' | 'saathi' | 'system';
  text: string;
}

// Define the expected response structure from the backend
interface ApiResponse {
  reply?: string;
  error?: string;
}

const SaathiAssistant: React.FC = () => {
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Function to send query to backend and get AI response
  const askSaathi = async (userQuery: string): Promise<void> => {
    if (!userQuery.trim()) return;

    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/ask-saathi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userQuery }),
      });

      if (!response.ok) {
        throw new Error(`Server error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      if (data.reply) {
        // Add AI response to conversation
        const newEntry: ConversationEntry = { speaker: 'saathi', text: data.reply };
        setConversation(prev => [...prev, newEntry]);
        
        // Speak the response
        speakText(data.reply);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorEntry: ConversationEntry = { 
        speaker: 'system', 
        text: error instanceof Error ? error.message : 'Sorry, network error. Please try again.' 
      };
      setConversation(prev => [...prev, errorEntry]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle speech synthesis
  const speakText = (text: string): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Set language to Hindi
      utterance.rate = 0.9; // Slightly slower pace
      window.speechSynthesis.speak(utterance);
    }
  };

  // Effect to handle when speech recognition ends
  useEffect(() => {
    if (!listening && transcript) {
      // Add user's spoken text to conversation
      const userEntry: ConversationEntry = { speaker: 'user', text: transcript };
      setConversation(prev => [...prev, userEntry]);
      
      // Send the transcribed text to the backend API
      askSaathi(transcript);
      
      // Reset the transcript for the next interaction
      resetTranscript();
    }
  }, [listening, transcript, resetTranscript]);

  // Start/stop listening function
  const toggleListening = (): void => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ 
        //language: 'hi-IN', // Hindi language
        language: 'en-US',
        continuous: true 
      });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className="error">Your browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="saathi-container">
      <h1>Porter Saathi</h1>
      
      {/* Status Indicator */}
      <div className={`status ${listening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}>
        {isProcessing ? 'Saathi is thinking...' : 
         listening ? 'Listening... Speak now' : 'Press mic to talk'}
      </div>

      {/* Microphone Button - Main Interface */}
      <button 
        className={`mic-btn ${listening ? 'active' : ''}`}
        onClick={toggleListening}
        disabled={isProcessing}
        aria-label={listening ? 'Stop listening' : 'Start listening'}
      >
        <span className="mic-icon">🎤</span>
      </button>

      {/* Live Transcript Display */}
      {transcript && (
        <div className="transcript">
          <strong>You said:</strong> {transcript}
        </div>
      )}

      {/* Conversation History */}
      <div className="conversation">
        {conversation.map((entry, index) => (
          <div key={index} className={`message ${entry.speaker}`}>
            <strong>{entry.speaker.toUpperCase()}:</strong> {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaathiAssistant;