import { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Coffee } from 'lucide-react';

// --- CONFIGURAZIONE VISUALIZZAZIONE ---
const START_HOUR = 8;
const END_HOUR = 19; 
const HOUR_HEIGHT = 50; 
const CONTAINER_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

// --- OPERATORI ---
const OPERATORI = [
  { id: 1, nome: 'Marco', ruolo: 'CAD', color: 'bg-blue-500', colorLight: 'bg-blue-50', colorText: 'text-blue-700', border: 'border-blue-200' },
  { id: 2, nome: 'Lucia', ruolo: 'Ceramica', color: 'bg-pink-500', colorLight: 'bg-pink-50', colorText: 'text-pink-700', border: 'border-pink-200' },
  { id: 3, nome: 'Paolo', ruolo: 'Fresatura', color: 'bg-emerald-500', colorLight: 'bg-emerald-50', colorText: 'text-emerald-600', border: 'border-emerald-200' },
  { id: 4, nome: 'Sara', ruolo: 'Rifinitura', color: 'bg-purple-500', colorLight: 'bg-purple-50', colorText: 'text-purple-600', border: 'border-purple-200' },
];

// --- HELPERS ---
const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const formatDateISO = (date) => {
  return date.toISOString().split('T')[0];
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isSameDay = (date1, date2) => {
  return formatDateISO(date1) === formatDateISO(date2);
};

// --- GENERA DATI DEMO (Start minimo ore 09:00) ---
const generateMansioniForDate = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];
  
  const seed = date.getDate() + date.getMonth() * 31;
  
  const mansioniPool = {
    1: [
      [{ paziente: 'Rossi M.', fase: 'CAD', oraInizio: '09:00', oraFine: '11:00' }, { paziente: 'Bianchi L.', fase: 'CAD', oraInizio: '14:00', oraFine: '16:00' }],
      [{ paziente: 'Verdi G.', fase: 'CAD', oraInizio: '09:30', oraFine: '12:30' }, { paziente: 'Neri F.', fase: 'CAD', oraInizio: '15:00', oraFine: '17:30' }]
    ],
    2: [
      [{ paziente: 'Neri F.', fase: 'Ceramica', oraInizio: '09:00', oraFine: '12:00' }, { paziente: 'Rossi M.', fase: 'Ceramica', oraInizio: '14:00', oraFine: '17:00' }],
      [{ paziente: 'Bianchi L.', fase: 'Ceramica', oraInizio: '10:00', oraFine: '13:00' }, { paziente: 'Verdi G.', fase: 'Ceramica', oraInizio: '14:30', oraFine: '16:30' }]
    ],
    3: [
      [{ paziente: 'Rossi M.', fase: 'Fresatura', oraInizio: '11:00', oraFine: '13:00' }, { paziente: 'Bianchi L.', fase: 'Fresatura', oraInizio: '16:00', oraFine: '17:30' }],
      [{ paziente: 'Neri F.', fase: 'Fresatura', oraInizio: '09:00', oraFine: '11:00' }, { paziente: 'Verdi G.', fase: 'Fresatura', oraInizio: '14:00', oraFine: '16:30' }]
    ],
    4: [
      [{ paziente: 'Neri F.', fase: 'Rifinitura', oraInizio: '14:00', oraFine: '15:30' }, { paziente: 'Rossi M.', fase: 'Rifinitura', oraInizio: '16:30', oraFine: '17:30' }],
      [{ paziente: 'Bianchi L.', fase: 'Rifinitura', oraInizio: '09:30', oraFine: '11:00' }, { paziente: 'Verdi G.', fase: 'Rifinitura', oraInizio: '15:00', oraFine: '17:00' }]
    ],
  };
  
  const result = [];
  let idCounter = 1;
  OPERATORI.forEach(op => {
    const pool = mansioniPool[op.id] || [];
    const selectedSet = pool.length > 0 ? pool[(seed + op.id) % pool.length] : [];
    selectedSet.forEach((m) => {
      const startMinutes = timeToMinutes(m.oraInizio);
      const currentMinutes = timeToMinutes(getCurrentTime());
      const isInPast = startMinutes + 90 < currentMinutes;
      result.push({ id: idCounter++, operatoreId: op.id, ...m, completata: isInPast });
    });
  });
  return result;
};

// --- COMPONENTI UI ---

function MiniMansionBlock({ mansione }) {
  const startMinutes = timeToMinutes(mansione.oraInizio);
  const endMinutes = timeToMinutes(mansione.oraFine);
  
  // Posizionamento
  const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 2; 

  const operatore = OPERATORI.find(o => o.id === mansione.operatoreId);
  const isCompleted = mansione.completata;

  return (
    <div
      className={`
        absolute left-1 right-1 rounded border text-[9px] p-1 flex flex-col justify-center overflow-hidden transition-all z-10 cursor-default
        ${isCompleted 
           ? 'bg-neutral-50 border-neutral-200 text-neutral-400 opacity-90' 
           : `${operatore.colorLight} ${operatore.border} ${operatore.colorText} shadow-sm hover:brightness-95`
        }
      `}
      style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
      title={`${mansione.paziente} - ${mansione.fase}`}
    >
      <div className="font-bold truncate leading-none">{mansione.paziente}</div>
      {!isCompleted && (
        <div className="opacity-80 mt-0.5 text-[8px] uppercase tracking-tighter truncate">{mansione.fase}</div>
      )}
    </div>
  );
}

