'use client';

import * as XLSX from "xlsx";
import React, { useState, useCallback, useEffect, useMemo } from 'react';

const styles = {
  th: { /* نفس الستايل */ },
  td: { /* نفس الستايل */ },
  box: { /* نفس الستايل */ }
};

type Invoice = {
  id: number;
  customer_id: number;
  customer_name: string;
  total: number;
  paid: number;
  remaining: number;
  date: string;
  order_id?: number;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  balance: number;
  total_invoices: number;
  total_orders: number;
  total_sales: number;
  representative?: string;
  region?: string;
  calls?: number;
  visits?: number;
};

const MEGA_CASH_BASE = 'https://alfa.mega-cash.net';

export default function Page() {
  const [section, setSection] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // جلب الفواتير والأوردرات من ميجا كاش
  const fetchInvoicesFromMegaCash = useCallback(async () => {
    setLoading(true);
    try {
      console.log('🔍 جاري البحث عن الفواتير...');
      
      // الـ endpoints الشائعة للفواتير في أنظمة ERP
      const endpoints = [
        '/api/invoices', '/api/sales', '/api/orders', '/api/bills',
        '/invoices', '/sales', '/orders', '/bills',
        '/api/v1/invoices', '/admin/invoices'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${MEGA_CASH_BASE}${endpoint}`, {
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('✅ وجدنا الفواتير!', endpoint, data);
            
            processInvoices(data);
            return;
          }
        } catch (e) {
          console.log('⏭️ تجربة endpoint آخر...', endpoint);
        }
      }
      
      alert('ℹ️ لم نجد الفواتير تلقائياً. استخدم زر "اكتشاف الفواتير"');
    } catch (error) {
      console.error('خطأ:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // معالجة الفواتير وتحويلها لعملاء
  const processInvoices = (data: any) => {
    let invoiceList: Invoice[] = [];
    
    // دعم تنسيقات مختلفة
    if (data.data) invoiceList = data.data;
    else if (data.invoices) invoiceList = data.invoices;
    else if (Array.isArray(data)) invoiceList = data;
    
    setInvoices(invoiceList);

    // تجميع العملاء من الفواتير
    const customerMap = new Map<number, Customer>();
    
    invoiceList.forEach((inv: any) => {
      const cid = inv.customer_id || inv.client_id || inv.customer?.id;
      const cname = inv.customer_name || inv.client_name || inv.customer?.name;
      
      if (cid && cname) {
        if (!customerMap.has(cid)) {
          customerMap.set(cid, {
            id: cid,
            name: cname,
            phone: inv.customer_phone || '',
            balance: inv.remaining || inv.balance || 0,
            total_invoices: 0,
            total_orders: 0,
            total_sales: 0,
            calls: 0,
            visits: 0
          });
        }
        
        const customer = customerMap.get(cid)!;
        customer.total_invoices += 1;
        customer.total_sales += (inv.total || 0);
        customer.balance += (inv.remaining || 0);
      }
    });

    setCustomers(Array.from(customerMap.values()));
    alert(`✅ تم جلب ${invoiceList.length} فاتورة و ${customerMap.size} عميل!`);
  };

  // اكتشاف الفواتير اليدوي
  const discoverInvoices = useCallback(async () => {
    const url = prompt('أدخل رابط صفحة الفواتير في ميجا كاش:');
    if (url) {
      try {
        const response = await fetch(url, { credentials: 'include' });
        const html = await response.text();
        console.log('HTML:', html.substring(0, 500));
        
const response = await fetch(url, { credentials: 'include' });
const html = await response.text();

console.log('HTML:', html.substring(0, 500));

// مؤقتًا بدون parsing
        }
      } catch (e) {
        alert('خطأ في القراءة');
      }
    }
  }, []);

  // الإحصائيات
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalSales = customers.reduce((sum, c) => sum + c.total_sales, 0);
    const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);
    
    return { totalInvoices, totalSales, totalBalance };
  }, [invoices, customers]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent text-center mb-12">
          Alfa CRM + ميجا كاش
        </h1>

        {/* تبويبات جديدة */}
        <div className="flex justify-center mb-8 gap-3 flex-wrap">
          {['dashboard', 'invoices', 'customers', 'reports'].map(tab => (
            <button key={tab} onClick={() => setSection(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                section === tab ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
              }`}>
              {tab === 'dashboard' && '🏠 لوحة التحكم'}
              {tab === 'invoices' && '📋 الفواتير'}
              {tab === 'customers' && '👥 العملاء'}
              {tab === 'reports' && '📊 التقارير'}
            </button>
          ))}
        </div>

        {/* أزرار ميجا كاش */}
        <div style={styles.box as React.CSSProperties}>
          <h3 className="text-xl font-bold text-white mb-4">🔗 ربط ميجا كاش - الفواتير والأوردرات</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={fetchInvoicesFromMegaCash}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
            >
              {loading ? '⏳ جاري الجلب...' : '📥 جلب الفواتير والأوردرات'}
            </button>
            
            <button
              onClick={discoverInvoices}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
            >
              🔍 اكتشاف الفواتير يدوي
            </button>

            <button
              onClick={() => {
                const csv = customers.map(c => 
                  `${c.name},${c.phone},${c.balance},${c.total_invoices},${c.total_sales}`
                ).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'alfa_customers.csv';
                a.click();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
            >
              💾 تصدير CSV
            </button>
          </div>
        </div>

        {/* لوحة التحكم */}
        {section === 'dashboard' && (
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            <div style={styles.box as React.CSSProperties}>
              <h3 className="text-xl font-bold text-white mb-4">📋 الفواتير</h3>
              <div className="text-4xl font-bold text-emerald-400">{stats.totalInvoices.toLocaleString()}</div>
            </div>
            <div style={styles.box as React.CSSProperties}>
              <h3 className="text-xl font-bold text-white mb-4">💰 إجمالي المبيعات</h3>
              <div className="text-4xl font-bold text-blue-400">{stats.totalSales.toLocaleString()} ج.م</div>
            </div>
            <div style={styles.box as React.CSSProperties}>
              <h3 className="text-xl font-bold text-white mb-4">⚖️ إجمالي الأرصدة</h3>
              <div className="text-4xl font-bold text-orange-400">{stats.totalBalance.toLocaleString()} ج.م</div>
            </div>
            <div style={styles.box as React.CSSProperties}>
              <h3 className="text-xl font-bold text-white mb-4">👥 العملاء</h3>
              <div className="text-4xl font-bold text-purple-400">{customers.length}</div>
            </div>
          </div>
        )}

        {/* قائمة الفواتير */}
        {section === 'invoices' && (
          <div style={styles.box as React.CSSProperties}>
            <h2 className="text-2xl font-bold text-white mb-6">📋 جميع الفواتير ({invoices.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full bg-white/5 backdrop-blur rounded-lg">
                <thead>
                  <tr>
                    <th style={styles.th as React.CSSProperties}>#</th>
                    <th style={styles.th as React.CSSProperties}>العميل</th>
                    <th style={styles.th as React.CSSProperties}>الإجمالي</th>
                    <th style={styles.th as React.CSSProperties}>المدفوع</th>
                    <th style={styles.th as React.CSSProperties}>المتبقي</th>
                    <th style={styles.th as React.CSSProperties}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.slice(0, 50).map(invoice => (
                    <tr key={invoice.id} className="hover:bg-white/10">
                      <td style={styles.td as React.CSSProperties}>{invoice.id}</td>
                      <td style={styles.td as React.CSSProperties}>{invoice.customer_name}</td>
                      <td style={styles.td as React.CSSProperties}>
                        <span className="text-green-400 font-bold">
                          {invoice.total?.toLocaleString()} ج.م
                        </span>
                      </td>
                      <td style={styles.td as React.CSSProperties}>
                        <span className="text-blue-400">{invoice.paid?.toLocaleString()} ج.م</span>
                      </td>
                      <td style={styles.td as React.CSSProperties}>
                        <span className="text-orange-400 font-bold">
                          {invoice.remaining?.toLocaleString()} ج.م
                        </span>
                      </td>
                      <td style={styles.td as React.CSSProperties}>{invoice.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* باقي الأقسام... */}
      </div>
    </div>
  );
}
