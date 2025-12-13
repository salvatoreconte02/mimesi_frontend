import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, ChevronLeft, CheckCircle, Coffee } from 'lucide-react';

// --- OPERATORI ---
const OPERATORI = [
  { id: 1, nome: 'Marco', ruolo: 'CAD', color: 'bg-blue-500', colorLight: 'bg-blue-50', colorText: 'text-blue-600' },
  { id: 2, nome: 'Lucia', ruolo: 'Ceramica', color: 'bg-pink-500', colorLight: 'bg-pink-50', colorText: 'text-pink-600' },
  { id: 3, nome: 'Paolo', ruolo: 'Fresatura', color: 'bg-emerald-500', colorLight: 'bg-emerald-50', colorText: 'text-emerald-600' },
  { id: 4, nome: 'Sara', ruolo: 'Rifinitura', color: 'bg-purple-500', colorLight: 'bg-purple-50', colorText: 'text-purple-600' },
];

// --- HELPERS ---
const timeToMinutes = (timeStr) => {
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

// --- GENERA MANSIONI PER DATA (senza overlap) ---
const generateMansioniForDate = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];
  
  const seed = date.getDate() + date.getMonth() * 31;
  
  const mansioniPool = {
    1: [
      [{ paziente: 'Rossi M.', fase: 'CAD', oraInizio: '08:30', oraFine: '10:30' }, { paziente: 'Bianchi L.', fase: 'CAD', oraInizio: '14:00', oraFine: '16:00' }],
      [{ paziente: 'Verdi G.', fase: 'CAD', oraInizio: '09:00', oraFine: '12:00' }, { paziente: 'Neri F.', fase: 'CAD', oraInizio: '14:30', oraFine: '17:00' }],
      [{ paziente: 'Gialli A.', fase: 'CAD', oraInizio: '08:00', oraFine: '10:00' }, { paziente: 'Rossi M.', fase: 'CAD', oraInizio: '11:00', oraFine: '13:00' }, { paziente: 'Blu M.', fase: 'CAD', oraInizio: '15:00', oraFine: '17:30' }],
    ],
    2: [
      [{ paziente: 'Neri F.', fase: 'Ceramica', oraInizio: '08:00', oraFine: '11:00' }, { paziente: 'Rossi M.', fase: 'Ceramica', oraInizio: '14:00', oraFine: '17:00' }],
      [{ paziente: 'Bianchi L.', fase: 'Ceramica', oraInizio: '09:00', oraFine: '12:30' }, { paziente: 'Verdi G.', fase: 'Ceramica', oraInizio: '14:00', oraFine: '16:00' }],
      [{ paziente: 'Gialli A.', fase: 'Ceramica', oraInizio: '10:00', oraFine: '13:00' }],
    ],
    3: [
      [{ paziente: 'Rossi M.', fase: 'Fresatura', oraInizio: '11:00', oraFine: '13:00' }, { paziente: 'Bianchi L.', fase: 'Fresatura', oraInizio: '16:00', oraFine: '17:30' }],
      [{ paziente: 'Neri F.', fase: 'Fresatura', oraInizio: '08:30', oraFine: '10:30' }, { paziente: 'Verdi G.', fase: 'Fresatura', oraInizio: '14:00', oraFine: '16:30' }],
      [{ paziente: 'Blu M.', fase: 'Fresatura', oraInizio: '09:00', oraFine: '11:00' }, { paziente: 'Gialli A.', fase: 'Fresatura', oraInizio: '13:00', oraFine: '15:00' }],
    ],
    4: [
      [{ paziente: 'Neri F.', fase: 'Rifinitura', oraInizio: '14:00', oraFine: '15:30' }, { paziente: 'Rossi M.', fase: 'Rifinitura', oraInizio: '16:30', oraFine: '17:30' }],
      [{ paziente: 'Bianchi L.', fase: 'Rifinitura', oraInizio: '09:00', oraFine: '10:30' }, { paziente: 'Verdi G.', fase: 'Rifinitura', oraInizio: '15:00', oraFine: '17:00' }],
      [{ paziente: 'Gialli A.', fase: 'Rifinitura', oraInizio: '11:00', oraFine: '12:30' }],
    ],
  };
  
  const result = [];
  let idCounter = 1;
  
  OPERATORI.forEach(op => {
    const pool = mansioniPool[op.id];
    const selectedSet = pool[(seed + op.id) % pool.length];
    
    selectedSet.forEach((m, idx) => {
      const startMinutes = timeToMinutes(m.oraInizio);
      const currentMinutes = timeToMinutes(getCurrentTime());
      const isInPast = startMinutes + 90 < currentMinutes;
      
      result.push({
        id: idCounter++,
        operatoreId: op.id,
        ...m,
        completata: isInPast && (seed + idx) % 3 !== 0,
      });
    });
  });
  
  return result;
};

