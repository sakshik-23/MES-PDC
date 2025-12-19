import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText, CheckCircle } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
// Added explicit extensions (.js/.jsx) to fix resolution errors
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';

export default function AdminQuestionnaires() {
  const [forms, setForms] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  // New Form State
  const [newTitle, setNewTitle] = useState('');
  const [questions, setQuestions] = useState(['']); // Start with 1 empty question

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.QUESTIONNAIRES), (snap) => {
      setForms(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const handleAddQuestionField = () => {
    setQuestions([...questions, '']);
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSaveForm = async () => {
    if (!newTitle.trim()) return alert("Enter a title");
    if (questions.some(q => !q.trim())) return alert("Please fill out all questions");

    try {
      await addDoc(collection(db, COLLECTIONS.QUESTIONNAIRES), {
        title: newTitle,
        questions: questions,
        createdAt: new Date().toISOString()
      });
      setIsCreating(false);
      setNewTitle('');
      setQuestions(['']);
      alert("Questionnaire Saved!");
    } catch (err) {
      alert("Error saving: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this questionnaire?")) {
      await deleteDoc(doc(db, COLLECTIONS.QUESTIONNAIRES, id));
    }
  };

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Questionnaire Manager</h2>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={18} /> Create New
          </Button>
        )}
      </div>

      {isCreating ? (
        <Card className="p-6 max-w-3xl">
          <h3 className="text-xl font-bold mb-4">New Questionnaire</h3>
          <Input 
            label="Title (e.g. Stress Management Assessment)" 
            value={newTitle} 
            onChange={e => setNewTitle(e.target.value)} 
          />
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
            {questions.map((q, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  className="flex-1 px-3 py-2 border rounded-md"
                  placeholder={`Question ${idx + 1}`}
                  value={q}
                  onChange={e => handleQuestionChange(idx, e.target.value)}
                />
                <button onClick={() => handleRemoveQuestion(idx)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button onClick={handleAddQuestionField} className="text-blue-600 text-sm font-medium mt-2 hover:underline">
              + Add Another Question
            </button>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveForm}><Save size={18} /> Save Questionnaire</Button>
            <Button variant="secondary" onClick={() => setIsCreating(false)}>Cancel</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <Card key={form.id} className="p-6 relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <FileText className="text-purple-700" />
                </div>
                <button onClick={() => handleDelete(form.id)} className="text-gray-400 hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{form.title}</h3>
              <p className="text-sm text-gray-500">{form.questions?.length || 0} Questions</p>
            </Card>
          ))}
          {forms.length === 0 && <p className="text-gray-500">No questionnaires created yet.</p>}
        </div>
      )}
    </div>
  );
}