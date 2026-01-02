import React, { useState, useEffect } from 'react';
import { FileText, Search, X, Calendar, User, Eye, Trash2 } from 'lucide-react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';

export default function QuestionnaireResponses({ currentUser }) {
  const [responses, setResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResponse, setSelectedResponse] = useState(null);
  
  const isAdmin = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLLECTIONS.RESPONSES), (snap) => {
      let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      if (!isAdmin) {
        data = data.filter(r => r.submittedBy === currentUser.id);
      }
      
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setResponses(data);
    });
    return () => unsub();
  }, [currentUser, isAdmin]);

  // --- DELETE HANDLER ---
  const handleDeleteResponse = async (id, e) => {
    e.stopPropagation(); // Prevent opening details if clicking delete
    if (window.confirm("Are you sure you want to permanently delete this report? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.RESPONSES, id));
      } catch (error) {
        console.error("Error deleting report:", error);
        alert("Failed to delete the report.");
      }
    }
  };

  const filteredResponses = responses.filter(r => 
    r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.questionnaireTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* HEADER & SEARCH */}
      <div className="bg-white border-b px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {isAdmin ? 'All Student Responses' : 'My Submitted Responses'}
        </h2>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search by student or questionnaire..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* RESPONSES LIST */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid gap-4 max-w-5xl mx-auto">
          {filteredResponses.map(res => (
            <div key={res.id} className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{res.questionnaireTitle}</h3>
                  <div className="flex gap-4 mt-1">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <User size={14} /> {res.studentName}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar size={14} /> {res.date}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin && (
                  <>
                    <div className="text-right hidden md:block mr-4">
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Submitted By</p>
                      <p className="text-sm font-semibold text-blue-600">{res.memberName}</p>
                    </div>
                    {/* DELETE BUTTON */}
                    <button 
                      onClick={(e) => handleDeleteResponse(res.id, e)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                      title="Delete Report"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
                
                <Button 
                  onClick={() => setSelectedResponse(res)}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-none px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Eye size={16} /> View Details
                </Button>
              </div>
            </div>
          ))}

          {filteredResponses.length === 0 && (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No reports found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL (Remains same as before) */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedResponse.questionnaireTitle}</h2>
                <p className="text-sm text-gray-500">Submitted on {selectedResponse.date}</p>
              </div>
              <button onClick={() => setSelectedResponse(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8 bg-blue-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Student Name</p>
                  <p className="font-bold text-gray-800">{selectedResponse.studentName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">Submitted By</p>
                  <p className="font-bold text-gray-800">{selectedResponse.memberName}</p>
                </div>
              </div>

              <h4 className="font-black text-xs text-gray-400 uppercase tracking-[0.2em] mb-4">Detailed Answers</h4>
              <div className="space-y-6">
                {Object.entries(selectedResponse.answers || {}).map(([question, answer], idx) => (
                  <div key={idx} className="border-l-4 border-blue-100 pl-4 py-1">
                    <p className="text-sm text-gray-500 font-semibold mb-2">{idx + 1}. {question}</p>
                    <p className="text-gray-800 font-medium bg-gray-50 p-3 rounded-lg">{answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              {isAdmin && (
                <Button 
                  onClick={(e) => { 
                    handleDeleteResponse(selectedResponse.id, e);
                    setSelectedResponse(null);
                  }} 
                  className="bg-white text-red-600 border border-red-200 hover:bg-red-50 px-6"
                >
                  Delete This Report
                </Button>
              )}
              <Button onClick={() => setSelectedResponse(null)} className="bg-blue-600 text-white px-8">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}