// @ts-nocheck
"use client";

import React from "react";
import Text from "./components/Text";

export default function Page() {
  return (
    <main className="min-h-screen bg-white flex items-start justify-center py-12 px-6">
      <div className="w-full max-w-5xl">
        <Header />

        <div className="mt-8">
          {/* centered desktop card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left: Large content area (voice assistant) */}
              <div className="col-span-8">
                <h1 className="text-4xl font-extrabold">Talk to Saathi</h1>
                <p className="mt-2 text-gray-600">
                  Speak in Hindi/Hinglish — press any key or tap the button
                </p>

                <div className="mt-6">
                  <Text />
                </div>
              </div>

              {/* Right: small info / helper column */}
              <aside className="col-span-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Quick Tips</h3>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Press any key to start/stop (unless typing)</li>
                    {/*<li>• Use Chrome/Edge for best results</li> */}
                    <li>• Ask: “Aaj ka net kitna hai?”</li>
                  </ul>
                </div>

                <div className="mt-4">
                  <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h4 className="font-semibold">Emergency</h4>
                    <p className="text-sm text-gray-500 mt-1">One touch help (demo)</p>
                    <button
                      onClick={() => {
                        const u = new SpeechSynthesisUtterance("Hello Shweta, Akanksha aur Niyam.");
                        u.lang = "hi-IN";
                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(u);
                      }}
                      className="mt-4 w-full bg-red-600 text-white py-2 rounded-md font-semibold"
                    >
                      SAHAYATA
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Demo only — in production, confirm location & consent before sharing.
                </div>
              </aside>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Porter Saathi • Hackathon Demo
        </footer>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-4">
      <img src="/porter_logo.png" alt="Porter Saathi" className="w-14 h-14 rounded-md" />
      <div>
        <div className="text-2xl font-bold">Porter Saathi</div>
        <div className="text-sm text-gray-600">Voice-first assistant for driver partners</div>
      </div>
    </header>
  );
}
