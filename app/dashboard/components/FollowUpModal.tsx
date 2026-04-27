import { useState } from 'react';
import { X } from 'lucide-react';

export default function FollowUpModal({ customer, onClose, onSave }: any) {
  const [date, setDate] = useState(customer.follow_up_date || '');
  const [note, setNote] = useState(customer.follow_up_note || '');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="crm-card w-full max-w-md p-10">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white">تحديث متابعة: {customer.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">📅 تاريخ المتابعة</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-2 font-medium">📝 ملاحظة المتابعة</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="input-field resize-vertical" placeholder="أكتب ملاحظة المتابعة هنا..." />
          </div>
          <div className="flex gap-4 pt-2">
            <button onClick={() => onSave(customer.id, date, note)} className="flex-1 crm-btn-primary flex items-center justify-center">حفظ التغييرات</button>
            <button onClick={onClose} className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}