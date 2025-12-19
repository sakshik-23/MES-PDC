import React, { useState } from 'react';
import { Download, User } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export default function AdminDashboard({ members, reports }) {
  const [selectedMember, setSelectedMember] = useState(null);

  const getStats = (memId) => {
    const memReports = reports.filter(r => r.createdBy === memId);
    return {
      total: memReports.length,
      counselling: memReports.filter(r => r.type === 'Counselling').length,
      session: memReports.filter(r => r.type === 'Session').length
    };
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      {selectedMember ? (
        <div>
          <button onClick={() => setSelectedMember(null)} className="mb-4 text-blue-600 hover:underline">&larr; Back to Members</button>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{selectedMember.name} <span className="text-gray-500 text-lg">Reports</span></h2>
            <Button variant="outline"><Download size={16} /> Export PDF</Button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-100 border-b"><tr><th className="p-4">Date</th><th className="p-4">Type</th><th className="p-4">Details</th></tr></thead>
                <tbody>
                  {reports.filter(r => r.createdBy === selectedMember.id).map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="p-4">{r.date}</td>
                      <td className="p-4"><Badge type={r.type}>{r.type}</Badge></td>
                      <td className="p-4">{r.type === 'Counselling' ? `${r.studentName} (${r.standard})` : `${r.schoolName}: ${r.topic}`}</td>
                    </tr>
                  ))}
                  {reports.filter(r => r.createdBy === selectedMember.id).length === 0 && <tr><td colSpan="3" className="p-4 text-center text-gray-500">No reports found</td></tr>}
                </tbody>
             </table>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">Council Members Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map(m => {
              const stats = getStats(m.id);
              return (
                <Card key={m.id} className="p-6">
                  <div className="flex justify-between mb-4"><div className="bg-blue-100 p-2 rounded-full"><User className="text-blue-700" /></div><span className="text-green-600 text-xs font-bold border border-green-200 px-2 py-1 rounded bg-green-50">Active</span></div>
                  <h3 className="font-bold">{m.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">{m.mobile}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    <div className="bg-gray-100 p-2 rounded text-center"><div className="text-xs text-gray-500">Counselling</div><div className="font-bold">{stats.counselling}</div></div>
                    <div className="bg-gray-100 p-2 rounded text-center"><div className="text-xs text-gray-500">Sessions</div><div className="font-bold">{stats.session}</div></div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => setSelectedMember(m)}>View Reports</Button>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
