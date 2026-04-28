'use client';
import * as XLSX from 'xlsx';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Filter, Download, RefreshCw, Phone, Users, DollarSign, PhoneCall, Activity, Calendar, Loader2, UserPlus, Award, X, Send, Clock } from 'lucide-react';

// --- Types ---
type Customer = {
  id: number; name: string; phone: string; balance: number;
  address?: string; area?: string; status?: string; assigned_to?: string;
  created_at?: string; follow_up_date?: string; follow_up_note?: string;
};
type Call = {
  id: number; customer_id: number; customers?: Customer;
  employee_name: string; result: string; notes: string; created_at: string;
};

const customerStatuses = ['جديد', 'مهتم', 'متابعة', 'هيطلب', 'غير مهتم'] as const;
type StatusType = typeof customerStatuses[number];
const statusConfig: Record<string, { text: string; bg: string }> = {
  'جديد': { text: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  'مهتم': { text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  'متابعة': { text: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  'هيطلب': { text: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  'غير مهتم': { text: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' }
};

export default function CRMSystem() {
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', area: '', balance: 0 });
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [callResult, setCallResult] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('الكل');
  const [showNewForm, setShowNewForm] = useState(false);

  // Fetch Data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user?.id) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
      setProfile(prof);
    }
    const { data: custs } = await supabase.from('customers').select('*').order('id', { ascending: false });
    if (custs) setCustomers(custs as Customer[]);
    const { data: cals } = await supabase.from('calls').select('*, customers(*)').order('created_at', { ascending: false });
    if (cals) setCalls(cals as Call[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Role-based Filtering (السر بتاع بيتركس)
  const myCustomers = useMemo(() => {
    let data = customers;
    // لو مش أدمن، اعرض اللي عليا بس
    if (profile?.role !== 'admin') {
      data = data.filter(c => c.assigned_to === profile?.id);
    }
    // فلتر البحث
    if (searchTerm) {
      data = data.filter(c => c.name.includes(searchTerm) || c.phone.includes(searchTerm));
    }
    // فلتر الحالة
    if (statusFilter !== 'الكل') {
      data = data.filter(c => (c.status || 'جديد') === statusFilter);
    }
    return data;
  }, [customers, profile, searchTerm, statusFilter]);

  const selectedCustomer = useMemo(() => myCustomers.find(c => c.id === selectedCustomerId), [myCustomers, selectedCustomerId]);
  const customerCalls = useMemo(() => calls.filter(c => c.customer_id === selectedCustomerId), [calls, selectedCustomerId]);

  const stats = useMemo(() => ({
    total: myCustomers.length,
    interested: myCustomers.filter(c => c.status === 'مهتم' || c.status === 'هيطلب').length,
    callsToday: calls.filter(c => new Date(c.created_at).toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA') && c.employee_name === profile?.full_name).length,
  }), [myCustomers, calls, profile]);

  // Actions
  const addCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setSaving(true);
    await supabase.from('customers').insert([{ ...newCustomer, balance: Number(newCustomer.balance) || 0, assigned_to: profile?.id }]);
    setNewCustomer({ name: '', phone: '', address: '', area: '', balance: 0 });
    setShowNewForm(false); fetchAllData(); setSaving(false);
  };

  const saveCall = async () => {
    if (!selectedCustomerId || !callResult.trim()) return;
    setSaving(true);
    await supabase.from('calls').insert([{ customer_id: selectedCustomerId, employee_name: profile?.full_name, result: callResult, notes: callNotes }]);
    setCallResult(''); setCallNotes(''); fetchAllData(); setSaving(false);
  };

  const updateStatus = async (id: number, status: StatusType) => {
    await supabase.from('customers').update({ status }).eq('id', id);
    fetchAllData();
  };

  const exportReportExcel = () => {
    const rows = myCustomers.map((c, i) => ({ '#': i+1, 'الاسم': c.name, 'التليفون': c.phone, 'الحالة': c.status || 'جديد', 'الرصيد': c.balance }));
    const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'عملائي'); XLSX.writeFile(wb, `my-leads.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Top Bar */}
      <div className="bg-[#1e293b] border-b border-slate-700/50 p-4 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-4 py-2 flex-1">
          <Search className="w-5 h-5 text-slate-400" />
          <input placeholder="بحث بالاسم أو رقم التليفون..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none w-full text-sm placeholder:text-slate-500" />
        </div>
        
        <div className="flex gap-2">
          {['الكل', ...customerStatuses].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
              {s}
            </button>
          ))}
        </div>

        <button onClick={() => setShowNewForm(true)} className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
          <UserPlus className="w-4 h-4" /> عميل جديد
        </button>
        <button onClick={fetchAllData} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
        <button onClick={exportReportExcel} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition" title="تصدير"><Download className="w-5 h-5" /></button>
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Lead List */}
        <div className="w-[380px] bg-[#1e293b]/50 border-l border-slate-700/50 flex flex-col shrink-0">
          {/* Mini Stats */}
          <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-700/50">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">إجمالي</p>
              <p className="text-xl font-black text-white">{stats.total}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">مهتم/هيطلب</p>
              <p className="text-xl font-black text-emerald-400">{stats.interested}</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <p className="text-xs text-slate-400">مكالماتي اليوم</p>
              <p className="text-xl font-black text-indigo-400">{stats.callsToday}</p>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-500" /></div> : 
            myCustomers.length === 0 ? <p className="text-center text-slate-500 p-10">لا يوجد عملاء</p> :
            myCustomers.map(c => {
              const config = statusConfig[c.status || 'جديد'] || statusConfig['جديد'];
              return (
                <div key={c.id} onClick={() => setSelectedCustomerId(c.id)} className={`p-4 border-b border-slate-700/30 cursor-pointer transition hover:bg-slate-800/50 ${selectedCustomerId === c.id ? 'bg-indigo-600/20 border-r-4 border-indigo-500' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white">{c.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 font-mono">{c.phone}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${config.bg} ${config.text}`}>{c.status || 'جديد'}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                    <span>{c.area || 'غير محدد'}</span>
                    {c.follow_up_date && <span className="text-amber-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {c.follow_up_date}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Details / Action Area */}
        <div className="flex-1 bg-[#0f172a] overflow-y-auto p-8">
          {showNewForm ? (
            <NewCustomerForm onSave={addCustomer} saving={saving} onCancel={() => setShowNewForm(false)} setNewCustomer={setNewCustomer} newCustomer={newCustomer} />
          ) : selectedCustomer ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-black text-white">{selectedCustomer.name}</h1>
                  <p className="text-slate-400 mt-1 font-mono text-lg">{selectedCustomer.phone} {selectedCustomer.area ? `• ${selectedCustomer.area}` : ''}</p>
                </div>
                <select value={selectedCustomer.status || 'جديد'} onChange={(e) => updateStatus(selectedCustomer.id, e.target.value as StatusType)} className={`text-sm font-bold px-4 py-2 rounded-lg border bg-transparent outline-none cursor-pointer ${statusConfig[selectedCustomer.status || 'جديد']?.bg} ${statusConfig[selectedCustomer.status || 'جديد']?.text}`}>
                  {customerStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Quick Call Log */}
              <div className="bg-[#1e293b] rounded-2xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><PhoneCall className="w-5 h-5 text-indigo-400" /> تسجيل مكالمة سريعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <select value={callResult} onChange={(e) => setCallResult(e.target.value)} className="input-field">
                    <option value="">اختر نتيجة المكالمة...</option>
                    <option value="رد و مهتم">رد و مهتم</option>
                    <option value="رد و هيطلب">رد و هيطلب</option>
                    <option value="رد و رافض">رد و رافض</option>
                    <option value="لم يرد">لم يرد</option>
                    <option value="مكالمة مستقبلية">مكالمة مستقبلية</option>
                  </select>
                  <input placeholder="ملاحظات المكالمة..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)} className="input-field" />
                </div>
                <button onClick={saveCall} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {saving ? 'جاري الحفظ...' : 'حفظ المكالمة'}
                </button>
              </div>

              {/* Call History */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4">سجل المكالمات السابقة</h3>
                <div className="space-y-3">
                  {customerCalls.length === 0 ? <p className="text-slate-500 text-sm">لا توجد مكالمات مسجلة لهذا العميل</p> :
                  customerCalls.map(call => (
                    <div key={call.id} className="bg-[#1e293b] rounded-xl p-4 border border-slate-700/30 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white">{call.result}</span>
                        <p className="text-sm text-slate-400 mt-1">{call.notes || 'بدون ملاحظات'}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-slate-300">{call.employee_name}</p>
                        <p className="text-xs text-slate-500">{new Date(call.created_at).toLocaleString('ar-EG')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <Users className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-bold">اختر عميل من القائمة لعرض تفاصيله</p>
              <p className="text-sm mt-2">أو اضغط على "عميل جديد" لإضافة عميل</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-components
const NewCustomerForm = ({ onSave, saving, onCancel, setNewCustomer, newCustomer }: any) => (
  <div className="max-w-2xl mx-auto bg-[#1e293b] rounded-2xl p-8 border border-slate-700/50">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-black text-white">إضافة عميل جديد</h2>
      <button onClick={onCancel} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
    </div>
    <div className="space-y-4">
      <input placeholder="اسم العميل *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="input-field" />
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="رقم الهاتف" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="input-field" />
        <input placeholder="الرصيد المتوقع" type="number" value={newCustomer.balance || ''} onChange={(e) => setNewCustomer({...newCustomer, balance: Number(e.target.value)})} className="input-field" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="العنوان" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} className="input-field" />
        <input placeholder="المنطقة" value={newCustomer.area} onChange={(e) => setNewCustomer({...newCustomer, area: e.target.value})} className="input-field" />
      </div>
      <button onClick={onSave} disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-700 py-4 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2">
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
        حفظ العميل
      </button>
    </div>
  </div>
);