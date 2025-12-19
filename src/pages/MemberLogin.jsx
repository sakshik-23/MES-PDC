import React, { useState } from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, COLLECTIONS } from '../config/firebase.js';
import { Card } from '../components/Card.jsx';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { Captcha } from '../components/Captcha.jsx';

export default function MemberLogin({ setView, setCurrentUser }) {
  const [step, setStep] = useState(1);
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!captchaVerified) return alert("Verify Captcha First");
    if (!contact) return alert("Enter Mobile or Email");
    setLoading(true);

    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const qSnapshot = await getDocs(usersRef);
      const user = qSnapshot.docs.find(d => d.data().mobile === contact || d.data().email === contact);

      if (user) {
        const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
        await addDoc(collection(db, COLLECTIONS.OTPS), {
          contact,
          otp: generatedOtp,
          createdAt: new Date().toISOString()
        });
        
        alert(`MOCK SMS: Your OTP is ${generatedOtp}`);
        setStep(2);
      } else {
        alert("User not found in Database. (Try '9876543201')");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending OTP");
    }
    setLoading(false);
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.OTPS), where("contact", "==", contact), where("otp", "==", otp));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const usersRef = collection(db, COLLECTIONS.USERS);
        const uSnap = await getDocs(usersRef);
        const userDoc = uSnap.docs.find(d => d.data().mobile === contact || d.data().email === contact);
        
        if (userDoc) {
           setCurrentUser({ id: userDoc.id, ...userDoc.data() });
           snapshot.docs.forEach(d => deleteDoc(doc(db, COLLECTIONS.OTPS, d.id)));
           setView('DASHBOARD');
        }
      } else {
        alert("Invalid or Expired OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Verification Failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6"><Users className="w-12 h-12 text-teal-800 mx-auto mb-2" /><h2 className="text-2xl font-bold text-gray-800">Member Login</h2></div>
        {step === 1 ? (
          <>
            <Input label="Registered Mobile or Email" placeholder="e.g. 9876543201" value={contact} onChange={e => setContact(e.target.value)} />
            <Captcha onVerify={setCaptchaVerified} />
            <Button onClick={sendOtp} disabled={!captchaVerified || loading} className="w-full bg-teal-700 hover:bg-teal-800">
              {loading ? <RefreshCw className="animate-spin" /> : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-center text-gray-600 mb-4">OTP sent to {contact}</p>
            <Input label="Enter OTP" placeholder="XXXX" value={otp} onChange={e => setOtp(e.target.value)} />
            <Button onClick={verifyOtp} disabled={loading} className="w-full bg-teal-700 hover:bg-teal-800">
              {loading ? <RefreshCw className="animate-spin" /> : 'Verify & Login'}
            </Button>
          </>
        )}
        <button onClick={() => setView('LANDING')} className="w-full text-center text-gray-500 text-sm mt-4">Back to Home</button>
      </Card>
    </div>
  );
}