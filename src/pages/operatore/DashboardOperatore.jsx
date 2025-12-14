import { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button'; // IMPORT CORRETTO
import StatusWorkWidget, { COLOR_PRESETS } from '../../components/ui/StatusWorkWidget';
import useAuthStore from '../../store/authStore';

export default function DashboardOperatore({ setPage }) {
  const user = useAuthStore((state) => state.user);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  useEffect(() => {
    const storedStatus = localStorage.getItem(`mimesi_badge_status_${user?.id}`);
    if (storedStatus) setIsClockedIn(JSON.parse(storedStatus).isClockedIn);
    setTaskCount(4); // Mock fisso come da specifica
  }, [user?.id]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Ciao, {user?.nome} 👋</h1>
          <p className="text-neutral-500 mt-1">Pronto per la giornata?</p>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${isClockedIn ? 'bg-green-50 border-green-200 text-green-700' : 'bg-neutral-100 border-neutral-200 text-neutral-500'}`}>
            <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
            <span className="text-sm font-bold">{isClockedIn ? 'In Servizio' : 'Non in servizio'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatusWorkWidget
            count={taskCount}
            icon={Activity}
            label="Mansioni Oggi"
            colorClasses={COLOR_PRESETS.primary}
            onClick={() => setPage('planning')}
         />
         <StatusWorkWidget
            count={12} 
            icon={CheckCircle}
            label="Completate Settimana"
            colorClasses={COLOR_PRESETS.success}
         />
         <StatusWorkWidget
            count={isClockedIn ? 'ON' : 'OFF'}
            icon={Clock}
            label="Stato Badge"
            colorClasses={isClockedIn ? COLOR_PRESETS.green : COLOR_PRESETS.orange}
            onClick={() => setPage('badge')}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card title="Prossime Attività" className="min-h-[300px]">
            <div className="space-y-3 mt-4">
                {[
                    { time: '09:00 - 11:00', task: 'Fresatura', patient: 'Rossi M.', status: 'pending' },
                    { time: '11:30 - 12:30', task: 'Rifinitura', patient: 'Bianchi L.', status: 'pending' },
                    { time: '14:00 - 16:00', task: 'CAD', patient: 'Verdi G.', status: 'future' },
                ].map((t, i) => (
                    <div key={i} className="flex items-center p-3 rounded-xl border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-all">
                        <div className="w-16 text-xs font-mono text-neutral-500">{t.time.split(' - ')[0]}</div>
                        <div className="flex-1">
                            <p className="font-bold text-neutral-800 text-sm">{t.task}</p>
                            <p className="text-xs text-neutral-500">{t.patient}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${t.status === 'pending' ? 'bg-orange-400' : 'bg-neutral-300'}`} />
                    </div>
                ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs" onClick={() => setPage('planning')}>Vedi Agenda Completa</Button>
         </Card>

         <Card title="Comunicazioni" className="min-h-[300px] flex flex-col items-center justify-center text-neutral-400">
             <p>Nessuna comunicazione urgente</p>
         </Card>
      </div>
    </div>
  );
}