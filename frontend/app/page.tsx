// @ts-nocheck
"use client";

import React from "react";
import SaathiAssistant from "./components/Text"; // the voice assistant component

export default function Page() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] flex items-start justify-center p-8">

      <div className="w-full max-w-6xl">
        <Header />

        <div className="mt-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Left: main content (voice assistant) */}
              <div className="col-span-8">
                <h1 className="text-4xl font-extrabold text-gray-900">
                  Talk to Saathi
                </h1>
                <p className="mt-2 text-gray-600">
                  Speak in Hindi/Hinglish — press any key or tap the mic
                </p>

                <div className="mt-8">
                  <SaathiAssistant />
                </div>
              </div>

              {/* Right: helper column */}
              <aside className="col-span-4 space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-white border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Quick Tips
                    </h3>
                  </div>
                  <ul className="mt-3 text-sm text-gray-700 space-y-2">
                    <li>• Press any key to start/stop (unless typing)</li>
                    <li>• Ask: “Aaj ka net kitna hai?”</li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg bg-white shadow-sm border">
                  <h4 className="font-semibold text-gray-800">Emergency</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    One touch help (demo)
                  </p>
                  <button
                    onClick={() => {
                      const u = new SpeechSynthesisUtterance(
                        "Sahayata bheji ja rahi hai. Kripya shant rahen."
                      );
                      u.lang = "hi-IN";
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(u);
                    }}
                    className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow"
                  >
                    SAHAYATA
                  </button>
                </div>

                {/* New User Info + Earnings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white shadow-sm border">
                    <h4 className="font-semibold text-gray-800">User ID</h4>
                    <p className="mt-2 text-xl font-bold text-gray-900">
                      DRV12345
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-white shadow-sm border">
                    <h4 className="font-semibold text-gray-800">Earnings</h4>
                    <p className="mt-2 text-xl font-bold text-green-600">
                      ₹ 1,250
                    </p>
                    <p className="text-xs text-gray-500">Today</p>
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  Demo only — in production, confirm location & consent before
                  sharing.
                </div>
              </aside>
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Porter Saathi • Hackathon Demo
        </footer>
      </div>
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-4">
      <img
        src="/porter_logo.png"
        alt="Porter Saathi"
        className="w-14 h-14 rounded-md shadow-sm object-cover"
      />
      <div>
        <div className="text-2xl font-bold text-gray-900">Porter Saathi</div>
        <div className="text-sm text-gray-600">
          Voice-first assistant for driver partners
        </div>
      </div>
    </header>
  );
}
