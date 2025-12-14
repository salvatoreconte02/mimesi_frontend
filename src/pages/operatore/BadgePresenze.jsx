import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Plus, Clock, AlertTriangle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/authStore';

export default function BadgePresenze() {
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // --- STATO BADGE LIVE ---
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // --- STATO RICHIESTE ---
  const [leaveType, setLeaveType] = useState('Ferie');
  const [leaveDate, setLeaveDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [leaveNote, setLeaveNote] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Load Badge Status
    const storedStatus = localStorage.getItem(`mimesi_badge_status_${user?.id}`);
    if (storedStatus) {
        const parsed = JSON.parse(storedStatus);
        setIsClockedIn(parsed.isClockedIn);
        setLastAction(parsed.lastAction);
    }

    return () => clearInterval(timer);
  }, [user?.id]);

  // Handler Timbratura LIVE
  const handleBadgeClick = () => {
    const newState = !isClockedIn;
    const actionTime = new Date().toISOString();
    
    setIsClockedIn(newState);
    setLastAction(actionTime);
    
    localStorage.setItem(`mimesi_badge_status_${user?.id}`, JSON.stringify({
        isClockedIn: newState,
        lastAction: actionTime
    }));
  };

  // Handler Invio Richiesta
  const handleSubmitLeave = (e) => {
    e.preventDefault();
    
    if (!leaveDate) return alert("Seleziona una data per la richiesta.");

    // Validazione Orari (09:00 - 18:00)
    if (startTime < "09:00" || endTime > "18:00") {
        return alert("Errore: L'orario deve essere compreso tra le 09:00 e le 18:00.");
    }

    if (startTime >= endTime) {
        return alert("Errore: L'orario di inizio deve essere precedente all'orario di fine.");
    }
    
    // Salvataggio Mock
    const requests = JSON.parse(localStorage.getItem(`mimesi_leave_requests_${user?.id}`) || '[]');
    const newRequest = {
        id: Date.now(),
        type: leaveType,
        date: leaveDate,
        startTime,
        endTime,
        note: leaveNote,
        status: 'pending'
    };
    
    localStorage.setItem(`mimesi_leave_requests_${user?.id}`, JSON.stringify([newRequest, ...requests]));
    
    // Reset Form
    setLeaveDate('');
    setStartTime('09:00');
    setEndTime('18:00');
    setLeaveNote('');
    alert("Richiesta inviata correttamente all'amministrazione.");
  };

  return (
    <div className="p-8 max-w-[1200px] mx-auto min-h-screen space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-neutral-800 flex items-center gap-3">
                <Clock className="text-primary" size={32} /> Badge & Richieste
            </h1>
            <p className="text-neutral-500">Gestione timbrature e invio giustificativi</p>
        </div>
        <div className="text-right bg-white p-3 rounded-xl border border-neutral-200 shadow-sm min-w-[200px]">
            <p className="text-2xl font-mono font-bold text-primary text-center">
                {currentTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs text-neutral-400 capitalize text-center">
                {currentTime.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        
        {/* COLONNA SX: BIG BUTTON TIMBRATURA */}
        <Card className="flex flex-col items-center justify-center p-10 h-full min-h-[550px] relative overflow-hidden bg-gradient-to-br from-white to-neutral-50 shadow-lg border-neutral-200">
            <div className={`absolute top-0 left-0 w-full h-2 ${isClockedIn ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
            
            <div className="mb-10 text-center space-y-2">
                <h3 className="text-2xl font-bold text-neutral-800">Stato Badge</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${isClockedIn ? 'bg-green-100 text-green-700 border-green-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                    <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-neutral-400'}`} />
                    {isClockedIn ? 'IN SERVIZIO' : 'NON IN SERVIZIO'}
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBadgeClick}
                className={`
                    w-64 h-64 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all border-[10px]
                    ${isClockedIn 
                        ? 'bg-red-500 border-red-100 text-white hover:bg-red-600 shadow-red-200 ring-4 ring-red-50' 
                        : 'bg-green-500 border-green-100 text-white hover:bg-green-600 shadow-green-200 ring-4 ring-green-50'
                    }
                `}
            >
                {isClockedIn ? <LogOut size={64} className="mb-2"/> : <LogIn size={64} className="mb-2"/>}
                <span className="text-xl font-bold uppercase tracking-widest mt-2">
                    {isClockedIn ? 'Uscita' : 'Entrata'}
                </span>
            </motion.button>
            
            <div className="mt-10 text-center min-h-[60px]">
                {lastAction ? (
                    <>
                        <p className="text-xs text-neutral-400 uppercase tracking-wide mb-1">Ultima Registrazione</p>
                        <p className="text-xl font-mono text-neutral-700 font-bold">
                            {new Date(lastAction).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                    </>
                ) : (
                    <p className="text-sm text-neutral-400 italic">Nessuna attività registrata oggi</p>
                )}
            </div>
        </Card>

        {/* COLONNA DX: FORM RICHIESTE */}
        <Card title="Nuova Richiesta" className="h-full min-h-[550px] flex flex-col">
            <form onSubmit={handleSubmitLeave} className="space-y-6 flex-1 flex flex-col py-2">
                
                {/* Selezione Tipo */}
                <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Tipologia Assenza</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Ferie', 'Permesso', 'Malattia', 'Altro'].map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setLeaveType(type)}
                                className={`p-3 rounded-xl text-sm font-medium transition-all border flex justify-center items-center gap-2 ${
                                    leaveType === type 
                                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                                    : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Data e Orari */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Data</label>
                        <input 
                            type="date" 
                            required
                            value={leaveDate}
                            onChange={(e) => setLeaveDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50/50 focus:bg-white transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Dalle ore</label>
                            <input 
                                type="time" 
                                required
                                value={startTime}
                                min="09:00"
                                max="18:00"
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50/50 focus:bg-white font-mono"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Alle ore</label>
                            <input 
                                type="time" 
                                required
                                value={endTime}
                                min="09:00"
                                max="18:00"
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 bg-neutral-50/50 focus:bg-white font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Warning Orario */}
                {(startTime < "09:00" || endTime > "18:00") && (
                    <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                        <AlertTriangle size={14} />
                        <span>Orario consentito: 09:00 - 18:00</span>
                    </div>
                )}

                {/* Note - Flex Grow per riempire spazio */}
                <div className="flex-grow flex flex-col">
                    <label className="block text-xs font-bold text-neutral-500 uppercase mb-1.5">Note (Opzionale)</label>
                    <textarea 
                        rows="3"
                        value={leaveNote}
                        onChange={(e) => setLeaveNote(e.target.value)}
                        className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none bg-neutral-50/50 focus:bg-white transition-all flex-grow min-h-[100px]"
                        placeholder="Dettagli aggiuntivi..."
                    />
                </div>

                {/* BUTTON CORRETTO */}
                <div className="pt-2 mt-auto">
                    <Button 
                        variant="primary" 
                        // AGGIUNTO: flex, items-center, justify-center per centrare tutto
                        className="w-full flex items-center justify-center py-3 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
                    >
                        <Plus size={18} className="mr-2" /> Invia Richiesta
                    </Button>
                </div>
            </form>
        </Card>

      </div>
    </div>
  );
}