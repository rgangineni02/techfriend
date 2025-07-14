'use client';

import { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function AuthForm() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setMessage('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        router.push('/dashboard');
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: username });
        }
        setMessage('Account created successfully. Please sign in.');
        setMode('signin');
      } else if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        setMessage('Check your email for reset link.');
      }
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">Welcome to TechFriend</h1>

        <div className="space-y-4">
          {mode === 'signup' && (
            <input
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          )}

          <input
            className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          {mode !== 'forgot' && (
            <input
              className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition font-medium py-2 rounded text-white"
          >
            {loading
              ? 'Loading...'
              : mode === 'signin'
              ? 'Sign In'
              : mode === 'signup'
              ? 'Sign Up'
              : 'Send Reset Email'}
          </button>

          <div className="text-sm text-center text-gray-300 mt-4 space-y-1">
            {mode === 'signin' && (
              <>
                <p>
                  Don&apos;t have an account?{' '}
                  <button className="underline" onClick={() => setMode('signup')}>
                    Sign Up
                  </button>
                </p>
                <p>
                  <button className="underline" onClick={() => setMode('forgot')}>
                    Forgot Password?
                  </button>
                </p>
              </>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button className="underline" onClick={() => setMode('signin')}>
                  Sign In
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <p>
                Back to{' '}
                <button className="underline" onClick={() => setMode('signin')}>
                  Sign In
                </button>
              </p>
            )}

            {message && (
              <p
                className={`mt-2 text-sm ${
                  message.toLowerCase().includes('success') ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
