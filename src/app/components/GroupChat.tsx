'use client';

import { useEffect, useState } from 'react';
import { auth, firestore, storage } from '../lib/firebase';
import {
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  getDoc,
  arrayUnion,
  QuerySnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { v4 as uuidv4 } from 'uuid';

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your_unsigned_upload_preset'); // Replace with your actual preset
  formData.append('cloud_name', 'your_cloud_name'); // Replace with your cloud name

  const response = await fetch(`https://api.cloudinary.com/v1_1/your_cloud_name/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  return data.secure_url;
};

export default function GroupChat() {
  const [user] = useAuthState(auth);
  const [groups, setGroups] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [inviteCodeInput, setInviteCodeInput] = useState('');

  useEffect(() => {
    if (!user) return;
    const q = query(collection(firestore, 'groups'), where('members', 'array-contains', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedGroup) return;
    const q = query(collection(firestore, `groups/${selectedGroup.id}/messages`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [selectedGroup]);

  const createGroup = async () => {
    if (!groupName.trim() || !user) return;
    const inviteCode = uuidv4().slice(0, 6);
    const groupRef = await addDoc(collection(firestore, 'groups'), {
      name: groupName,
      description: groupDesc,
      members: [user.uid],
      creator: user.uid,
      createdAt: serverTimestamp(),
      inviteCode,
    });
    setGroupName('');
    setGroupDesc('');
    setSelectedGroup({ id: groupRef.id, name: groupName });
  };

  const joinGroupByInviteCode = async () => {
    const q = query(collection(firestore, 'groups'), where('inviteCode', '==', inviteCodeInput));
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

    snapshot.docs.forEach(async (docSnap: QueryDocumentSnapshot<DocumentData>) => {
      const ref = doc(firestore, 'groups', docSnap.id);
      await updateDoc(ref, { members: arrayUnion(user?.uid) });
      setSelectedGroup({ id: docSnap.id, ...docSnap.data() });
    });
    setInviteCodeInput('');
  };

  const sendMessage = async () => {
  if ((!newMessage.trim() && !file) || !selectedGroup || !user) return;

  let fileURL: string | null = null;

  if (file) {
    fileURL = await uploadToCloudinary(file);
  }

  const messageData: any = {
    sender: user.displayName || user.email,
    text: newMessage,
    createdAt: serverTimestamp(),
  };

  if (fileURL) {
    messageData.fileURL = fileURL;
  }

  await addDoc(collection(firestore, `groups/${selectedGroup.id}/messages`), messageData);

  setNewMessage('');
  setFile(null);
};

  const leaveGroup = async (groupId: string) => {
    const ref = doc(firestore, 'groups', groupId);
    const groupSnap = await getDoc(ref);
    const groupData = groupSnap.data();

    if (!groupData?.members || !user?.uid) return;

    const updatedMembers = Array.isArray(groupData.members)
      ? groupData.members.filter((uid: string) => uid !== user.uid)
      : [];

    await updateDoc(ref, { members: updatedMembers });
    setSelectedGroup(null);
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Group Study Room</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mr-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
        />
        <input
          type="text"
          placeholder="Group description"
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          className="mr-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
        />
        <button onClick={createGroup} className="bg-green-600 px-4 py-2 rounded">Create</button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Join with Invite Code"
          value={inviteCodeInput}
          onChange={(e) => setInviteCodeInput(e.target.value)}
          className="mr-2 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
        />
        <button onClick={joinGroupByInviteCode} className="bg-purple-600 px-4 py-2 rounded">Join</button>
      </div>

      <h2 className="text-lg font-semibold mb-2">Your Groups:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {groups.map(group => (
          <div
            key={group.id}
            className={`p-3 rounded border cursor-pointer ${selectedGroup?.id === group.id ? 'bg-blue-800' : 'bg-gray-800'}`}
            onClick={() => setSelectedGroup(group)}
          >
            <div className="font-semibold">{group.name}</div>
            <div className="text-sm text-gray-400">{group.description}</div>
            <div className="text-xs text-gray-500">Invite Code: {group.inviteCode}</div>
          </div>
        ))}
      </div>

      {selectedGroup && (
        <div className="bg-gray-900 p-4 rounded">
          <h3 className="text-xl font-semibold mb-2">Chat: {selectedGroup.name}</h3>

          <div className="h-64 overflow-y-scroll bg-black p-3 mb-3 rounded">
            {messages.map(msg => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.sender}:</strong> {msg.text}
                {msg.fileURL && (
                  <div>
                    <a href={msg.fileURL} target="_blank" className="text-blue-400 underline">Attachment</a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-sm"
            />
            <button onClick={sendMessage} className="bg-blue-600 px-4 py-2 rounded">Send</button>
          </div>

          <button
            onClick={() => leaveGroup(selectedGroup.id)}
            className="text-sm text-red-400 underline"
          >
            Leave Group
          </button>
        </div>
      )}
    </div>
  );
}
