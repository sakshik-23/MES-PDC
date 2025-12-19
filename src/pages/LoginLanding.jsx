import React from 'react';
import { Shield, Users } from 'lucide-react';

export default function LoginLanding({ setView }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="text-white text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">MES - PDC</h1>
        <p className="text-xl opacity-90">Maharashtra Education Society</p>
        <p className="text-lg opacity-75">Personality Development Center</p>
      </div>
      
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center border-b pb-4">Select Login Type</h2>
        <button onClick={() => setView('ADMIN_LOGIN')} className="w-full p-4 flex items-center justify-between border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200"><Shield className="w-6 h-6 text-blue-900" /></div>
            <div className="text-left"><h3 className="font-bold text-gray-800">Super Admin</h3><p className="text-sm text-gray-500">Management & Oversight</p></div>
          </div>
        </button>
        <button onClick={() => setView('MEMBER_LOGIN')} className="w-full p-4 flex items-center justify-between border-2 border-gray-200 rounded-lg hover:border-teal-600 hover:bg-teal-50 transition-all group">
          <div className="flex items-center gap-4">
            <div className="bg-teal-100 p-3 rounded-full group-hover:bg-teal-200"><Users className="w-6 h-6 text-teal-800" /></div>
            <div className="text-left"><h3 className="font-bold text-gray-800">Council Member</h3><p className="text-sm text-gray-500">Reporting & Activities</p></div>
          </div>
        </button>
      </div>
    </div>
  );
}