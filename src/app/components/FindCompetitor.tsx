'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const topics = [
  'Arrays',
  'Strings',
  'Graphs',
  'Dynamic Programming',
  'Web3',
  'SQL',
];

const dummyAvatars = Array.from({ length: 20 }, (_, i) => `/avatars/avatar${(i % 5) + 1}.png`);

export default function FindCompetitor() {
  const [topic, setTopic] = useState('Arrays');
  const [searching, setSearching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const { width, height } = useWindowSize();

  const [playSearchLoop, { stop }] = useSound('/sounds/search-loop.mp3', { loop: true });
  const [playMatchSound] = useSound('/sounds/match-found.mp3');

  const handleFind = () => {
    setSearching(true);
    setMatchFound(false);
    playSearchLoop();

    setTimeout(() => {
      stop();
      setSearching(false);
      setMatchFound(true);
      playMatchSound();
    }, 3000);
  };

  useEffect(() => {
    if (matchFound) {
      const timer = setTimeout(() => setMatchFound(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [matchFound]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4 relative overflow-hidden">
      {/* 🎉 Confetti */}
      {matchFound && <Confetti width={width} height={height} />}

      {/* 🔄 Scrolling Avatars */}
      {searching && (
        <motion.div
          className="absolute top-0 w-full py-4 bg-black/40 flex gap-4 overflow-hidden whitespace-nowrap z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="flex gap-4"
            animate={{ x: ['0%', '-100%'] }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
          >
            {dummyAvatars.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="avatar"
                className="h-10 w-10 rounded-full border-2 border-white"
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* Main Card */}
      <motion.div
        className="relative bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-700 w-full max-w-md text-center z-10"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-1">🤺 Find a Competitor</h2>
        <p className="text-sm text-gray-400 mb-4">
          {searching ? 'Searching for a match...' : 'Choose a topic and get matched instantly'}
        </p>

        {/* Topic Dropdown */}
        <div className="mb-4 text-left">
          <label htmlFor="topic" className="text-sm text-gray-300 mb-1 block">Select Topic</label>
          <select
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={searching}
            className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Find Button */}
        <motion.button
          onClick={handleFind}
          disabled={searching}
          whileTap={{ scale: 0.97 }}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 transform ${
            searching
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg hover:-translate-y-0.5 hover:scale-105'
          }`}
        >
          {searching ? '🔎 Searching...' : '🔍 Find Competitor'}
        </motion.button>

        {matchFound && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-xl font-bold text-green-400">⚔️ Match Found!</h3>
            <p className="text-sm text-gray-300 mt-1">You vs. 🔥 ShadowSlayer</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
