import { Loader2 } from 'lucide-react';
import { statusConfig } from '../page';

export default function CustomerTable({ customers, onDelete, onOpenFollowUp, loading, page, setPage, totalPages }: any) {
  return (
    <div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>
        ) : customers.length === 0 ? (
          <p className="text-slate-400 text-center py-20 text-xl">لا يوجد عملاء</p>
        ) : (
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr>
                <th className="table-header w-12">#</th>
                <th className="table-header">الاسم</th>
                <th className="table-header w-32">التليفون</th>
                <th className="table-header w-28">الرصيد</th>
                <th className="table-header w-32">المنطقة</th>
                <th className="table-header w-36">الحالة</th>
                <th className="table-header w-36">تاريخ المتابعة</th>
                <th className="table-header">ملاحظة المتابعة</th>
                <th className="table-header w-40">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any, i: number) => {
                const status = c.status || 'جديد';
                const config = statusConfig[status] || statusConfig['جديد'];
                return (
                  <tr key={c.id} className="group">
                    <td className="table-cell text-slate-500 font-bold">{i + 1 + (page - 1) * 15}</td>
                    <td className="table-cell font-bold text-white">{c.name}</td>
                    <td className="table-cell text-slate-300 font-mono">{c.phone || '-'}</td>
                    <td className="table-cell text-emerald-400 font-bold">{(c.balance || 0).toLocaleString()} ج.م</td>
                    <td className="table-cell text-slate-400">{c.area || '-'}</td>
                    <td className="table-cell"><span className={`status-badge ${config.bg} ${config.text}`}>{status}</span></td>
                    <td className="table-cell">{c.follow_up_date ? <span className="bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold">{c.follow_up_date}</span> : <span className="text-slate-600">-</span>}</td>
                    <td className="table-cell max-w-[200px]">{c.follow_up_note ? <span className="text-sm text-slate-300 truncate block" title={c.follow_up_note}>{c.follow_up_note}</span> : <span className="text-slate-600">-</span>}</td>
                    <td className="table-cell">
                      <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onOpenFollowUp(c)} className="bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-sm font-bold transition-all">📅 تعديل</button>
                        <button onClick={() => onDelete(c.id)} className="bg-red-600/20 hover:bg-red-600/40 text-red-300 px-4 py-2 rounded-xl text-sm font-bold transition-all">🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-10 pt-8 border-t border-white/10">
          <button disabled={page === 1} onClick={() => setPage((p: number) => p - 1)} className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl transition font-bold">السابق</button>
          <div className="flex gap-2">{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (<button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl font-bold transition ${page === p ? 'bg-indigo-500' : 'bg-white/10 hover:bg-white/20'}`}>{p}</button>))}</div>
          <button disabled={page === totalPages} onClick={() => setPage((p: number) => p + 1)} className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-xl transition font-bold">التالي</button>
        </div>
      )}
    </div>
  );
}