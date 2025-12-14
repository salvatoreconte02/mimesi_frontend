import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle, CheckCircle2, Palmtree } from 'lucide-react';
import Card from '../../components/ui/Card';
import useAuthStore from '../../store/authStore';

// Configurazione orari
const START_HOUR = 8;
const END_HOUR = 18;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

// Helper date
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const formatDateISO = (date) => date.toISOString().split('T')[0];
const isWeekend = (date) => date.getDay() === 0 || date.getDay() === 6;

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

// Funzione Constraint: Prossimo giorno lavorativo
const getNextWorkingDay = () => {
    const maxDate = new Date();
    const day = maxDate.getDay();
    if (day >= 5 || day === 0) {
        maxDate.setDate(maxDate.getDate() + ((1 + 7 - day) % 7));
        if (day === 5) maxDate.setDate(maxDate.getDate() + 3);
    } else {
        maxDate.setDate(maxDate.getDate() + 1);
    }
    maxDate.setHours(23, 59, 59, 999);
    return maxDate;
};

// Mock Data Lavorazioni
const LAVORAZIONI_DB = [
  { id: 'REQ-001', paziente: 'Rossi Mario', tipo: 'Corona', elementi: '24', materiale: 'Zirconio', dataConsegna: '2025-12-17', progress: 65, urgente: true },
  { id: 'REQ-002', paziente: 'Bianchi Laura', tipo: 'Ponte', elementi: '14-16', materiale: 'Disilicato', dataConsegna: '2025-12-19', progress: 40, urgente: false },
  { id: 'REQ-003', paziente: 'Verdi Giuseppe', tipo: 'Impianto', elementi: '36', materiale: 'Titanio', dataConsegna: '2025-12-22', progress: 20, urgente: false },
  { id: 'REQ-004', paziente: 'Neri Francesca', tipo: 'Faccette', elementi: '11-21', materiale: 'Ceramica', dataConsegna: '2025-12-16', progress: 80, urgente: true },
];

// Generatore Mansioni
const generateMyTasks = (dateStr, userId) => {
  const date = new Date(dateStr);
  if (isWeekend(date)) return [];

  const seed = date.getDate() + date.getMonth() * 31;
  const result = [];
  
  const dailyTasks = [
      { lavorazioneId: 'REQ-001', fase: 'fresatura', start: '09:00', end: '11:00', note: 'Controllare margini e spessori minimi' },
      { lavorazioneId: 'REQ-003', fase: 'fresatura', start: '14:00', end: '16:00', note: 'Titanio Grado 5' },
      ...(seed % 2 === 0 ? [{ lavorazioneId: 'REQ-002', fase: 'rifinitura', start: '11:30', end: '13:00', note: 'Lucidatura a specchio richiesta' }] : [])
  ];

  dailyTasks.forEach((t, i) => {
      const now = new Date();
      const taskEnd = new Date(`${dateStr}T${t.end}`);
      const isPast = taskEnd < now;

      result.push({
          id: `${dateStr}-m${i}`,
          operatoreId: userId,
          ...t,
          completata: isPast
      });
  });

  return result;
};

// Componente Riga Mansione (Percentuale)
function MansionBlockRow({ mansione }) {
  const startMinutes = timeToMinutes(mansione.start);
  const endMinutes = timeToMinutes(mansione.end);
  
  // Calcolo Percentuale
  const startOffset = startMinutes - (START_HOUR * 60);
  const duration = endMinutes - startMinutes;
  
  const leftPercent = (startOffset / TOTAL_MINUTES) * 100;
  const widthPercent = (duration / TOTAL_MINUTES) * 100;
  
  const currentMinutes = timeToMinutes(getCurrentTime());
  const isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute top-3 bottom-3 rounded-xl border px-3 py-2 flex flex-col justify-center overflow-hidden cursor-pointer hover:shadow-lg transition-all z-10
        ${mansione.completata 
            ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-90' 
            : 'bg-white border-primary/20 shadow-sm border-l-4 border-l-primary'
        }
        ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
      `}
      style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
      title={`${mansione.fase} - ${mansione.note || ''}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className={`font-bold text-[10px] uppercase tracking-wider truncate ${mansione.completata ? 'text-neutral-500' : 'text-primary'}`}>
            {mansione.fase}
        </span>
        {mansione.completata && <CheckCircle2 size={14} className="text-green-500 shrink-0" />}
      </div>
      
      <div className="text-[10px] font-mono text-neutral-500 truncate">
        {mansione.start} - {mansione.end}
      </div>
      
      {mansione.note && (
          <p className="text-[10px] text-neutral-600 truncate mt-1 border-t border-neutral-100 pt-1 italic">
            "{mansione.note}"
          </p>
      )}
    </motion.div>
  );
}

