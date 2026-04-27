import { Download } from 'lucide-react';

export default function Sidebar({ upcomingFollowUps, employeeReport, filteredCalls, exportReportExcel }: any) {
  return (
    <div className="space-y-8">
      <div className="crm-card p-10">
        <h3 className="text-2xl font-black text-white mb-8">📅 المتابعات القادمة</h3>
        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
          {upcomingFollowUps.length === 0 ? <p className="text-slate-400 text-center py-8">لا يوجد متابعات 🎉</p> : upcomingFollowUps.map((c: any) => (
            <div key={c.id} className="p-5 bg-amber-500/10 rounded-2xl border border-amber-500/30">
              <div className="font-bold text-lg text-white truncate">{c.name}</div>
              <div className="text-sm text-amber-300 mt-2 truncate">{c.follow_up_note || 'متابعة عادية'}</div>
              <div className="text-xs bg-white/10 px-3 py-1 rounded-full font-medium text-amber-100 w-fit mt-2">{c.follow_up_date}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="crm-card p-10">
        <h3 className="text-2xl font-black text-white mb-8">📊 أداء الفريق</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {Object.entries(employeeReport).length === 0 ? <p className="text-slate-400 text-center py-4">لا يوجد بيانات</p> : Object.entries(employeeReport).map(([emp, data]: any) => (
            <div key={emp} className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-bold text-lg mb-3">{emp}</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>📞 الإجمالي: <span className="text-white font-bold">{data.total}</span></div>
                <div>✅ إيجابي: <span className="text-emerald-400 font-bold">{data.positive}</span></div>
                <div>❌ سلبي: <span className="text-rose-400 font-bold">{data.negative}</span></div>
                <div>📵 لم يرد: <span className="text-slate-400 font-bold">{data.noAnswer}</span></div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={exportReportExcel} className="crm-btn-export mt-6 w-full flex items-center justify-center">
          <Download className="w-5 h-5 ml-2" /> تصدير تقرير Excel
        </button>
      </div>

      <div className="crm-card p-10">
        <h3 className="text-2xl font-black text-white mb-8">🔥 آخر النشاطات</h3>
        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
          {filteredCalls.length === 0 ? <p className="text-slate-400 text-center py-4">لا توجد مكالمات</p> : filteredCalls.slice(0, 5).map((call: any) => (
            <div key={call.id} className="p-5 bg-white/5 rounded-2xl border border-white/10">
              <div className="font-bold">{call.customers?.name || 'غير معروف'}</div>
              <div className="text-sm text-slate-400 mt-1">{call.result}</div>
              <div className="text-xs text-slate-500 mt-2">{new Date(call.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}