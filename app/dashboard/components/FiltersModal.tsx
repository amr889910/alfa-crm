import { X } from 'lucide-react';

export default function FiltersModal({ reportDate, setReportDate, reportEmployee, setReportEmployee, employees, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="crm-card w-full max-w-lg p-12">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-3xl font-black text-white">فلاتر التقارير</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-4">📅 التاريخ</label>
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className="input-field w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-4">👨‍💼 الموظف</label>
            <select value={reportEmployee} onChange={(e) => setReportEmployee(e.target.value)} className="input-field w-full">
              <option value="">كل الموظفين</option>
              {employees.map((emp: string) => (<option key={emp} value={emp}>{emp}</option>))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}