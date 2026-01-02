import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, Calendar, Users, User, X } from 'lucide-react';
import { collection, addDoc, doc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function AdminQuestionnaires() {
  const [forms, setForms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [questions, setQuestions] = useState(['']);

  // Scheduling State
  const [isScheduling, setIsScheduling] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [members, setMembers] = useState([]);
  const [students, setStudents] = useState([]);
  const [scheduleData, setScheduleData] = useState({ memberId: '', studentId: '' });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.QUESTIONNAIRES), (snap) => {
      setForms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Fetch Members and Students for scheduling dropdowns
    const unsubMembers = onSnapshot(query(collection(db, COLLECTIONS.USERS), where("role", "==", "MEMBER")), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    const unsubStudents = onSnapshot(collection(db, COLLECTIONS.STUDENTS), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsub(); unsubMembers(); unsubStudents(); };
  }, []);

  const handleSaveForm = async () => {
    if (!newTitle.trim() || questions.some(q => !q.trim())) return alert("Please fill all fields");
    try {
      await addDoc(collection(db, COLLECTIONS.QUESTIONNAIRES), {
        title: newTitle,
        questions,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewTitle('');
      setQuestions(['']);
    } catch (err) { alert(err.message); }
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleData.memberId || !scheduleData.studentId) return alert("Select both member and student");
    try {
      await addDoc(collection(db, COLLECTIONS.SCHEDULES), {
        templateId: selectedTemplate.id,
        title: selectedTemplate.title,
        questions: selectedTemplate.questions,
        assignedMemberId: scheduleData.memberId,
        studentId: scheduleData.studentId,
        studentName: students.find(s => s.id === scheduleData.studentId)?.name,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      alert("Task Scheduled Successfully!");
      setIsScheduling(false);
      setScheduleData({ memberId: '', studentId: '' });
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Questionnaire Manager</h2>
        {!isCreating && <Button onClick={() => setIsCreating(true)}><Plus size={18} /> Create New</Button>}
      </div>

      {isCreating ? (
        <Card className="p-6 max-w-3xl">
          <Input label="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          {questions.map((q, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input className="flex-1 px-3 py-2 border rounded-md" value={q} onChange={e => {
                const updated = [...questions];
                updated[idx] = e.target.value;
                setQuestions(updated);
              }} />
              <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}><Trash2 size={18} /></button>
            </div>
          ))}
          <Button onClick={handleSaveForm}><Save size={18} /> Save</Button>
          <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form.id} className="p-6">
              <FileText className="text-purple-700 mb-4" />
              <h3 className="text-lg font-bold mb-2">{form.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{form.questions?.length} Questions</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedTemplate(form); setIsScheduling(true); }}>
                  <Calendar size={14} className="mr-1" /> Schedule
                </Button>
                <button onClick={() => deleteDoc(doc(db, COLLECTIONS.QUESTIONNAIRES, form.id))} className="text-red-400 p-2"><Trash2 size={18} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Scheduling Modal */}
      {isScheduling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold">Schedule: {selectedTemplate?.title}</h3>
              <X className="cursor-pointer" onClick={() => setIsScheduling(false)} />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Member</label>
                <select className="w-full p-2 border rounded-md" value={scheduleData.memberId} onChange={e => setScheduleData({...scheduleData, memberId: e.target.value})}>
                  <option value="">Select Member</option>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Target Student</label>
                <select className="w-full p-2 border rounded-md" value={scheduleData.studentId} onChange={e => setScheduleData({...scheduleData, studentId: e.target.value})}>
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.standard})</option>)}
                </select>
              </div>
              <Button className="w-full" onClick={handleConfirmSchedule}>Confirm Schedule</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}