import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Clock, CheckCircle, Coffee } from 'lucide-react';

// --- OPERATORI ---
const OPERATORI = [
  { id: 1, nome: 'Marco', ruolo: 'CAD', color: 'bg-blue-500', colorLight: 'bg-blue-50', colorText: 'text-blue-600' },
  { id: 2, nome: 'Lucia', ruolo: 'Ceramica', color: 'bg-pink-500', colorLight: 'bg-pink-50', colorText: 'text-pink-600' },
  { id: 3, nome: 'Paolo', ruolo: 'Fresatura', color: 'bg-emerald-500', colorLight: 'bg-emerald-50', colorText: 'text-emerald-600' },
  { id: 4, nome: 'Sara', ruolo: 'Rifinitura', color: 'bg-purple-500', colorLight: 'bg-purple-50', colorText: 'text-purple-600' },
];

// --- MOCK MANSIONI OGGI ---
const generateTodayMansioni = () => {
  const now = new Date();
  const day = now.getDay();
  
  // Weekend vuoto
  if (day === 0 || day === 6) return [];
  
  return [
    { id: 1, operatoreId: 1, paziente: 'Rossi M.', fase: 'CAD', oraInizio: '08:30', oraFine: '10:30', completata: true },
    { id: 2, operatoreId: 1, paziente: 'Bianchi L.', fase: 'CAD', oraInizio: '14:00', oraFine: '16:00', completata: false },
    { id: 3, operatoreId: 2, paziente: 'Neri F.', fase: 'Ceramica', oraInizio: '08:00', oraFine: '11:00', completata: true },
    { id: 4, operatoreId: 2, paziente: 'Rossi M.', fase: 'Ceramica', oraInizio: '14:00', oraFine: '17:00', completata: false },
    { id: 5, operatoreId: 3, paziente: 'Rossi M.', fase: 'Fresatura', oraInizio: '11:00', oraFine: '13:00', completata: true },
    { id: 6, operatoreId: 3, paziente: 'Bianchi L.', fase: 'Fresatura', oraInizio: '16:00', oraFine: '17:30', completata: false },
    { id: 7, operatoreId: 4, paziente: 'Neri F.', fase: 'Rifinitura', oraInizio: '14:00', oraFine: '15:30', completata: false },
    { id: 8, operatoreId: 4, paziente: 'Rossi M.', fase: 'Rifinitura', oraInizio: '16:30', oraFine: '17:30', completata: false },
  ];
};

// --- HELPERS ---
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const isWeekend = () => {
  const day = new Date().getDay();
  return day === 0 || day === 6;
};

// --- CARD OPERATORE ---
function OperatorCard({ operatore, mansioni, currentMinutes }) {
  // Trova mansione attuale o prossima
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
  
  // Determina stato
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
      {/* Header operatore */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full ${operatore.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
          {operatore.nome[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-neutral-800 truncate">{operatore.nome}</h4>
          <p className="text-[10px] text-neutral-400">{operatore.ruolo}</p>
        </div>
        
        {/* Badge stato */}
        {stato === 'attivo' && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-white px-1.5 py-0.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            IN CORSO
          </span>
        )}
        {stato === 'finito' && (
          <CheckCircle size={16} className="text-green-500" />
        )}
        {stato === 'libero' && totaleOggi === 0 && (
          <Coffee size={14} className="text-neutral-300" />
        )}
      </div>

      {/* Dettaglio mansione */}
      {mansioneMostrata ? (
        <div className={`text-xs ${stato === 'attivo' ? operatore.colorText : 'text-neutral-600'}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium truncate">{mansioneMostrata.paziente}</span>
            <span className="font-mono text-[10px] text-neutral-400 shrink-0 ml-2">
              {mansioneMostrata.oraInizio}-{mansioneMostrata.oraFine}
            </span>
          </div>
          {stato === 'prossimo' && (
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Prossimo alle {mansioneMostrata.oraInizio}
            </p>
          )}
        </div>
      ) : stato === 'finito' ? (
        <p className="text-[10px] text-green-600 font-medium">
          ✓ {completateOggi} mansioni completate
        </p>
      ) : (
        <p className="text-[10px] text-neutral-400 italic">
          Nessuna mansione oggi
        </p>
      )}
      
      {/* Mini progress */}
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
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [mansioni, setMansioni] = useState([]);

  useEffect(() => {
    setMansioni(generateTodayMansioni());
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMinutes = timeToMinutes(currentTime);
  const weekend = isWeekend();

  // Raggruppa mansioni per operatore
  const mansioniPerOperatore = useMemo(() => {
    return OPERATORI.map(op => ({
      operatore: op,
      mansioni: mansioni.filter(m => m.operatoreId === op.id)
    }));
  }, [mansioni]);

  // Stats
  const totaleMansioniOggi = mansioni.length;
  const completate = mansioni.filter(m => m.completata).length;
  const inCorso = mansioni.filter(m => {
    const start = timeToMinutes(m.oraInizio);
    const end = timeToMinutes(m.oraFine);
    return currentMinutes >= start && currentMinutes < end && !m.completata;
  }).length;

  const today = new Date().toLocaleDateString('it-IT', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short' 
  });

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="text-primary" size={18} />
          </div>
          <div>
            <h3 className="font-bold text-neutral-800 text-sm">Planning Oggi</h3>
            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
              <span className="capitalize">{today}</span>
              <span className="text-neutral-300">•</span>
              <span className="font-mono font-bold text-primary">{currentTime}</span>
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
              <span className="text-lg font-bold text-primary">{inCorso}</span>
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
                currentMinutes={currentMinutes}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}