function MiniOperatorColumn({ operatore, mansioni, currentMinutes, isToday }) {
    const currentLineTop = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const showLine = isToday && currentMinutes >= START_HOUR * 60 && currentMinutes <= END_HOUR * 60;

    return (
        <div className="flex-1 min-w-0 border-r border-neutral-100 last:border-r-0 relative flex flex-col h-full">
            {/* Header Colonna */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 p-1.5 flex flex-col items-center justify-center h-[40px] shrink-0 sticky top-0 z-20">
                <div className={`w-4 h-4 rounded-full ${operatore.color} flex items-center justify-center text-white text-[8px] font-bold mb-0.5`}>
                    {operatore.nome[0]}
                </div>
                <div className="text-[9px] font-bold text-neutral-600 truncate w-full text-center">{operatore.nome}</div>
            </div>

            {/* Timeline */}
            <div className="relative bg-neutral-50/20 w-full flex-1" style={{ height: `${CONTAINER_HEIGHT}px` }}> 
                {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                    <div key={i} className="absolute left-0 right-0 border-t border-dashed border-neutral-100" style={{ top: `${i * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }} />
                ))}

                {mansioni.map(m => (
                    <MiniMansionBlock key={m.id} mansione={m} />
                ))}

                {showLine && (
                    <div className="absolute left-0 right-0 border-t border-red-400 z-30 pointer-events-none opacity-60" style={{ top: `${currentLineTop}px` }}>
                        <div className="absolute -left-0.5 -top-[2px] w-1 h-1 rounded-full bg-red-400"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- WIDGET PRINCIPALE ---
export default function PlanningWidget({ onNavigate }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const scrollRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 30000);
    // Auto-scroll iniziale
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0; 
    }
    return () => clearInterval(interval);
  }, []);

  const dateStr = formatDateISO(selectedDate);
  const mansioni = useMemo(() => generateMansioniForDate(dateStr), [dateStr]);
  const currentMinutes = timeToMinutes(currentTime);
  const weekend = isWeekend(selectedDate);
  const isToday = isSameDay(selectedDate, new Date());

  const mansioniPerOperatore = useMemo(() => {
    return OPERATORI.map(op => ({
      operatore: op,
      mansioni: mansioni.filter(m => m.operatoreId === op.id)
    }));
  }, [mansioni]);

  const formattedDate = selectedDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' });
  const goToPrev = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goToNext = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToToday = () => setSelectedDate(new Date());

  return (
    // CONTENITORE: h-full per riempire i 420px del padre.
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden h-full flex flex-col relative w-full">
      
      {/* Header Widget */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">Planning</h3>
            <div className="flex items-center gap-1 text-[10px] mt-0.5 text-neutral-500">
              <button onClick={goToPrev} className="hover:bg-neutral-100 rounded p-0.5"><ChevronLeft size={12} /></button>
              <span className={`px-1 font-medium capitalize ${isToday ? 'text-primary' : ''}`}>{formattedDate}</span>
              <button onClick={goToNext} className="hover:bg-neutral-100 rounded p-0.5"><ChevronRight size={12} /></button>
              {!isToday && <button onClick={goToToday} className="text-primary font-bold ml-1 hover:underline">Oggi</button>}
            </div>
          </div>
        </div>
        <button onClick={onNavigate} className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline bg-neutral-50 px-2 py-1 rounded border border-neutral-100">
          Espandi <ChevronRight size={12} />
        </button>
      </div>

      {/* Corpo Widget */}
      {weekend ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-neutral-50/30">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
             <Coffee size={24} className="text-neutral-300" />
          </div>
          <p className="text-xs font-bold text-neutral-500">Chiuso</p>
        </div>
      ) : (
        // KEY FIX: min-h-0 qui impedisce l'espansione oltre i 420px del padre
        <div className="flex-1 min-h-0 relative flex flex-col">
            
            {/* Scroll Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative flex w-full" ref={scrollRef}>
                
                {/* Colonna Orari (Sticky Left) */}
                <div className="w-8 flex-shrink-0 border-r border-neutral-200 bg-white sticky left-0 z-20">
                    <div className="h-[40px] border-b border-neutral-200 bg-white sticky top-0 z-30"></div> {/* Spacer Header */}
                    <div className="relative w-full" style={{ height: `${CONTAINER_HEIGHT}px` }}>
                        {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                            <div key={i} className="absolute right-1 text-[9px] text-neutral-300 font-mono -translate-y-1/2" style={{ top: `${i * HOUR_HEIGHT}px` }}>
                                {(START_HOUR + i).toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Colonne Operatori */}
                <div className="flex flex-1 min-w-0 h-full">
                    {mansioniPerOperatore.map(({ operatore, mansioni }) => (
                        <MiniOperatorColumn
                            key={operatore.id}
                            operatore={operatore}
                            mansioni={mansioni}
                            currentMinutes={currentMinutes}
                            isToday={isToday}
                        />
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
}