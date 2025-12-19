import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Bell } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function EventsPage({ currentUser }) {
  const [events, setEvents] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ title: '', date: '', type: 'Notice', description: '' });

  const isAdmin = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    // Sort events by date
    const q = query(collection(db, COLLECTIONS.EVENTS)); 
    // Note: complex queries like 'orderBy' might need an index in Firestore console. 
    // If it fails, remove orderBy and sort in JS.
    
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(a.date) - new Date(b.date)); // JS Sort fallback
      setEvents(data);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!formData.title || !formData.date) return alert("Title and Date are required");
    try {
      await addDoc(collection(db, COLLECTIONS.EVENTS), {
        ...formData,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setFormData({ title: '', date: '', type: 'Notice', description: '' });
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this event?")) await deleteDoc(doc(db, COLLECTIONS.EVENTS, id));
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-blue-600" /> Events & Notices Board
        </h2>
        {isAdmin && !isCreating && (
          <Button onClick={() => setIsCreating(true)}><Plus size={18} /> Post Event</Button>
        )}
      </div>

      {isAdmin && isCreating && (
        <Card className="p-6 mb-8 border-l-4 border-blue-600">
          <h3 className="font-bold mb-4">Post New Event</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Type</label>
            <select 
              className="w-full p-2 border rounded"
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
            >
              <option>Notice</option>
              <option>Meeting</option>
              <option>Workshop</option>
              <option>Deadline</option>
            </select>
          </div>
          <div className="mb-4">
             <label className="block text-sm font-medium mb-1">Description</label>
             <textarea className="w-full border p-2 rounded" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Post to Board</Button>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {events.map(event => (
          <Card key={event.id} className="p-4 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-center min-w-[100px]">
              <div className="text-xs font-bold uppercase">{event.type}</div>
              <div className="text-lg font-bold">{event.date}</div>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p className="text-gray-600 text-sm">{event.description}</p>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-600 p-2">
                <Trash2 size={18} />
              </button>
            )}
          </Card>
        ))}
        {events.length === 0 && (
          <div className="text-center py-10 text-gray-400 bg-white rounded-lg border border-dashed">
            <Bell size={48} className="mx-auto mb-2 opacity-20" />
            <p>No upcoming events or notices.</p>
          </div>
        )}
      </div>
    </div>
  );
}