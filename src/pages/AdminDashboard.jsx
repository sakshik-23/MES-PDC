import React, { useState, useEffect, useMemo } from 'react';
import { Plus, X, User, Database, LayoutDashboard, FileText, Edit2, Search, Trash2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

// Firebase Imports
import { db, COLLECTIONS } from '../config/firebase'; 
import { collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  // --- STATE ---
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    phone: '', 
    email: '' 
  });

  const [searchQuery, setSearchQuery] = useState('');

  // --- REAL-TIME DATA ---
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.STUDENTS), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(list);
    });
    return () => unsubscribe();
  }, []);

  // --- LIVE SEARCH LOGIC ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  // --- HANDLERS ---
  const handleOpenEdit = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name || '',
      username: member.username || '',
      phone: member.phone || '',
      email: member.email || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, COLLECTIONS.STUDENTS, editingId), formData);
      } else {
        await addDoc(collection(db, COLLECTIONS.STUDENTS), {
          ...formData,
          createdAt: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', username: '', phone: '', email: '' });
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this member?")) {
      await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
    }
  };

  return (
    /* FIXED: flex-1 h-screen overflow-hidden ensures the dashboard takes full height but doesn't create a double scrollbar */
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden">
      
      {/* Header & Search - Remains Fixed at the top */}
      <div className="bg-white border-b px-8 py-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Student Records</h2>
          <Button onClick={() => { setEditingId(null); setIsModalOpen(true); }} className="bg-blue-600 text-white">
            <Plus size={18} className="mr-2" /> Add Student
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name or username..."
            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FIXED: Added overflow-y-auto and flex-1 to this container to enable scrolling only for the grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20"> {/* pb-20 adds extra space at the bottom */}
          {filteredMembers.map((m) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl border shadow-sm relative group hover:shadow-md transition-shadow">
              <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => handleOpenEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{m.name}</h3>
                  <p className="text-sm text-gray-500">@{m.username}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2"><span>📞</span> {m.phone}</p>
                <p className="flex items-center gap-2"><span>✉️</span> {m.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal remains the same */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Student' : 'Add Student'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input 
                placeholder="Full Name" 
                className="w-full p-3 border rounded-xl"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
              <input 
                placeholder="Username (e.g. saurabh23)" 
                className="w-full p-3 border rounded-xl"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
              <input 
                placeholder="Phone Number" 
                className="w-full p-3 border rounded-xl"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
              <input 
                placeholder="Email Address" 
                className="w-full p-3 border rounded-xl"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200">Cancel</Button>
                <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white hover:bg-blue-700">
                  {loading ? 'Saving...' : 'Save Student'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}