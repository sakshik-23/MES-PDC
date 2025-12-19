import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Badge } from '../components/Badge.jsx';

export default function MemberDashboard({ currentUser, reports }) {
  const [mode, setMode] = useState('list');
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const myReports = reports.filter(r => r.createdBy === currentUser.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData, createdBy: currentUser.id, date: new Date().toISOString().split('T')[0] };
      if (editData) {
        await updateDoc(doc(db, COLLECTIONS.REPORTS, editData.id), payload);
        alert("Report Updated");
      } else {
        await addDoc(collection(db, COLLECTIONS.REPORTS), payload);
        alert("Report Submitted");
      }
      setMode('list'); setEditData(null); setFormData({});
    } catch (err) {
      console.error(err);
      alert("Error saving report: " + err.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;
    try {
      await deleteDoc(doc(db, COLLECTIONS.REPORTS, id));
    } catch (err) { alert("Error deleting"); }
  };

  if (mode === 'add') {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">{editData ? 'Edit Report' : 'New Report'}</h2>
          <Card className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2 font-medium">Type</label>
                <div className="flex gap-4">
                  <label className="flex gap-2"><input type="radio" name="type" value="Counselling" checked={formData.type === 'Counselling'} onChange={e => setFormData({...formData, type: e.target.value})} required /> Counselling</label>
                  <label className="flex gap-2"><input type="radio" name="type" value="Session" checked={formData.type === 'Session'} onChange={e => setFormData({...formData, type: e.target.value})} /> Session</label>
                </div>
              </div>
              {formData.type === 'Counselling' && (
                 <div className="grid grid-cols-2 gap-4">
                   <Input label="Student Name" value={formData.studentName||''} onChange={e=>setFormData({...formData, studentName: e.target.value})} required />
                   <Input label="Standard" value={formData.standard||''} onChange={e=>setFormData({...formData, standard: e.target.value})} required />
                 </div>
              )}
              {formData.type === 'Session' && (
                 <div className="grid grid-cols-2 gap-4">
                   <Input label="Topic" value={formData.topic||''} onChange={e=>setFormData({...formData, topic: e.target.value})} required />
                   <Input label="Attendees" type="number" value={formData.attendees||''} onChange={e=>setFormData({...formData, attendees: e.target.value})} required />
                 </div>
              )}
              <Input label="School Name" value={formData.schoolName||''} onChange={e=>setFormData({...formData, schoolName: e.target.value})} required />
              <div className="mb-4">
                <label className="block mb-1 font-medium">Details</label>
                <textarea className="w-full border p-2 rounded h-32" value={formData.content||''} onChange={e=>setFormData({...formData, content: e.target.value})} required></textarea>
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : 'Submit'}</Button>
                <Button variant="secondary" onClick={() => setMode('list')}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Reports</h2>
        <Button onClick={() => { setFormData({ type: 'Counselling' }); setEditData(null); setMode('add'); }}><Plus size={18} /> New Report</Button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {myReports.length === 0 ? <div className="p-8 text-center text-gray-500">No reports yet.</div> : (
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b"><tr><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Summary</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>
              {myReports.map(r => (
                <tr key={r.id} className="border-b">
                  <td className="p-4">{r.date}</td>
                  <td className="p-4"><Badge type={r.type}>{r.type}</Badge></td>
                  <td className="p-4">{r.type === 'Counselling' ? r.studentName : r.topic}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditData(r); setFormData(r); setMode('add'); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}