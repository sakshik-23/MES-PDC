import React, { useState } from 'react';
import { Shield, RefreshCw, Smartphone, UserCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase'; // Ensure this path is correct
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Captcha } from '../components/Captcha';

export default function AdminLogin({ setView, setCurrentUser }) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [isSmsMode, setIsSmsMode] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Requirement: Authentication logic for Super Admin
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!captchaVerified) return alert("Please verify captcha");
    setLoading(true);

    try {
      // Querying the "users" collection for matching username and role
      const q = query(
        collection(db, COLLECTIONS.USERS), 
        where("username", "==", creds.username), 
        where("role", "==", "SUPER_ADMIN")
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        if (userDoc.password === creds.password) {
          // Success: Set user and change view to dashboard
          setCurrentUser({ id: snapshot.docs[0].id, ...userDoc });
          setView('DASHBOARD');
        } else {
          alert("Invalid Password");
        }
      } else {
        alert("Super Admin not found. Please check username and role in Firestore.");
      }
    } catch (err) {
      console.error("Firebase Error:", err);
      alert("Login Error: " + err.message);
    }
    setLoading(false);
  };

  // Requirement: Get Username/Password via SMS
  const handleSmsRetrieval = async () => {
    if (!captchaVerified) return alert("Please verify captcha first");
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("mobile", "==", phoneNumber));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const user = snap.docs[0].data();
        alert(`MOCK SMS SENT: Your credentials are - User: ${user.username}, Pass: ${user.password}`);
        setIsSmsMode(false);
      } else {
        alert("Phone number not found in database.");
      }
    } catch (err) { alert("Error connecting to Firestore."); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Design: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md p-8 shadow-2xl border-t-4 border-blue-900">
          <div className="text-center mb-6">
            <Shield className="w-12 h-12 text-blue-900 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">MES PDC Admin</h2>
          </div>

          {!isSmsMode ? (
            <form onSubmit={handleLogin}>
              <Input label="Username" value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} />
              <Input label="Password" type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} />
              <Captcha onVerify={setCaptchaVerified} />
              
              <Button type="submit" className="w-full mb-4" disabled={!captchaVerified || loading}>
                {loading ? <RefreshCw className="animate-spin" /> : 'Login Securely'}
              </Button>
              
              <div className="flex flex-col gap-3 mt-4 border-t pt-4">
                <button type="button" onClick={() => setIsSmsMode(true)} className="text-blue-700 text-sm hover:underline flex items-center gap-2">
                  <Smartphone size={16}/> Forgot Credentials? Get via SMS
                </button>
                <button type="button" onClick={() => setView('MEMBER_LOGIN')} className="text-teal-700 font-bold text-sm hover:underline flex items-center gap-2">
                  <UserCircle size={16}/> Switch to Member Login
                </button>
              </div>
            </form>
          ) : (
            <div>
              <Input label="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} />
              <Captcha onVerify={setCaptchaVerified} />
              <Button onClick={handleSmsRetrieval} disabled={!captchaVerified || loading} className="w-full">
                {loading ? <RefreshCw className="animate-spin" /> : 'Send Credentials'}
              </Button>
              <button onClick={() => setIsSmsMode(false)} className="w-full text-center mt-4 text-gray-500 text-sm">Back to Login</button>
            </div>
          )}
        </Card>
      </div>

      {/* Right Design: Image Area */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80')] bg-cover"></div>
        <div className="relative z-10 text-center p-12">
          <h1 className="text-5xl font-extrabold mb-4">MES PDC</h1>
          <p className="text-xl font-light tracking-widest uppercase">Personality Development Center</p>
        </div>
      </div>
    </div>
  );
}