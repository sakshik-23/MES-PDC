import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Users, FileText, ClipboardList } from 'lucide-react';
import { doc, addDoc, updateDoc, deleteDoc, collection } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Badge } from '../components/Badge.jsx';

export default function MemberDashboard({ currentUser, reports, students = [] }) {
  const [activeTab, setActiveTab] = useState('STUDENTS'); // PROFILE, STUDENTS, REPORTS
  const [mode, setMode] = useState('list');
  const [editData, setEditData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const myReports = reports.filter(r => r.createdBy === currentUser.id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { 
        ...formData, 
        createdBy: currentUser.id, 
        date: new Date().toISOString().split('T')[0] 
      };
      if (editData) {
        await updateDoc(doc(db, COLLECTIONS.REPORTS, editData.id), payload);
        alert("Report Updated");
      } else {
        await addDoc(collection(db, COLLECTIONS.REPORTS), payload);
        alert("Report Submitted");
      }
      setMode('list'); setEditData(null); setFormData({}); setActiveTab('REPORTS');
    } catch (err) {
      console.error(err);
      alert("Error saving report: " + err.message);
    }
    setIsLoading(false);
  };

  const startNewReport = (type, student = null) => {
    setEditData(null);
    setFormData({ 
      type, 
      studentName: student?.name || '', 
      standard: student?.standard || '',
      division: student?.division || '',
      phone: student?.phoneNumber || '',
      // Default structure for requested Counselling fields
      natureOfProblem: { teacher: '', parent: '', student: '' },
      behavioralObs: { inSchool: '', withFriends: '' },
      development: { physical: '', cognitive: '', emotional: '', social: '' }
    });
    setMode('add');
  };

  if (mode === 'add') {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">{editData ? 'Edit' : 'New'} {formData.type} Report</h2>
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {formData.type === 'Session' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={formData.sessionDate || ''} onChange={e => setFormData({...formData, sessionDate: e.target.value})} required />
                    <Input label="Objective" value={formData.objective || ''} onChange={e => setFormData({...formData, objective: e.target.value})} required />
                  </div>
                  <Input label="Activity (if any)" value={formData.activity || ''} onChange={e => setFormData({...formData, activity: e.target.value})} />
                  <Input label="Students/Parents Response" value={formData.response || ''} onChange={e => setFormData({...formData, response: e.target.value})} />
                  <Input label="Observation during session" value={formData.observation || ''} onChange={e => setFormData({...formData, observation: e.target.value})} />
                  <Input label="Next session's plan" value={formData.nextPlan || ''} onChange={e => setFormData({...formData, nextPlan: e.target.value})} />
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-bold border-b pb-2 text-blue-800">1. Personal Information</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Name" value={formData.studentName || ''} readOnly />
                    <Input label="Standard" value={formData.standard || ''} readOnly />
                    <Input label="Division" value={formData.division || ''} readOnly />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Date of Birth" type="date" onChange={e => setFormData({...formData, dob: e.target.value})} />
                    <Input label="Age" type="number" onChange={e => setFormData({...formData, age: e.target.value})} />
                    <Input label="Sex" onChange={e => setFormData({...formData, sex: e.target.value})} />
                  </div>
                  <Input label="Address" onChange={e => setFormData({...formData, address: e.target.value})} />
                  
                  <h3 className="font-bold border-b pb-2 text-blue-800">2. Nature of the Problem</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="a. Stated by Teacher" onChange={e => setFormData({...formData, natureOfProblem: {...formData.natureOfProblem, teacher: e.target.value}})} />
                    <Input label="b. Stated by Parent" onChange={e => setFormData({...formData, natureOfProblem: {...formData.natureOfProblem, parent: e.target.value}})} />
                    <Input label="c. Stated by Student" onChange={e => setFormData({...formData, natureOfProblem: {...formData.natureOfProblem, student: e.target.value}})} />
                  </div>

                  <h3 className="font-bold border-b pb-2 text-blue-800">3. Developmental History & Observations</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Birth History" onChange={e => setFormData({...formData, birthHistory: e.target.value})} />
                    <Input label="School History" onChange={e => setFormData({...formData, schoolHistory: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Behavioral (In School)" onChange={e => setFormData({...formData, behavioralObs: {...formData.behavioralObs, inSchool: e.target.value}})} />
                    <Input label="Behavioral (Friends/Teachers)" onChange={e => setFormData({...formData, behavioralObs: {...formData.behavioralObs, withFriends: e.target.value}})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Physical Dev" onChange={e => setFormData({...formData, development: {...formData.development, physical: e.target.value}})} />
                    <Input label="Cognitive Dev" onChange={e => setFormData({...formData, development: {...formData.development, cognitive: e.target.value}})} />
                  </div>
                  <Input label="Main Goals of Counselling" onChange={e => setFormData({...formData, mainGoals: e.target.value})} />
                </div>
              )}
              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" disabled={isLoading} className="flex-1">{isLoading ? 'Saving...' : 'Submit Report'}</Button>
                <Button variant="secondary" onClick={() => setMode('list')}>Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white border-b px-8 pt-4 flex gap-8">
        {[
          { id: 'STUDENTS', label: 'Student List', icon: <Users size={18}/> },
          { id: 'REPORTS', label: 'My Reports', icon: <ClipboardList size={18}/> },
          { id: 'PROFILE', label: 'My Profile', icon: <User size={18}/> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 px-1 border-b-2 transition-colors ${activeTab === tab.id ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-500'}`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'PROFILE' && (
          <Card className="max-w-2xl p-8 space-y-4">
            <h2 className="text-2xl font-bold border-b pb-4 mb-4">Profile Details</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <span className="text-gray-500">Full Name:</span><span className="font-medium">{currentUser.name}</span>
              <span className="text-gray-500">Username:</span><span className="font-medium">{currentUser.username}</span>
              <span className="text-gray-500">Mobile:</span><span className="font-medium">{currentUser.mobile}</span>
              <span className="text-gray-500">Role:</span><Badge type="Active">{currentUser.role}</Badge>
            </div>
          </Card>
        )}

        {activeTab === 'STUDENTS' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Assigned Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map(student => (
                <Card key={student.id} className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">{student.name}</h3>
                    <p className="text-sm text-gray-500">Std: {student.standard} - Div: {student.division}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" onClick={() => startNewReport('Session', student)} variant="outline" className="justify-start gap-2">
                      <FileText size={14}/> Fill Session Report
                    </Button>
                    <Button size="sm" onClick={() => startNewReport('Counselling', student)} variant="outline" className="justify-start gap-2">
                      <ClipboardList size={14}/> Fill Counselling Report
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Submitted Questionnaires</h2>
            <Card className="overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b">
                  <tr><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Student</th><th className="p-4 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {myReports.map(r => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{r.date}</td>
                      <td className="p-4"><Badge type={r.type}>{r.type}</Badge></td>
                      <td className="p-4">{r.studentName}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => { setEditData(r); setFormData(r); setMode('add'); }} className="text-blue-600 p-2"><Edit size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}