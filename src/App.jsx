import React, { useState, useEffect } from 'react';
import { LogOut, LayoutDashboard, ClipboardList, RefreshCw, Calendar, Database, Users } from 'lucide-react';
import { collection, query, onSnapshot, getDocs, addDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { auth, db, COLLECTIONS } from './config/firebase.js';

import LoginLanding from './pages/LoginLanding.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import MemberLogin from './pages/MemberLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MemberDashboard from './pages/MemberDashboard.jsx';
import AdminQuestionnaires from './pages/AdminQuestionnaires.jsx';
import MemberQuestionnaires from './pages/MemberQuestionnaires.jsx';
import EventsPage from './pages/EventsPage.jsx';
import QuestionnaireResponses from './pages/QuestionnaireResponses.jsx';
import MemberManagement from './pages/MemberManagement.jsx';

export default function App() {
  const [view, setView] = useState('LANDING'); 
  const [subView, setSubView] = useState('DASHBOARD');
  
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) await signInWithCustomToken(auth, __initial_auth_token);
      else await signInAnonymously(auth);
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
      if (user) seedDatabaseIfEmpty();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    const unsubReports = onSnapshot(query(collection(db, COLLECTIONS.REPORTS)), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setReports(data);
    });
    const unsubMembers = onSnapshot(query(collection(db, COLLECTIONS.USERS)), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(data.filter(u => u.role === 'MEMBER'));
    });
    return () => { unsubReports(); unsubMembers(); };
  }, [firebaseUser]);

  const seedDatabaseIfEmpty = async () => {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (snap.empty) {
      await addDoc(collection(db, COLLECTIONS.USERS), { name: 'Principal', username: 'admin', password: 'password123', mobile: '9999999999', email: 'admin@mes.ac.in', role: 'SUPER_ADMIN' });
    }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center"><RefreshCw className="animate-spin w-8 h-8 text-blue-900" /></div>;

  if (view === 'LANDING') return <LoginLanding setView={setView} />;
  if (view === 'ADMIN_LOGIN') return <AdminLogin setView={setView} setCurrentUser={setCurrentUser} />;
  if (view === 'MEMBER_LOGIN') return <MemberLogin setView={setView} setCurrentUser={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      <div className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold">MES PDC</h2>
          <p className="text-xs text-slate-400 mt-1">{currentUser?.role === 'SUPER_ADMIN' ? 'Admin Panel' : 'Member Panel'}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setSubView('DASHBOARD')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${subView === 'DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <button onClick={() => setSubView('MEMBERS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${subView === 'MEMBERS' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              <Users size={20} /> Manage Members
            </button>
          )}
          
          <button onClick={() => setSubView('EVENTS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${subView === 'EVENTS' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Calendar size={20} /> Events & Notices
          </button>

          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Questionnaires</div>
          
          <button onClick={() => setSubView('QUESTIONNAIRES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${subView === 'QUESTIONNAIRES' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <ClipboardList size={20} /> {currentUser?.role === 'SUPER_ADMIN' ? 'Manage Forms' : 'Take Survey'}
          </button>

          <button onClick={() => setSubView('RESPONSES')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${subView === 'RESPONSES' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Database size={20} /> View Data
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
           <div className="mb-4 px-2 text-sm text-slate-400">User: {currentUser?.name}</div>
           <button onClick={() => { setCurrentUser(null); setView('LANDING'); }} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg">
             <LogOut size={20} /> Logout
           </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {subView === 'DASHBOARD' && (
           currentUser?.role === 'SUPER_ADMIN' ? <AdminDashboard members={members} reports={reports} /> : <MemberDashboard currentUser={currentUser} reports={reports} />
        )}
        {subView === 'MEMBERS' && <MemberManagement />}
        {subView === 'EVENTS' && <EventsPage currentUser={currentUser} />}
        {subView === 'QUESTIONNAIRES' && (
           currentUser?.role === 'SUPER_ADMIN' ? <AdminQuestionnaires /> : <MemberQuestionnaires currentUser={currentUser} />
        )}
        {subView === 'RESPONSES' && <QuestionnaireResponses currentUser={currentUser} />}
      </div>
    </div>
  );
}