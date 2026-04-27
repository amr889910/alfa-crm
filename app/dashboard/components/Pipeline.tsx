import { customerStatuses, statusConfig } from '../page';

export default function Pipeline({ customers, onStatusChange }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
      {customerStatuses.map(status => {
        const config = statusConfig[status];
        const filtered = customers.filter((c: any) => (c.status || 'جديد') === status);
        return (
          <div key={status} className="crm-card p-8 border-2" style={{borderColor: config.bg.includes('blue') ? 'rgba(59,130,246,0.3)' : config.bg.includes('emerald') ? 'rgba(16,185,129,0.3)' : config.bg.includes('orange') ? 'rgba(249,115,22,0.3)' : config.bg.includes('green') ? 'rgba(34,197,94,0.3)' : 'rgba(244,63,94,0.3)'}}>
            <h4 className="font-black text-2xl mb-8 flex items-center justify-between bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
              {status}
              <span className="bg-white/20 px-6 py-3 rounded-2xl text-2xl font-black text-white">{filtered.length}</span>
            </h4>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {filtered.slice(0, 3).map((c: any) => (
                <div key={c.id} className="p-5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="font-bold text-lg mb-1 truncate">{c.name}</div>
                  <div className="text-sm text-slate-400 mb-4 flex justify-between">{c.phone} <span className="text-emerald-400 font-bold">{c.balance || 0} ج.م</span></div>
                  <select value={c.status || 'جديد'} onChange={(e) => onStatusChange(c.id, e.target.value)} className="input-field text-sm py-2 px-3">
                    {customerStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
              {filtered.length > 3 && <p className="text-center text-sm text-slate-400 pt-2">+{filtered.length - 3} آخرين</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}