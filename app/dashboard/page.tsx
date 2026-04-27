'use client';
import * as XLSX from 'xlsx';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, Filter, Download, RefreshCw, Plus, Phone, Users, DollarSign, TrendingUp, Calendar, 
  Loader2, UserPlus, PhoneCall, BarChart3, Activity, Trash2, Edit3, Award, X
} from 'lucide-react';

type Customer = {
  id: number;
  name: string;
  phone: string;
  balance: number;
  address?: string;
  area?: string;
  status?: string;
  created_at?: string;
  follow_up_date?: string;
  follow_up_note?: string;
};

type Call = {
  id: number;
  customer_id: number;
  customers?: Customer;
  employee_name: string;
  result: string;
  notes: string;
  created_at: string;
};

const customerStatuses = ['جديد', 'مهتم', 'متابعة', 'هيطلب', 'غير مهتم'] as const;
type StatusType = typeof customerStatuses[number];

const statusConfig: Record<string, { color: string; text: string; bg: string }> = {
  'جديد': { color: 'from-blue-500 to-blue-600', text: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30' },
  'مهتم': { color: 'from-emerald-500 to-emerald-600', text: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30' },
  'متابعة': { color: 'from-orange-500 to-orange-600', text: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30' },
  'هيطلب': { color: 'from-green-500 to-green-600', text: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30' },
  'غير مهتم': { color: 'from-rose-500 to-rose-600', text: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/30' }
};

export default function CRMSystem() {
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', phone: '', address: '', area: '', balance: 0,
    follow_up_date: '', follow_up_note: ''
  });
  
  // States for loading and UI
  const [saving, setSaving] = useState(false);
  const [followUpModal, setFollowUpModal] = useState<{ open: boolean; customer: Customer | null }>({ open: false, customer: null });
  const [page, setPage] = useState(1);
  const perPage = 15;

  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [callResult, setCallResult] = useState('');
  const [callNotes, setCallNotes] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [reportEmployee, setReportEmployee] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCustomers(), fetchCalls(), fetchProfile()]);
    setLoading(false);
  }, []);

  const fetchCustomers = useCallback(async () => {
    const { data, error } = await supabase.from('customers').select('*').order('id', { ascending: false });
    if (!error && data) setCustomers(data as Customer[]);
  }, []);

  const fetchCalls = useCallback(async () => {
    const { data, error } = await supabase.from('calls').select('*, customers(*)').order('created_at', { ascending: false });
    if (!error && data) setCalls(data as Call[]);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userId) {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
      setProfile(data);
    }
  }, []);

  const addCustomer = async () => {
    if (!newCustomer.name.trim()) return toast('اكتب اسم العميل', 'error');
    setSaving(true);
    const { error } = await supabase.from('customers').insert([{ 
      ...newCustomer, 
      balance: Number(newCustomer.balance) || 0,
      follow_up_date: newCustomer.follow_up_date || null,
      follow_up_note: newCustomer.follow_up_note || null
    }]);
    if (error) {
      toast('حصل خطأ: ' + error.message, 'error');
    } else {
      toast('تم إضافة العميل بنجاح ✅', 'success');
      setNewCustomer({ name: '', phone: '', address: '', area: '', balance: 0, follow_up_date: '', follow_up_note: '' });
      fetchCustomers();
    }
    setSaving(false);
  };

  const saveCall = async () => {
    if (!selectedCustomer || !callResult.trim()) return toast('املأ جميع الحقول المطلوبة', 'error');
    setSaving(true);
    const { error } = await supabase.from('calls').insert([{
      customer_id: Number(selectedCustomer),
      employee_name: profile?.full_name || 'غير معروف',
      result: callResult.trim(),
      notes: callNotes.trim(),
    }]);
    if (error) {
      toast('حصل خطأ: ' + error.message, 'error');
    } else {
      toast('تم تسجيل المكالمة بنجاح ✅', 'success');
      setCallResult(''); setCallNotes(''); setSelectedCustomer('');
      fetchCalls();
    }
    setSaving(false);
  };

  const updateCustomerStatus = async (id: number, status: StatusType) => {
    const { error } = await supabase.from('customers').update({ status }).eq('id', id);
    if (!error) { fetchCustomers(); toast('تم تحديث الحالة', 'success'); }
  };

  const updateFollowUp = async (id: number, followUpDate: string, followUpNote: string) => {
    const { error } = await supabase.from('customers').update({ 
      follow_up_date: followUpDate || null, follow_up_note: followUpNote || null 
    }).eq('id', id);
    if (!error) {
      fetchCustomers();
      setFollowUpModal({ open: false, customer: null });
      toast('تم تحديث المتابعة بنجاح 📅', 'success');
    }
  };

  const deleteCustomer = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (!error) { fetchCustomers(); toast('تم حذف العميل', 'success'); }
  };

  const exportReportExcel = () => {
    const rows = filteredCalls.map((call, index) => ({
      '#': index + 1, 'الموظف': call.employee_name, 'العميل': call.customers?.name || '',
      'التليفون': call.customers?.phone || '', 'النتيجة': call.result, 'الملاحظات': call.notes,
      'التاريخ': new Date(call.created_at).toLocaleString('ar-EG'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'تقرير CRM');
    XLSX.writeFile(wb, `crm-report-${reportDate}.xlsx`);
    toast('تم تصدير التقرير بنجاح 📊', 'success');
  };

  // Memoized Values
  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm))
  , [customers, searchTerm]);

  const filteredCalls = useMemo(() => 
    calls.filter(call => {
      const callDate = new Date(call.created_at).toLocaleDateString('en-CA');
      return callDate === reportDate && 
             (!reportEmployee || call.employee_name === reportEmployee) &&
             (!searchTerm || call.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || call.result.toLowerCase().includes(searchTerm.toLowerCase()));
    }), [calls, reportDate, reportEmployee, searchTerm]);

  const uniqueEmployees = useMemo(() => 
    [...new Set(calls.map(c => c.employee_name).filter(Boolean))].sort()
  , [calls]);

  const upcomingFollowUps = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toLocaleDateString('en-CA');
    return customers.filter(c => c.follow_up_date && (c.follow_up_date === today || c.follow_up_date === tomorrowStr))
      .sort((a, b) => new Date(a.follow_up_date!).getTime() - new Date(b.follow_up_date!).getTime());
  }, [customers]);

  const stats = useMemo(() => ({
    totalCustomers: customers.length,
    totalBalance: customers.reduce((sum, c) => sum + (c.balance || 0), 0),
    totalCalls: calls.length,
    todayCalls: filteredCalls.length,
    upcomingFollowUps: upcomingFollowUps.length,
  }), [customers, calls, filteredCalls, upcomingFollowUps]);

  const employeeReport = useMemo(() => {
    return filteredCalls.reduce((acc: any, call) => {
      const emp = call.employee_name || 'غير معروف';
      if (!acc[emp]) acc[emp] = { total: 0, positive: 0, negative: 0, noAnswer: 0 };
      acc[emp].total++;
      const result = call.result.toLowerCase();
      if (result.includes('ايجابي') || result.includes('مهتم') || result.includes('هيطلب')) acc[emp].positive++;
      else if (result.includes('سلبي') || result.includes('غير مهتم')) acc[emp].negative++;
      else if (result.includes('لم يرد')) acc[emp].noAnswer++;
      return acc;
    }, {});
  }, [filteredCalls]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCustomers.length / perPage);
  const paginatedCustomers = useMemo(() => 
    filteredCustomers.slice((page - 1) * perPage, page * perPage)
  , [filteredCustomers, page]);

  useEffect(() => { if(page > totalPages && totalPages > 0) setPage(1); }, [totalPages, page]);

  const toast = (message: string, type: 'success' | 'error' = 'success') => {
    const toastEl = document.createElement('div');
    toastEl.className = `crm-toast fixed top-20 right-6 z-[9999] p-6 lg:p-8 rounded-3xl shadow-2xl backdrop-blur-xl border transform translate-x-full transition-all duration-500 text-sm lg:text-base font-bold max-w-sm ${
      type === 'success' ? 'bg-gradient-to-r from-emerald-500/95 to-green-500/95 text-white border-emerald-400/50 shadow-emerald-500/40' 
      : 'bg-gradient-to-r from-rose-500/95 to-red-500/95 text-white border-rose-400/50 shadow-rose-500/40'
    }`;
    toastEl.textContent = message;
    document.body.appendChild(toastEl);
    requestAnimationFrame(() => toastEl.classList.remove('translate-x-full'));
    setTimeout(() => {
      toastEl.classList.add('translate-x-full');
      setTimeout(() => document.body.removeChild(toastEl), 500);
    }, 4000);
  };

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  return (
        <div className="w-full h-full bg-crm-gradient text-white overflow-x-auto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

            <div className="relative z-10 mx-auto px-2 sm:px-4 lg:px-6 py-4 lg:py-6 w-full">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-white/20 to-slate-200/20 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/10 mb-8 shadow-2xl">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
                            <h1 className="text-2xl lg:text-4xl font-black bg-gradient-to-r from-white via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight">نظام إدارة علاقات العملاء</h1>
              <p className="text-xl lg:text-2xl text-slate-300 mt-2 font-medium">CRM متكامل لتتبع العملاء والمكالمات والمتابعات</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="crm-search-bar mb-12">
          <div className="relative">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
            <input placeholder="🔍 ابحث في العملاء، المكالمات، أو الملاحظات..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} className="input-field w-full pl-20 pr-6 lg:pr-20" />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
              <button onClick={fetchAllData} className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 transition-all" title="تحديث البيانات">
                <RefreshCw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className="p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-2xl border border-slate-700/50 transition-all group hover:scale-105">
                <Filter className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
          <CRMStatCard title="إجمالي العملاء" value={stats.totalCustomers.toLocaleString()} icon={Users} gradient="from-indigo-500 to-blue-600" />
          <CRMStatCard title="إجمالي الرصيد" value={`${stats.totalBalance.toLocaleString('ar-EG')} ج.م`} icon={DollarSign} gradient="from-emerald-500 to-teal-600" />
          <CRMStatCard title="إجمالي المكالمات" value={stats.totalCalls.toLocaleString()} icon={PhoneCall} gradient="from-purple-500 to-violet-600" />
          <CRMStatCard title="مكالمات اليوم" value={stats.todayCalls.toLocaleString()} icon={Activity} gradient="from-orange-500 to-red-600" />
          <CRMStatCard title="المتابعات القادمة" value={stats.upcomingFollowUps.toLocaleString()} icon={Calendar} gradient="from-amber-500 to-yellow-600" />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Add Customer */}
              <CRMActionCard title="👥 عميل جديد" icon={UserPlus}>
                <div className="space-y-4">
                  <input placeholder="اسم العميل *" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} className="input-field" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="رقم الهاتف" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} className="input-field" />
                    <input placeholder="الرصيد المتوقع" type="number" value={newCustomer.balance || ''} onChange={(e) => setNewCustomer({...newCustomer, balance: Number(e.target.value) || 0})} className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input placeholder="العنوان" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} className="input-field" />
                    <input placeholder="المنطقة" value={newCustomer.area} onChange={(e) => setNewCustomer({...newCustomer, area: e.target.value})} className="input-field" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">📅 تاريخ المتابعة</label>
                      <input type="date" value={newCustomer.follow_up_date} onChange={(e) => setNewCustomer({...newCustomer, follow_up_date: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">📝 ملاحظة المتابعة</label>
                      <input placeholder="ملاحظة..." value={newCustomer.follow_up_note} onChange={(e) => setNewCustomer({...newCustomer, follow_up_note: e.target.value})} className="input-field" />
                    </div>
                  </div>
                  <button onClick={addCustomer} disabled={saving} className="crm-btn-primary w-full disabled:opacity-60 flex items-center justify-center">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5 ml-2" />}
                    {saving ? 'جاري الإضافة...' : 'إضافة عميل جديد'}
                  </button>
                </div>
              </CRMActionCard>

              {/* Add Call */}
              <CRMActionCard title="📞 مكالمة جديدة" icon={PhoneCall}>
                <div className="space-y-4">
                  <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="input-field">
                    <option value="">اختر عميل...</option>
                    {customers.map((c: Customer) => (<option key={c.id} value={c.id}>{c.name} - {c.phone}</option>))}
                  </select>
                  <input placeholder="نتيجة المكالمة *" value={callResult} onChange={(e) => setCallResult(e.target.value)} className="input-field" />
                  <textarea placeholder="ملاحظات..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)} rows={4} className="input-field resize-vertical" />
                  <button onClick={saveCall} disabled={saving} className="crm-btn-primary w-full disabled:opacity-60 flex items-center justify-center">
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5 ml-2" />}
                    {saving ? 'جاري التسجيل...' : 'تسجيل المكالمة'}
                  </button>
                </div>
              </CRMActionCard>
            </div>
            <CRMPipeline customers={filteredCustomers} onStatusChange={updateCustomerStatus} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <CRMCard title="📅 المتابعات القادمة">
              <UpcomingFollowUps customers={upcomingFollowUps} />
            </CRMCard>
            <CRMCard title="📊 أداء الفريق">
              <CRMEmployeeReport report={employeeReport} />
              <button onClick={exportReportExcel} className="crm-btn-export mt-6 w-full flex items-center justify-center">
                <Download className="w-5 h-5 ml-2" />
                تصدير تقرير Excel
              </button>
            </CRMCard>
            <CRMCard title="🔥 آخر النشاطات">
              <CRMRecentActivity calls={filteredCalls.slice(0, 6)} />
            </CRMCard>
          </div>
        </div>

        {/* Table */}
        <CRMCard title={`👥 قائمة العملاء (${filteredCustomers.length})`}>
          <CRMTable 
            customers={paginatedCustomers} 
            onDelete={deleteCustomer} 
            onOpenFollowUp={(cust) => setFollowUpModal({ open: true, customer: cust })}
            loading={loading} 
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </CRMCard>

        {/* Filters Modal */}
        {showFilters && (
          <CRMFilters 
            reportDate={reportDate} setReportDate={setReportDate}
            reportEmployee={reportEmployee} setReportEmployee={setReportEmployee}
            employees={uniqueEmployees}
            onClose={() => setShowFilters(false)} 
          />
        )}

        {/* Follow Up Modal */}
        {followUpModal.open && followUpModal.customer && (
          <FollowUpModal 
            customer={followUpModal.customer} 
            onClose={() => setFollowUpModal({ open: false, customer: null })} 
            onSave={updateFollowUp} 
          />
        )}
