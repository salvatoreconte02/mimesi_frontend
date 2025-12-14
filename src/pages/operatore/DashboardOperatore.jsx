import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, ChevronRight, Mail } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button'; 
import StatusWorkWidget, { COLOR_PRESETS } from '../../components/ui/StatusWorkWidget';
import useAuthStore from '../../store/authStore';

export default function DashboardOperatore({ setPage }) {
  const user = useAuthStore((state) => state.user);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [taskCount, setTaskCount] = useState(0);

  // Mock Inbox Messages (Stile Inbox Dashboard)
  const inboxMessages = [
    { 
        id: 1, 
        from: 'Amministrazione', 
        subject: 'Approvazione Ferie Natale', 
        date: '10:30',
        read: false,
        type: 'info'
    },
    { 
        id: 2, 
        from: 'Dr. Rossi', 
        subject: 'URGENTE: Modifica REQ-004', 
        date: '09:15',
        read: false,
        type: 'urgent'
    },
    { 
        id: 3, 
        from: 'Sistema', 
        subject: 'Manutenzione Fresatrice', 
        date: 'Ieri',
        read: true,
        type: 'system'
    }
  ];

  // Mock Tasks (Limitato a 2)
  const nextTasks = [
      { time: '09:00 - 11:00', task: 'Fresatura', patient: 'Rossi M.', status: 'pending' },
      { time: '11:30 - 12:30', task: 'Rifinitura', patient: 'Bianchi L.', status: 'pending' },
  ];

  useEffect(() => {
    // Check Badge Status
    const storedStatus = localStorage.getItem(`mimesi_badge_status_${user?.id}`);
    if (storedStatus) setIsClockedIn(JSON.parse(storedStatus).isClockedIn);

    // Mock Task Count
    setTaskCount(4); 
  }, [user?.id]);

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Ciao, {user?.nome} 👋</h1>
          <p className="text-neutral-500 mt-1">Pronto per la giornata?</p>
        </div>
        
        {/* STATO BADGE MINI */}
        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${isClockedIn ? 'bg-green-50 border-green-200 text-green-700' : 'bg-neutral-100 border-neutral-200 text-neutral-500'}`}>
            <div className={`w-3 h-3 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
            <span className="text-sm font-bold">{isClockedIn ? 'In Servizio' : 'Non in servizio'}</span>
        </div>
      </div>

      {/* WIDGETS STATS */}
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

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* PROSSIME ATTIVITÀ (Header Link, Max 2 Items) */}
         <Card className="!p-0 overflow-hidden h-full flex flex-col min-h-[350px]">
            <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-bold text-neutral-800">Prossime Attività</h3>
                <button onClick={() => setPage('planning')} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                    Vedi Agenda <ChevronRight size={16} />
                </button>
            </div>
            
            <div className="p-4 space-y-3 flex-1">
                {nextTasks.map((t, i) => (
                    <div key={i} className="flex items-center p-3 rounded-xl border border-neutral-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                        <div className="w-24 text-xs font-mono text-neutral-500 font-medium">{t.time}</div>
                        <div className="flex-1">
                            <p className="font-bold text-neutral-800 text-sm">{t.task}</p>
                            <p className="text-xs text-neutral-500">{t.patient}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${t.status === 'pending' ? 'bg-orange-400 animate-pulse' : 'bg-neutral-300'}`} />
                    </div>
                ))}
                {/* Spazio vuoto decorativo se la lista è corta */}
                <div className="flex-1 flex items-center justify-center text-xs text-neutral-300 italic p-4">
                    Visualizzazione limitata alle prossime 2 ore
                </div>
            </div>
         </Card>

         {/* INBOX OPERATORE (Stile Widget Inbox Admin) */}
         <Card className="!p-0 overflow-hidden h-full flex flex-col min-h-[350px]">
             <div className="px-5 py-4 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h3 className="font-bold text-neutral-800">Inbox</h3>
                <button className="text-sm font-bold text-neutral-400 cursor-not-allowed flex items-center gap-1">
                    Tutti <ChevronRight size={16} />
                </button>
             </div>

             <div className="p-3 flex-1 overflow-y-auto custom-scrollbar">
                {inboxMessages.length > 0 ? (
                    <div className="space-y-1">
                        {inboxMessages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className="p-3 hover:bg-neutral-50 rounded-xl cursor-pointer transition-colors border border-transparent hover:border-neutral-100"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold ${!msg.read ? 'text-primary' : 'text-neutral-600'}`}>
                                        {msg.from}
                                    </span>
                                    <span className="text-[10px] text-neutral-400">{msg.date}</span>
                                </div>
                                <p className={`text-xs mb-1 truncate ${!msg.read ? 'font-bold text-neutral-800' : 'text-neutral-500'}`}>
                                    {msg.subject}
                                </p>
                                
                                <div className="flex gap-2 mt-2">
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider
                                        ${msg.type === 'urgent' ? 'bg-red-50 text-red-600 border-red-100' : 
                                          msg.type === 'info' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                          'bg-neutral-50 text-neutral-500 border-neutral-100'}`}>
                                        {msg.type === 'urgent' ? 'Urgente' : 
                                         msg.type === 'info' ? 'Info' : 'Sistema'}
                                    </span>
                                    {!msg.read && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1"></span>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-neutral-400 flex flex-col items-center">
                        <Mail size={32} className="mb-2 opacity-20"/>
                        <p className="text-xs">Nessun messaggio</p>
                    </div>
                )}
             </div>
         </Card>
      </div>
    </div>
  );
}