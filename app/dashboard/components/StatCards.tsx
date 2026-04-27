import { Users, DollarSign, PhoneCall, Activity, Calendar } from 'lucide-react';

export default function StatCards({ stats }: any) {
  const cards = [
    { title: 'إجمالي العملاء', value: stats.totalCustomers.toLocaleString(), icon: Users, gradient: 'from-indigo-500 to-blue-600' },
    { title: 'إجمالي الرصيد', value: `${stats.totalBalance.toLocaleString('ar-EG')} ج.م`, icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
    { title: 'إجمالي المكالمات', value: stats.totalCalls.toLocaleString(), icon: PhoneCall, gradient: 'from-purple-500 to-violet-600' },
    { title: 'مكالمات اليوم', value: stats.todayCalls.toLocaleString(), icon: Activity, gradient: 'from-orange-500 to-red-600' },
    { title: 'المتابعات القادمة', value: stats.upcomingFollowUps.toLocaleString(), icon: Calendar, gradient: 'from-amber-500 to-yellow-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
      {cards.map((card, i) => (
        <div key={i} className="group relative overflow-hidden h-36 lg:h-44 crm-card p-8 lg:p-10">
          <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-20 blur-xl -z-10 group-hover:opacity-30 transition-opacity`}></div>
          <div className="relative z-10 flex items-center justify-between h-full">
            <div>
              <p className="text-slate-300 font-medium text-sm mb-4">{card.title}</p>
              <p className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">{card.value}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xl rounded-3xl group-hover:scale-110 transition-all"><card.icon className="w-10 h-10 text-white/90" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}