import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Phone, Mail, User, Save, X } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', username: '', password: 'password'
  });

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", "MEMBER"));
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.username) return alert("Fill required fields");
    try {
      await addDoc(collection(db, COLLECTIONS.USERS), {
        ...formData, role: 'MEMBER', status: 'Active', createdAt: new Date().toISOString()
      });
      alert("Member Added!");
      setIsAdding(false);
      setFormData({ name: '', mobile: '', email: '', username: '', password: 'password' });
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove ${name}?`)) {
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Council Members</h2>
        {!isAdding && <Button onClick={() => setIsAdding(true)}><UserPlus size={18} /> Add Member</Button>}
      </div>

      {isAdding && (
        <Card className="p-6 mb-8 border-l-4 border-blue-600 bg-blue-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-blue-900">Register New Member</h3>
            <button onClick={() => setIsAdding(false)}><X size={20} /></button>
          </div>
          <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <Input label="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
            <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <div className="col-span-full flex gap-3 mt-2">
              <Button type="submit"><Save size={18} /> Save</Button>
              <Button variant="secondary" onClick={() => setIsAdding(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map(m => (
          <Card key={m.id} className="p-6 relative">
            <button onClick={() => handleDelete(m.id, m.name)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-gray-100 p-2 rounded-full"><User size={20} /></div>
              <div><h3 className="font-bold">{m.name}</h3><p className="text-xs text-gray-500">@{m.username}</p></div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center gap-2"><Phone size={14} /> {m.mobile}</div>
              <div className="flex items-center gap-2"><Mail size={14} /> {m.email}</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}