// --- CARD OPERATORE ---
function OperatorCard({ operatore, mansioni, currentMinutes }) {
  const sorted = [...mansioni].sort((a, b) => timeToMinutes(a.oraInizio) - timeToMinutes(b.oraInizio));
  
  const mansioneAttuale = sorted.find(m => {
    const start = timeToMinutes(m.oraInizio);
    const end = timeToMinutes(m.oraFine);
    return currentMinutes >= start && currentMinutes < end && !m.completata;
  });
  
  const mansioneProssima = sorted.find(m => {
    const start = timeToMinutes(m.oraInizio);
    return start > currentMinutes && !m.completata;
  });
  
  const completateOggi = mansioni.filter(m => m.completata).length;
  const totaleOggi = mansioni.length;
  
  let stato = 'libero';
  let mansioneMostrata = null;
  
  if (mansioneAttuale) {
    stato = 'attivo';
    mansioneMostrata = mansioneAttuale;
  } else if (mansioneProssima) {
    stato = 'prossimo';
    mansioneMostrata = mansioneProssima;
  } else if (completateOggi === totaleOggi && totaleOggi > 0) {
    stato = 'finito';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-3 rounded-xl border transition-all
        ${stato === 'attivo' 
          ? `${operatore.colorLight} border-current ${operatore.colorText} ring-2 ring-current ring-opacity-20` 
          : 'bg-white border-neutral-100 hover:border-neutral-200'}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full ${operatore.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {operatore.nome[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-neutral-800 truncate">{operatore.nome}</h4>
          <p className="text-[10px] text-neutral-400">{operatore.ruolo}</p>
        </div>
        
        {stato === 'attivo' && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-white px-1.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            IN CORSO
          </span>
        )}
        {stato === 'finito' && <CheckCircle size={16} className="text-green-500" />}
        {stato === 'libero' && totaleOggi === 0 && <Coffee size={14} className="text-neutral-300" />}
      </div>

      {mansioneMostrata ? (
        <div className={`text-xs ${stato === 'attivo' ? operatore.colorText : 'text-neutral-600'}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{mansioneMostrata.paziente}</span>
            <span className="font-mono text-[10px] text-neutral-400 shrink-0 ml-2">
              {mansioneMostrata.oraInizio}-{mansioneMostrata.oraFine}
            </span>
          </div>
          {stato === 'prossimo' && (
            <p className="text-[10px] text-neutral-400 mt-0.5">Prossimo alle {mansioneMostrata.oraInizio}</p>
          )}
        </div>
      ) : stato === 'finito' ? (
        <p className="text-[10px] text-green-600 font-medium">✓ {completateOggi} mansioni completate</p>
      ) : (
        <p className="text-[10px] text-neutral-400 italic">Nessuna mansione</p>
      )}
      
      {totaleOggi > 0 && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${stato === 'attivo' ? operatore.color : 'bg-neutral-300'}`}
              style={{ width: `${(completateOggi / totaleOggi) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-neutral-400 font-mono">{completateOggi}/{totaleOggi}</span>
        </div>
      )}
    </motion.div>
  );
}

// --- COMPONENTE PRINCIPALE ---
export default function PlanningWidget({ onNavigate }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 30000);
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

  const totaleMansioniOggi = mansioni.length;
  const completate = mansioni.filter(m => m.completata).length;
  const inCorso = mansioni.filter(m => {
    const start = timeToMinutes(m.oraInizio);
    const end = timeToMinutes(m.oraFine);
    return currentMinutes >= start && currentMinutes < end && !m.completata;
  }).length;

  const formattedDate = selectedDate.toLocaleDateString('it-IT', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  const goToPrev = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goToNext = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToToday = () => setSelectedDate(new Date());

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="text-primary" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">Planning</h3>
            
            {/* Navigazione Data */}
            <div className="flex items-center gap-1 text-[11px]">
              <button 
                onClick={goToPrev}
                className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
              >
                <ChevronLeft size={14} />
              </button>
              
              <button 
                onClick={goToToday}
                className={`capitalize px-1.5 py-0.5 rounded transition-colors ${
                  isToday 
                    ? 'text-primary font-bold' 
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {formattedDate}
              </button>
              
              <button 
                onClick={goToNext}
                className="p-0.5 hover:bg-neutral-100 rounded text-neutral-400 hover:text-neutral-600"
              >
                <ChevronRight size={14} />
              </button>
              
              {isToday && (
                <>
                  <span className="text-neutral-300 mx-1">•</span>
                  <span className="font-mono font-bold text-primary">{currentTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <button 
          onClick={onNavigate}
          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
        >
          Apri <ChevronRight size={14} />
        </button>
      </div>

      {/* Content */}
      {weekend ? (
        <div className="p-6 text-center">
          <Coffee size={32} className="mx-auto mb-2 text-neutral-200" />
          <p className="text-sm font-medium text-neutral-400">Weekend</p>
          <p className="text-[11px] text-neutral-300">Laboratorio chiuso</p>
        </div>
      ) : (
        <>
          {/* Mini Stats */}
          <div className="px-4 py-2 bg-neutral-50 flex items-center justify-around text-center border-b border-neutral-100">
            <div>
              <span className="text-lg font-bold text-neutral-800">{totaleMansioniOggi}</span>
              <p className="text-[9px] text-neutral-400 uppercase">Totali</p>
            </div>
            <div className="w-px h-6 bg-neutral-200" />
            <div>
              <span className="text-lg font-bold text-primary">{isToday ? inCorso : '-'}</span>
              <p className="text-[9px] text-neutral-400 uppercase">In corso</p>
            </div>
            <div className="w-px h-6 bg-neutral-200" />
            <div>
              <span className="text-lg font-bold text-green-600">{completate}</span>
              <p className="text-[9px] text-neutral-400 uppercase">Finite</p>
            </div>
          </div>

          {/* Griglia Operatori 2x2 */}
          <div className="p-3 grid grid-cols-2 gap-2">
            {mansioniPerOperatore.map(({ operatore, mansioni }) => (
              <OperatorCard
                key={operatore.id}
                operatore={operatore}
                mansioni={mansioni}
                currentMinutes={isToday ? currentMinutes : 0}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}