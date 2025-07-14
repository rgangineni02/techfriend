'use client';
import { useState, useEffect } from 'react';
import { auth, firestore } from '../lib/firebase';
import { collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import GroupChat from './GroupChat';

export default function JoinGroup() {
  const [groupId, setGroupId] = useState('');
  const [groups, setGroups] = useState<any[]>([]);
  const [joinedGroupId, setJoinedGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  

  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, 'groups'), snapshot => {
      const groupList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroups(groupList);
    });

    return () => unsub();
  }, []);

  const createGroup = async () => {
    if (!groupName.trim()) return alert('Enter group name');
    const docRef = await addDoc(collection(firestore, 'groups'), {
      name: groupName,
      createdBy: auth.currentUser?.uid,
    });
    setJoinedGroupId(docRef.id);
  };

  const joinGroup = (id: string) => {
    setJoinedGroupId(id);
  };

  return (
    <div className="p-6 text-white">
      {!joinedGroupId ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Join or Create a Group</h2>

          <div className="mb-4">
            <input
              type="text"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              placeholder="New Group Name"
              className="p-2 rounded bg-gray-800 border border-gray-700 mr-2"
            />
            <button onClick={createGroup} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
              Create
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Available Groups</h3>
            {groups.length === 0 && <p>No groups yet.</p>}
            {groups.map(group => (
              <div key={group.id} className="flex justify-between items-center bg-gray-900 p-3 mb-2 rounded">
                <div>
                  <p className="font-medium">{group.name}</p>
                  <small className="text-gray-400">ID: {group.id}</small>
                </div>
                <button
                  onClick={() => joinGroup(group.id)}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                >
                  Join
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <GroupChat />
      )}
    </div>
  );
}
