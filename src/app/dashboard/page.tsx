"use client";

import { useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import ProfileWidget from "../components/ProfileWidget";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, []);

  const features = [
    {
      title: "Find a Competitor",
      description: "Match with others to challenge your knowledge.",
      icon: "👤",
      action: () => router.push("/competitor"),
    },
    {
      title: "Start Learning",
      description: "Browse topics and begin your journey.",
      icon: "🔄",
      action: () => router.push("/topics"),
    },
    {
      title: "Join a Group",
      description: "Learn together by joining a study group.",
      icon: "💬",
      action: () => router.push("/group"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white px-6 py-10">
    
        <div className="text-center mb-8">
  <h1 className="text-4xl font-bold mb-2">
    Welcome, {user?.displayName || user?.email || 'User'} 
  </h1>
  <p className="text-gray-400 text-lg">
    “Consistency beats intensity. Let’s make progress today!” 🌟
  </p>
      </div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105 border border-gray-700">
          <h2 className="text-lg font-semibold text-blue-400 mb-2">🔥 Points</h2>
          <p className="text-3xl font-bold">1280 XP</p>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
            <div className="w-[64%] h-full bg-blue-500" />
          </div>
          <p className="text-xs text-gray-400 mt-1">Level 3 - 640/1000 XP</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105 border border-gray-700">
          <h2 className="text-lg font-semibold text-yellow-400 mb-2">🥇 Badges</h2>
          <div className="flex gap-2">
            <span className="bg-yellow-600 text-xs px-2 py-1 rounded-full">Starter</span>
            <span className="bg-green-600 text-xs px-2 py-1 rounded-full">Streak x5</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">2 of 10 unlocked</p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105 border border-gray-700">
          <h2 className="text-lg font-semibold text-purple-400 mb-1">📚 Continue Learning</h2>
          <p className="font-bold">Data Structures</p>
          <p className="text-xs text-gray-400">Last visited: Sorting Algorithms</p>
          <button className="mt-2 bg-purple-600 px-4 py-1 rounded hover:bg-purple-700 transition">
            Resume
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="bg-gray-900 p-6 rounded-xl shadow hover:shadow-lg transition transform hover:-translate-y-1 hover:scale-105 cursor-pointer border border-gray-700 hover:border-blue-600"
            onClick={feature.action}
          >
            <h2 className="text-xl font-semibold mb-2">
              <span className="text-2xl mr-2">{feature.icon}</span>
              {feature.title}
            </h2>
            <p className="text-sm text-gray-300">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* What's New Section */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-2">✨ What’s New</h2>
        <ul className="list-none space-y-2 text-sm text-gray-300">
          <li>🚀 Group chat rooms now support video calls</li>
          <li>📚 New learning topics on Algorithms and Web3</li>
          <li>🏅 Earn badges by maintaining your daily streak</li>
        </ul>
      </div>

      {/* Motivational Footer */}
      <p className="text-center text-gray-500 italic mt-10">
        "Learning is not a race, it's a journey." 🌱
      </p>

      <ProfileWidget />
    </div>
  );
}
