import Card from '../components/ui/Card';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-neutral-500 font-medium">{label}</p>
      <h4 className="text-2xl font-bold text-neutral-800">{value}</h4>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">Bentornato, {user?.name} 👋</h1>
        <p className="text-neutral-500">Ecco cosa sta succedendo oggi in laboratorio.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Activity} label="Lavorazioni Attive" value="12" color="bg-primary" delay={0.1} />
        <StatCard icon={Clock} label="In Scadenza" value="3" color="bg-warning" delay={0.2} />
        <StatCard icon={CheckCircle} label="Completate" value="28" color="bg-success" delay={0.3} />
        <StatCard icon={AlertCircle} label="Da Approvare" value="5" color="bg-secondary" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Lavorazioni Recenti" subtitle="Ultime attività registrate">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border flex items-center justify-center text-sm font-bold text-primary">#{202400 + i}</div>
                    <div>
                      <p className="font-bold text-neutral-800">Corona in Zirconio</p>
                      <p className="text-sm text-neutral-500">Paziente: Mario R.</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary-lighter text-secondary">In Lavorazione</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Prossime Consegne" className="bg-gradient-to-br from-primary to-primary-hover text-white">
             <div className="space-y-4 mt-2">
                <div className="flex gap-3 items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <div className="text-center"><span className="block text-xs opacity-70">FEB</span><span className="block text-lg font-bold">24</span></div>
                   <div><p className="font-medium">Studio Dott. Verdi</p><p className="text-xs opacity-80">Ponte 3 elementi</p></div>
                </div>
                <div className="flex gap-3 items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                   <div className="text-center"><span className="block text-xs opacity-70">FEB</span><span className="block text-lg font-bold">25</span></div>
                   <div><p className="font-medium">Studio Dott. Bianchi</p><p className="text-xs opacity-80">Protesi Mobile</p></div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}