// Riga Lavorazione
function LavorazioneRow({ lavorazione, mansioni, showCurrentLine, currentLinePercent, selectedDateStr }) {
  const daysUntil = getDaysUntil(lavorazione.dataConsegna);
  const isOverdue = daysUntil < 0;
  
  return (
    <div className="flex flex-col md:flex-row border-b border-neutral-100 hover:bg-neutral-50/30 transition-colors h-auto md:h-32">
      
      {/* Info Lavorazione (Sinistra) */}
      <div className="w-full md:w-64 shrink-0 p-4 border-r border-neutral-200 bg-white/50 flex flex-col justify-center gap-1">
        <div className="flex justify-between items-start">
            <h4 className="font-bold text-sm text-neutral-800 truncate pr-2" title={lavorazione.paziente}>
                {lavorazione.paziente}
            </h4>
            <span className="text-[9px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 border border-neutral-200">
                {lavorazione.id}
            </span>
        </div>
        <p className="text-xs text-neutral-500 truncate">{lavorazione.tipo}</p>
        <p className="text-[10px] text-neutral-400 truncate mb-2">{lavorazione.elementi} • {lavorazione.materiale}</p>
        
        <div className="flex items-center gap-2 mt-auto">
            <span className={`text-[10px] px-2 py-1 rounded-md font-bold border ${isOverdue ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-700'}`}>
                {isOverdue ? 'SCADUTO' : `Consegna: ${daysUntil} gg`}
            </span>
            {lavorazione.urgente && (
                <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md border border-red-100">
                    <AlertCircle size={12}/> URGENTE
                </div>
            )}
        </div>
      </div>
      
      {/* Timeline Area (Destra - Full Width) */}
      <div className="flex-1 relative w-full h-20 md:h-auto bg-neutral-50/20">
        
        {/* Griglia Verticale (Percentuale) */}
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
          <div 
            key={i} 
            className="absolute top-0 bottom-0 border-l border-neutral-100" 
            style={{ left: `${(i / (END_HOUR - START_HOUR)) * 100}%` }} 
          />
        ))}
        
        {/* Blocchi Mansioni */}
        {mansioni.map(m => (
            <MansionBlockRow key={m.id} mansione={m} />
        ))}
        
        {/* Linea Tempo Corrente */}
        {showCurrentLine && (
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.6)]" style={{ left: `${currentLinePercent}%` }}>
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanningOperatore() {
  const user = useAuthStore((state) => state.user);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  
  // Constraint navigazione
  const maxAllowedDate = useMemo(() => getNextWorkingDay(), []);
  
  // Controllo Assenze (Ferie)
  const [isHoliday, setIsHoliday] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
    
    // Check ferie
    const storedRequests = JSON.parse(localStorage.getItem(`mimesi_leave_requests_${user?.id}`) || '[]');
    const dateStr = formatDateISO(selectedDate);
    const holiday = storedRequests.find(req => req.date === dateStr && (req.type === 'Ferie' || req.type === 'Malattia'));
    setIsHoliday(!!holiday);

    return () => clearInterval(interval);
  }, [selectedDate, user?.id]);

  const dateStr = formatDateISO(selectedDate);
  const mansioni = useMemo(() => {
      if (isHoliday) return [];
      return generateMyTasks(dateStr, user?.id);
  }, [dateStr, user?.id, isHoliday]);
  
  const activeLavorazioni = useMemo(() => {
      const activeIds = [...new Set(mansioni.map(m => m.lavorazioneId))];
      return LAVORAZIONI_DB.filter(l => activeIds.includes(l.id)).map(l => ({
          ...l,
          mansioni: mansioni.filter(m => m.lavorazioneId === l.id)
      }));
  }, [mansioni]);

  // Calcolo posizione linea temporale
  const currentMinutes = timeToMinutes(currentTime);
  const isToday = formatDateISO(new Date()) === dateStr;
  
  // Mostra linea solo se orario è nel range
  const isWithinHours = currentMinutes >= START_HOUR * 60 && currentMinutes <= END_HOUR * 60;
  const showCurrentLine = isToday && isWithinHours;
  
  const currentLinePercent = isWithinHours 
    ? ((currentMinutes - START_HOUR * 60) / TOTAL_MINUTES) * 100 
    : 0;

  const goToPrevDay = () => setSelectedDate(d => { 
      const n = new Date(d); n.setDate(n.getDate() - 1); return n; 
  });
  
  const goToNextDay = () => setSelectedDate(d => { 
      const n = new Date(d); n.setDate(n.getDate() + 1); 
      if (n > maxAllowedDate) return d; 
      return n; 
  });

  const canGoForward = selectedDate < maxAllowedDate;
  const weekend = isWeekend(selectedDate);

  return (
    <div className="p-6 max-w-full mx-auto min-h-screen space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
            <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
            <Calendar className="text-primary" size={28} />
            La Mia Agenda
            </h1>
            <p className="text-neutral-500 text-sm">Visualizzazione delle lavorazioni assegnate</p>
        </div>
      </div>

      {/* TOOLBAR */}
      <Card className="!p-3 sticky top-4 z-30 shadow-lg border-neutral-200/80 backdrop-blur-sm bg-white/90">
        <div className="flex flex-wrap justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <button onClick={goToPrevDay} className="p-2 hover:bg-neutral-100 rounded-xl text-neutral-600 transition-colors border border-transparent hover:border-neutral-200">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[180px]">
              <h2 className="font-bold text-neutral-800 capitalize text-lg leading-none">
                {selectedDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
              </h2>
              <div className="flex justify-center gap-2 mt-1">
                {isToday && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Oggi</span>}
                {isHoliday && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Ferie</span>}
              </div>
            </div>
            <button 
                onClick={goToNextDay} 
                disabled={!canGoForward}
                className={`p-2 rounded-xl transition-all border border-transparent ${canGoForward ? 'hover:bg-neutral-100 text-neutral-600 hover:border-neutral-200' : 'text-neutral-300 cursor-not-allowed'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-200">
             <Clock size={18} className="text-primary" />
             <span className="font-mono font-bold text-neutral-800 text-lg">{currentTime}</span>
          </div>
        </div>
      </Card>

      {/* MAIN CONTENT */}
      {weekend ? (
        <Card className="!p-16 text-center border-dashed bg-neutral-50/50">
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
             <Calendar size={48} className="text-neutral-300" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-1">Weekend Libero</h3>
          <p className="text-neutral-400">Nessuna mansione programmata.</p>
        </Card>
      ) : isHoliday ? (
        <Card className="!p-16 text-center border-blue-200 bg-blue-50/30">
           <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4 text-blue-400">
               <Palmtree size={48} />
           </div>
           <h3 className="text-2xl font-bold text-blue-900 mb-1">IN FERIE</h3>
           <p className="text-blue-600/70">Goditi il tuo tempo libero!</p>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden border border-neutral-200 shadow-sm flex flex-col">
          {/* Timeline Header (Ore) */}
          <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-20">
            <div className="w-full md:w-64 shrink-0 p-4 border-r border-neutral-200 text-xs font-bold uppercase text-neutral-400 tracking-wider flex items-center bg-neutral-50">
              Lavorazioni ({activeLavorazioni.length})
            </div>
            
            <div className="flex-1 relative h-10 w-full">
              {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                <div 
                    key={i} 
                    className="absolute top-0 bottom-0 border-l border-neutral-200/50 flex flex-col justify-end pb-2 pl-1" 
                    style={{ left: `${(i / (END_HOUR - START_HOUR)) * 100}%` }}
                >
                  <span className="text-[10px] font-mono text-neutral-400 leading-none">
                    {(START_HOUR + i).toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
              {showCurrentLine && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none" style={{ left: `${currentLinePercent}%` }}>
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                </div>
              )}
            </div>
          </div>

          {/* Rows List */}
          <div className="flex-1">
            {activeLavorazioni.length > 0 ? (
              activeLavorazioni.map(lav => (
                <LavorazioneRow
                  key={lav.id}
                  lavorazione={lav}
                  mansioni={lav.mansioni}
                  showCurrentLine={showCurrentLine}
                  currentLinePercent={currentLinePercent}
                  selectedDateStr={dateStr}
                />
              ))
            ) : (
              <div className="p-20 text-center text-neutral-400">
                <p className="font-medium text-lg">Nessuna mansione assegnata per questa giornata</p>
                <p className="text-sm mt-2 opacity-60">Controlla le notifiche o contatta l'amministrazione.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}