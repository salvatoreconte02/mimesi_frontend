import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, LogIn, LogOut, Calendar, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';

export default function BadgePresenze() {
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Stato Badge (In/Out)
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Stato Richieste Ferie
  const [leaveType, setLeaveType] = useState('Ferie');
  const [leaveDate, setLeaveDate] = useState('');
  const [leaveNote, setLeaveNote] = useState('');
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Carica stato badge
    const storedStatus = localStorage.getItem(`mimesi_badge_status_${user?.id}`);
    if (storedStatus) {
        const parsed = JSON.parse(storedStatus);
        setIsClockedIn(parsed.isClockedIn);
        setLastAction(parsed.lastAction);
    }

    // Carica richieste
    const storedRequests = localStorage.getItem(`mimesi_leave_requests_${user?.id}`);
    if (storedRequests) setRequests(JSON.parse(storedRequests));

    return () => clearInterval(timer);
  }, [user?.id]);

  const handleBadgeClick = () => {
    const newState = !isClockedIn;
    const actionTime = new Date().toISOString();
    
    setIsClockedIn(newState);
    setLastAction(actionTime);
    
    localStorage.setItem(`mimesi_badge_status_${user?.id}`, JSON.stringify({
        isClockedIn: newState,
        lastAction: actionTime
    }));

    // Simulazione Log Storico (opzionale)
    console.log(`User ${user.name} ${newState ? 'Clocked In' : 'Clocked Out'} at ${actionTime}`);
  };

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    if (!leaveDate) return alert("Seleziona una data");

    const newRequest = {
        id: Date.now(),
        type: leaveType,
        date: leaveDate,
        note: leaveNote,
        status: 'pending' // In un'app reale andrebbe approvato da Admin
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem(`mimesi_leave_requests_${user?.id}`, JSON.stringify(updated));
    
    // Reset form
    setLeaveDate('');
    setLeaveNote('');
    alert("Richiesta inviata con successo!");
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-neutral-800">Badge & Presenze</h1>
            <p className="text-neutral-500">Gestisci i tuoi orari e richiedi permessi</p>
        </div>
        <div className="text-right">
            <p className="text-3xl font-mono font-bold text-primary">
                {currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-sm text-neutral-400 capitalize">
                {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CARD TIMBRATURA */}
        <Card className="flex flex-col items-center justify-center p-10 min-h-[400px] relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${isClockedIn ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
            
            <div className="mb-8 text-center">
                <h3 className="text-xl font-bold text-neutral-800 mb-2">
                    {isClockedIn ? 'Sei al lavoro' : 'Fuori sede'}
                </h3>
                {lastAction && (
                    <p className="text-sm text-neutral-500">
                        Ultima azione: <span className="font-bold">{new Date(lastAction).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </p>
                )}
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBadgeClick}
                className={`
                    w-48 h-48 rounded-full flex flex-col items-center justify-center shadow-xl transition-all border-8
                    ${isClockedIn 
                        ? 'bg-red-500 border-red-100 text-white hover:bg-red-600 shadow-red-200' 
                        : 'bg-green-500 border-green-100 text-white hover:bg-green-600 shadow-green-200'
                    }
                `}
            >
                {isClockedIn ? <LogOut size={48} className="mb-2"/> : <LogIn size={48} className="mb-2"/>}
                <span className="text-lg font-bold uppercase tracking-widest">
                    {isClockedIn ? 'Uscita' : 'Entrata'}
                </span>
            </motion.button>

            <p className="mt-8 text-xs text-neutral-400 max-w-xs text-center">
                Clicca il pulsante per registrare l'ingresso o l'uscita. I dati verranno salvati nel registro presenze aziendale.
            </p>
        </Card>

        {/* CARD RICHIESTA PERMESSI */}
        <div className="space-y-6">
            <Card title="Richiedi Assenza">
                <form onSubmit={handleSubmitLeave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Motivazione</label>
                            <select 
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                                className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 bg-white"
                            >
                                <option value="Ferie">🏖️ Ferie</option>
                                <option value="Permesso">⏱️ Permesso Orario</option>
                                <option value="Malattia">🤒 Malattia</option>
                                <option value="Altro">📝 Altro</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Data</label>
                            <input 
                                type="date" 
                                value={leaveDate}
                                onChange={(e) => setLeaveDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Note (Opzionale)</label>
                        <textarea 
                            rows="2"
                            value={leaveNote}
                            onChange={(e) => setLeaveNote(e.target.value)}
                            className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 resize-none"
                            placeholder="Dettagli aggiuntivi..."
                        />
                    </div>
                    <Button variant="secondary" className="w-full flex justify-center items-center gap-2">
                        <Plus size={18} /> Invia Richiesta
                    </Button>
                </form>
            </Card>

            <Card title="Le tue Richieste" className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {requests.length === 0 ? (
                    <div className="text-center py-6 text-neutral-400">
                        <Calendar size={32} className="mx-auto mb-2 opacity-30"/>
                        <p className="text-sm">Nessuna richiesta recente</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg
                                        ${req.type === 'Ferie' ? 'bg-blue-100 text-blue-600' : 
                                          req.type === 'Malattia' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}
                                    `}>
                                        {req.type === 'Ferie' ? '🏖️' : req.type === 'Malattia' ? '🤒' : '⏱️'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-neutral-800 text-sm">{req.type}</p>
                                        <p className="text-xs text-neutral-500">{new Date(req.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded tracking-wide">
                                    {req.status === 'pending' ? 'In Attesa' : req.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>

      </div>
    </div>
  );
}