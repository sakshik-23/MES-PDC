import React, { useState, useEffect } from 'react';
import { FileText, Send, ArrowLeft } from 'lucide-react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function MemberQuestionnaires({ currentUser }) {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  
  // Response State
  const [studentName, setStudentName] = useState('');
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.QUESTIONNAIRES), (snap) => {
      setForms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentName) return alert("Enter Student Name");
    
    // Check if all questions answered
    const allAnswered = selectedForm.questions.every(q => answers[q] && answers[q].trim());
    if (!allAnswered) return alert("Please answer all questions");

    try {
      await addDoc(collection(db, COLLECTIONS.RESPONSES), {
        questionnaireId: selectedForm.id,
        questionnaireTitle: selectedForm.title,
        studentName,
        answers,
        submittedBy: currentUser.id,
        memberName: currentUser.name,
        date: new Date().toISOString().split('T')[0]
      });
      alert("Response Submitted Successfully!");
      setSelectedForm(null);
      setStudentName('');
      setAnswers({});
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  if (selectedForm) {
    return (
      <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
        <button onClick={() => setSelectedForm(null)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6">
          <ArrowLeft size={18} /> Back to List
        </button>
        
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">{selectedForm.title}</h2>
          <p className="text-gray-500 mb-6">Please interview the student and fill out the details below.</p>

          <Card className="p-8">
            <form onSubmit={handleSubmit}>
              <div className="bg-blue-50 p-4 rounded-lg mb-8 border border-blue-100">
                <Input 
                  label="Student Name" 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  placeholder="e.g. Rohan Sharma"
                  required
                />
              </div>

              <div className="space-y-6">
                {selectedForm.questions.map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-gray-800 font-medium mb-2">
                      {idx + 1}. {q} <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[80px]"
                      placeholder="Enter answer here..."
                      value={answers[q] || ''}
                      onChange={e => handleAnswerChange(q, e.target.value)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t">
                <Button type="submit" className="w-full">
                  <Send size={18} /> Submit Response
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Questionnaires</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <Card key={form.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedForm(form)}>
            <div onClick={() => setSelectedForm(form)}>
              <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-teal-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{form.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{form.questions?.length || 0} Questions</p>
              <span className="text-blue-600 text-sm font-medium hover:underline">Start &rarr;</span>
            </div>
          </Card>
        ))}
        {forms.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No questionnaires available. Ask Admin to create one.
          </div>
        )}
      </div>
    </div>
  );
}