import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Captcha = ({ onVerify }) => {
  const [code, setCode] = useState(Math.random().toString(36).substring(7).toUpperCase());
  const [input, setInput] = useState('');

  const refresh = () => setCode(Math.random().toString(36).substring(7).toUpperCase());
  
  const check = () => {
    if (input === code) onVerify(true);
    else { 
      alert("Incorrect Captcha"); 
      refresh(); 
      setInput(''); 
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-xl font-bold text-gray-600 bg-gray-200 px-3 py-1 rounded select-none">
          {code}
        </span>
        <button type="button" onClick={refresh} className="text-blue-600 text-sm flex items-center gap-1 hover:underline">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          className="flex-1 border p-2 rounded" 
          placeholder="Enter code" 
        />
        <Button onClick={check} variant="secondary" className="py-1 px-3 text-sm">Verify</Button>
      </div>
    </div>
  );
};
