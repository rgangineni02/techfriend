// File: app/topics/page.tsx
'use client';

import { useRouter } from 'next/navigation';

const topics = [
  {
    id: 'data-structures',
    title: 'Data Structures',
    description: 'Arrays, stacks, queues, trees, graphs, and more.',
    level: 'INTERMEDIATE',
    icon: '🗂️',
  },
  {
    id: 'algorithms',
    title: 'Algorithms',
    description: 'Sorting, searching, dynamic programming, and greedy techniques.',
    level: 'INTERMEDIATE',
    icon: '🧠',
  },
  {
    id: 'os',
    title: 'Operating Systems',
    description: 'Processes, memory, scheduling, and synchronization.',
    level: 'ADVANCED',
    icon: '💻',
  },
  {
    id: 'db',
    title: 'Databases',
    description: 'SQL, NoSQL, indexing, normalization.',
    level: 'BEGINNER',
    icon: '🗃️',
  },
  {
    id: 'networks',
    title: 'Computer Networks',
    description: 'TCP/IP, HTTP, DNS, and OSI model.',
    level: 'INTERMEDIATE',
    icon: '🌐',
  },
];

export default function ExploreTopics() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Explore Topics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {topics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => router.push(`/topics/${topic.id}`)}
            className="cursor-pointer bg-gray-900 p-6 rounded-2xl shadow-md border border-gray-700 transition-transform hover:scale-[1.03] hover:shadow-lg"
          >
            <div className="text-3xl mb-3">{topic.icon}</div>
            <h2 className="text-xl font-semibold mb-1">{topic.title}</h2>
            <p className="text-gray-400 mb-2">{topic.description}</p>
            <span className="text-blue-400 text-sm font-medium">{topic.level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
