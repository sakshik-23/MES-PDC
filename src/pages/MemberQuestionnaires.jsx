import React, { useState, useEffect } from 'react';
import { FileText, Send, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { collection, addDoc, onSnapshot, query, where, updateDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Badge } from '../components/Badge';

export default function MemberQuestionnaires({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    
    // Listen for tasks specifically assigned to THIS member that are PENDING
    const q = query(
      collection(db, COLLECTIONS.SCHEDULES),
      where("assignedMemberId", "==", currentUser.id),
      where("status", "==", "PENDING")
    );

    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allAnswered = selectedTask.questions.every(q => answers[q]?.trim());
    if (!allAnswered) return alert("Please answer all questions");

    setLoading(true);
    try {
      // 1. Save the actual response
      await addDoc(collection(db, COLLECTIONS.RESPONSES), {
        scheduleId: selectedTask.id,
        questionnaireTitle: selectedTask.title,
        studentId: selectedTask.studentId,
        studentName: selectedTask.studentName,
        answers,
        submittedBy: currentUser.id,
        memberName: currentUser.name,
        date: new Date().toISOString()
      });

      // 2. Mark the schedule as COMPLETED
      await updateDoc(doc(db, COLLECTIONS.SCHEDULES, selectedTask.id), {
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });

      alert("Report Submitted!");
      setSelectedTask(null);
      setAnswers({});
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (selectedTask) {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <button onClick={() => setSelectedTask(null)} className="flex items-center gap-2 text-gray-500 mb-6">
          <ArrowLeft size={18} /> Back to Tasks
        </button>
        
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
              <p className="text-blue-600 font-medium">Student: {selectedTask.studentName}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedTask.questions.map((q, idx) => (
                <div key={idx}>
                  <label className="block text-gray-800 font-medium mb-2">{idx + 1}. {q}</label>
                  <textarea
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    value={answers[q] || ''}
                    onChange={e => setAnswers({...answers, [q]: e.target.value})}
                    required
                  />
                </div>
              ))}
              <Button type="submit" className="w-full" disabled={loading}>
                <Send size={18} className="mr-2" /> {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assigned Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => (
          <Card key={task.id} className="p-6 border-l-4 border-blue-500 hover:shadow-md cursor-pointer" onClick={() => setSelectedTask(task)}>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-100 p-2 rounded-lg"><Clock className="text-blue-700" size={20} /></div>
              <Badge variant="outline">Pending</Badge>
            </div>
            <h3 className="font-bold text-gray-800 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600 mb-4">For Student: <span className="font-semibold">{task.studentName}</span></p>
            <div className="text-blue-600 text-sm font-bold flex items-center">Start Interview &rarr;</div>
          </Card>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed">
          <CheckCircle className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No pending reports assigned to you.</p>
        </div>
      )}
    </div>
  );
}