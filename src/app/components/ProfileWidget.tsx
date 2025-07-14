'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function ProfileWidget() {
  const [user] = useAuthState(auth);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log("👤 Current user:", user);
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'techfriend_avatar');

    setUploading(true);

    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dmpzyrsj9/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) {
        await updateProfile(auth.currentUser!, {
          photoURL: data.secure_url,
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-lg"
        title="Open profile"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl">
            {user.displayName?.[0].toUpperCase() || 'U'}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-6 w-80 transition-all">
          <div className="flex flex-col items-center space-y-3">
            {/* Avatar with overlay */}
            <div className="relative">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-300"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full shadow"
                title="Change photo"
              >
                ✏️
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            {/* Username */}
            <h3 className="text-lg font-semibold text-gray-800">{user.displayName || 'Anonymous'}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>

            {/* Upload status */}
            {uploading && (
              <div className="w-full">
                <p className="text-xs text-gray-500 mb-1">Uploading...</p>
                <div className="w-full bg-gray-200 h-2 rounded">
                  <div
                    className="bg-blue-600 h-2 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full py-2 mt-2 bg-red-600 hover:bg-red-700 rounded-xl text-white font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
