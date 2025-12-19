import React, { useState } from 'react';
import { Shield, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Captcha } from '../components/Captcha';

export default function AdminLogin({ setView, setCurrentUser }) {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaVerified) return alert("Please verify captcha");
    setLoading(true);

    try {
      const q = query(collection(db, COLLECTIONS.USERS), where("username", "==", creds.username), where("role", "==", "SUPER_ADMIN"));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const userDoc = snapshot.docs[0].data();
        if (userDoc.password === creds.password) {
          setCurrentUser({ id: snapshot.docs[0].id, ...userDoc });
          setView('DASHBOARD');
        } else {
          alert("Invalid Password");
        }
      } else {
        alert("Admin not found. (Try 'admin' / 'password123')");
      }
    } catch (err) {
      console.error(err);
      alert("Login Error. Check console.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6"><Shield className="w-12 h-12 text-blue-900 mx-auto mb-2" /><h2 className="text-2xl font-bold text-gray-800">Admin Login</h2></div>
        <form onSubmit={handleLogin}>
          <Input label="Username" value={creds.username} onChange={e => setCreds({...creds, username: e.target.value})} />
          <Input label="Password" type="password" value={creds.password} onChange={e => setCreds({...creds, password: e.target.value})} />
          <Captcha onVerify={setCaptchaVerified} />
          <Button type="submit" disabled={!captchaVerified || loading} className="w-full mb-4">
            {loading ? <RefreshCw className="animate-spin" /> : 'Login Securely'}
          </Button>
        </form>
        <button onClick={() => setView('LANDING')} className="w-full text-center text-gray-500 text-sm">Back to Home</button>
      </Card>
    </div>
  );
}