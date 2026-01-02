import React, { useState, useEffect, useMemo } from 'react';
import { UserPlus, Trash2, Phone, Mail, User, Save, X, Search, Edit2 } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function MemberManagement() {
  const [members, setMembers] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null); // Tracks which member is being edited
  const [searchQuery, setSearchQuery] = useState(''); // Live search state
  
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', username: '', password: 'password'
  });

  // --- 1. REAL-TIME DATA LISTENER ---
  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", "MEMBER"));
    const unsub = onSnapshot(q, (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // --- 2. LIVE SEARCH LOGIC ---
  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mobile?.includes(searchQuery)
    );
  }, [members, searchQuery]);

  // --- 3. HANDLERS ---
  const handleEditClick = (member) => {
    setEditingId(member.id);
    setFormData({
      name: member.name,
      mobile: member.mobile,
      email: member.email || '',
      username: member.username,
      password: member.password || 'password'
    });
    setIsAdding(true); // Open the form card
  };

  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.username) return alert("Fill required fields");
    
    try {
      if (editingId) {
        // UPDATE EXISTING MEMBER
        const memberRef = doc(db, COLLECTIONS.USERS, editingId);
        await updateDoc(memberRef, {
          ...formData,
          updatedAt: new Date().toISOString()
        });
        alert("Member Updated!");
      } else {
        // ADD NEW MEMBER
        await addDoc(collection(db, COLLECTIONS.USERS), {
          ...formData, 
          role: 'MEMBER', 
          status: 'Active', 
          createdAt: new Date().toISOString()
        });
        alert("Member Added!");
      }
      resetForm();
    } catch (err) { alert("Error: " + err.message); }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', mobile: '', email: '', username: '', password: 'password' });
  };

  const handleDelete = async (id, name) => {
    if (confirm(`Remove ${name}?`)) {
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Council Members</h2>
          <p className="text-sm text-gray-500">Manage and edit your team members</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search members..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>
              <UserPlus size={18} className="mr-2" /> Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Add/Edit Form Card */}
      {isAdding && (
        <Card className="p-6 mb-8 border-l-4 border-blue-600 bg-blue-50 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg text-blue-900">
              {editingId ? `Edit Details: ${formData.name}` : "Register New Member"}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-800 transition-colors">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSaveMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <Input label="Username" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
            <Input label="Mobile" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} required />
            <Input label="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="Password" type="text" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <div className="col-span-full flex gap-3 mt-4 border-t pt-4 border-blue-100">
              <Button type="submit">
                <Save size={18} className="mr-2" /> {editingId ? "Update Changes" : "Save Member"}
              </Button>
              <Button variant="secondary" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.length > 0 ? (
          filteredMembers.map(m => (
            <Card key={m.id} className="p-6 relative hover:shadow-lg transition-shadow border border-transparent hover:border-blue-100 group">
              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleEditClick(m)} 
                  className="text-gray-400 hover:text-blue-600 transition-colors bg-white p-1.5 rounded-md shadow-sm border border-gray-100"
                  title="Edit Member"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(m.id, m.name)} 
                  className="text-gray-400 hover:text-red-600 transition-colors bg-white p-1.5 rounded-md shadow-sm border border-gray-100"
                  title="Remove Member"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Identity */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 text-blue-600 p-2.5 rounded-full">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{m.name}</h3>
                  <p className="text-xs text-gray-500 font-mono">@{m.username}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-sm text-gray-600 space-y-2 border-t pt-3">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-blue-400" /> 
                  <span className="font-medium">{m.mobile}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-blue-400" /> 
                  <span className="truncate">{m.email || 'No email provided'}</span>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No members found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}