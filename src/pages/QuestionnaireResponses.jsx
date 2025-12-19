import React, { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Input } from '../components/Input.jsx';

export default function QuestionnaireResponses({ currentUser }) {
  const [responses, setResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.RESPONSES), (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Filter for Members (Admin sees all)
      if (!isAdmin) {
        data = data.filter(r => r.submittedBy === currentUser.id);
      }
      
      // Sort newest first
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setResponses(data);
    });
    return () => unsub();
  }, [currentUser, isAdmin]);

  const filteredResponses = responses.filter(r => 
    r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.questionnaireTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isAdmin ? 'All Student Responses' : 'My Submitted Responses'}
      </h2>

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search student or questionnaire..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6">
        {filteredResponses.map(res => (
          <Card key={res.id} className="p-6">
            <div className="flex justify-between items-start mb-4 border-b pb-4">
              <div>
                <h3 className="font-bold text-lg text-blue-900">{res.questionnaireTitle}</h3>
                <p className="text-sm text-gray-600">Student: <span className="font-semibold text-gray-800">{res.studentName}</span></p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div>{res.date}</div>
                {isAdmin && <div className="text-xs text-blue-600">By: {res.memberName}</div>}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-sm text-gray-700 mb-2">Answers:</h4>
              <div className="space-y-3">
                {Object.entries(res.answers || {}).map(([question, answer], idx) => (
                  <div key={idx}>
                    <p className="text-xs text-gray-500 font-medium">{idx + 1}. {question}</p>
                    <p className="text-sm text-gray-800 pl-4 border-l-2 border-gray-300">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
        {filteredResponses.length === 0 && (
          <p className="text-center text-gray-500 py-8">No responses found matching your criteria.</p>
        )}
      </div>
    </div>
  );
}