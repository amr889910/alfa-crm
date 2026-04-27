import { Plus, Phone, UserPlus, Loader2 } from 'lucide-react';

export default function Forms({ newCustomer, setNewCustomer, addCustomer, saving, customers, selectedCustomer, setSelectedCustomer, callResult, setCallResult, callNotes, setCallNotes, saveCall }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="crm-card p-10 h-full group">
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
          <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-slate-200/10 backdrop-blur-xl rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all"><UserPlus className="w-12 h-12 text-white" /></div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">عميل جديد</h3>
        </div>
        <div className="space-y-4">
          <input placeholder="اسم العميل *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="رقم الهاتف" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="input-field" />
            <input placeholder="الرصيد المتوقع" type="number" value={newCustomer.balance || ''} onChange={(e) => setNewCustomer({...newCustomer, balance: Number(e.target.value) || 0})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="العنوان" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} className="input-field" />
            <input placeholder="المنطقة" value={newCustomer.area} onChange={(e) => setNewCustomer({...newCustomer, area: e.target.value})} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">📅 تاريخ المتابعة</label>
              <input type="date" value={newCustomer.follow_up_date} onChange={(e) => setNewCustomer({...newCustomer, follow_up_date: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">📝 ملاحظة</label>
              <input placeholder="ملاحظة..." value={newCustomer.follow_up_note} onChange={(e) => setNewCustomer({...newCustomer, follow_up_note: e.target.value})} className="input-field" />
            </div>
          </div>
          <button onClick={addCustomer} disabled={saving} className="crm-btn-primary w-full disabled:opacity-60 flex items-center justify-center">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 ml-2" />}
            {saving ? 'جاري الإضافة...' : 'إضافة عميل'}
          </button>
        </div>
      </div>

      <div className="crm-card p-10 h-full group">
        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-white/10">
          <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-slate-200/10 backdrop-blur-xl rounded-3xl flex items-center justify-center group-hover:scale-110 transition-all"><Phone className="w-12 h-12 text-white" /></div>
          <h3 className="text-3xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">مكالمة جديدة</h3>
        </div>
        <div className="space-y-4">
          <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="input-field">
            <option value="">اختر عميل...</option>
            {customers.map((c: any) => (<option key={c.id} value={c.id}>{c.name} - {c.phone}</option>))}
          </select>
          <input placeholder="نتيجة المكالمة *" value={callResult} onChange={(e) => setCallResult(e.target.value)} className="input-field" />
          <textarea placeholder="ملاحظات..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)} rows={4} className="input-field resize-vertical" />
          <button onClick={saveCall} disabled={saving} className="crm-btn-primary w-full disabled:opacity-60 flex items-center justify-center">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5 ml-2" />}
            {saving ? 'جاري التسجيل...' : 'تسجيل المكالمة'}
          </button>
        </div>
      </div>
    </div>
  );
}