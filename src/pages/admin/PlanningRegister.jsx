import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  GripVertical, Truck, AlertCircle, Flag,
  X, Check, MoreVertical, List, Users
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// --- OPERATORI DISPONIBILI ---
const OPERATORI = [
  { id: 1, nome: 'Marco', ruolo: 'CAD', color: 'bg-blue-500', colorLight: 'bg-blue-100', colorBorder: 'border-blue-300', colorText: 'text-blue-700' },
  { id: 2, nome: 'Lucia', ruolo: 'Ceramica', color: 'bg-pink-500', colorLight: 'bg-pink-100', colorBorder: 'border-pink-300', colorText: 'text-pink-700' },
  { id: 3, nome: 'Paolo', ruolo: 'Fresatura', color: 'bg-emerald-500', colorLight: 'bg-emerald-100', colorBorder: 'border-emerald-300', colorText: 'text-emerald-700' },
  { id: 4, nome: 'Sara', ruolo: 'Rifinitura', color: 'bg-purple-500', colorLight: 'bg-purple-100', colorBorder: 'border-purple-300', colorText: 'text-purple-700' },
];

// --- TIPI DI FASE (senza Controllo QC) ---
const FASI = [
  { id: 'cad', nome: 'CAD', icon: '🖥️' },
  { id: 'fresatura', nome: 'Fresatura', icon: '⚙️' },
  { id: 'ceramica', nome: 'Ceramica', icon: '🎨' },
  { id: 'rifinitura', nome: 'Rifinitura', icon: '✨' },
];

// --- DATABASE LAVORAZIONI ---
const LAVORAZIONI_DB = [
  {
    id: 'REQ-001',
    paziente: 'Rossi Mario',
    tipo: 'Corona',
    elementi: '24',
    materiale: 'Zirconio',
    dataConsegna: '2025-12-17',
    dataTryIn: '2025-12-16',
    urgente: true,
    progress: 65,
  },
  {
    id: 'REQ-002',
    paziente: 'Bianchi Laura',
    tipo: 'Ponte',
    elementi: '14-16',
    materiale: 'Disilicato',
    dataConsegna: '2025-12-19',
    dataTryIn: null,
    urgente: false,
    progress: 40,
  },
  {
    id: 'REQ-003',
    paziente: 'Verdi Giuseppe',
    tipo: 'Impianto',
    elementi: '36',
    materiale: 'Titanio + Zirconio',
    dataConsegna: '2025-12-22',
    dataTryIn: '2025-12-20',
    urgente: false,
    progress: 20,
  },
  {
    id: 'REQ-004',
    paziente: 'Neri Francesca',
    tipo: 'Faccette',
    elementi: '11-21',
    materiale: 'Disilicato',
    dataConsegna: '2025-12-16',
    dataTryIn: null,
    urgente: true,
    progress: 80,
  },
  {
    id: 'REQ-005',
    paziente: 'Gialli Antonio',
    tipo: 'Provvisorio',
    elementi: '35-37',
    materiale: 'PMMA',
    dataConsegna: '2025-12-15',
    dataTryIn: null,
    urgente: true,
    progress: 50,
  },
  {
    id: 'REQ-006',
    paziente: 'Blu Marco',
    tipo: 'Corona',
    elementi: '46',
    materiale: 'Zirconio',
    dataConsegna: '2025-12-20',
    dataTryIn: '2025-12-18',
    urgente: false,
    progress: 10,
  },
];

// --- GENERA MANSIONI PER DATA (SENZA OVERLAP PER OPERATORE) ---
const generateMansioniForDate = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  if (dayOfWeek === 0 || dayOfWeek === 6) return [];
  
  const seed = date.getDate() + date.getMonth() * 31;
  
  // Pool di mansioni NON SOVRAPPOSTE per ogni operatore
  const mansioniPool = {
    1: [
      [
        { lavorazioneId: 'REQ-001', fase: 'cad', oraInizio: '08:30', oraFine: '10:30' },
        { lavorazioneId: 'REQ-002', fase: 'cad', oraInizio: '11:00', oraFine: '13:00' },
        { lavorazioneId: 'REQ-003', fase: 'cad', oraInizio: '14:00', oraFine: '16:30' },
      ],
      [
        { lavorazioneId: 'REQ-004', fase: 'cad', oraInizio: '08:00', oraFine: '10:00' },
        { lavorazioneId: 'REQ-006', fase: 'cad', oraInizio: '10:30', oraFine: '12:30' },
        { lavorazioneId: 'REQ-005', fase: 'cad', oraInizio: '14:30', oraFine: '17:00' },
      ],
      [
        { lavorazioneId: 'REQ-002', fase: 'cad', oraInizio: '09:00', oraFine: '12:00' },
        { lavorazioneId: 'REQ-001', fase: 'cad', oraInizio: '14:00', oraFine: '17:30' },
      ],
    ],
    2: [
      [
        { lavorazioneId: 'REQ-004', fase: 'ceramica', oraInizio: '08:00', oraFine: '11:00' },
        { lavorazioneId: 'REQ-001', fase: 'ceramica', oraInizio: '14:00', oraFine: '17:00' },
      ],
      [
        { lavorazioneId: 'REQ-002', fase: 'ceramica', oraInizio: '09:00', oraFine: '12:30' },
        { lavorazioneId: 'REQ-003', fase: 'ceramica', oraInizio: '14:00', oraFine: '16:30' },
      ],
      [
        { lavorazioneId: 'REQ-006', fase: 'ceramica', oraInizio: '08:30', oraFine: '11:30' },
        { lavorazioneId: 'REQ-005', fase: 'ceramica', oraInizio: '13:00', oraFine: '15:00' },
        { lavorazioneId: 'REQ-001', fase: 'ceramica', oraInizio: '15:30', oraFine: '17:30' },
      ],
    ],
    3: [
      [
        { lavorazioneId: 'REQ-001', fase: 'fresatura', oraInizio: '08:00', oraFine: '10:00' },
        { lavorazioneId: 'REQ-002', fase: 'fresatura', oraInizio: '10:30', oraFine: '12:30' },
        { lavorazioneId: 'REQ-005', fase: 'fresatura', oraInizio: '14:00', oraFine: '16:00' },
      ],
      [
        { lavorazioneId: 'REQ-003', fase: 'fresatura', oraInizio: '08:30', oraFine: '11:00' },
        { lavorazioneId: 'REQ-004', fase: 'fresatura', oraInizio: '14:00', oraFine: '16:30' },
      ],
      [
        { lavorazioneId: 'REQ-006', fase: 'fresatura', oraInizio: '09:00', oraFine: '11:00' },
        { lavorazioneId: 'REQ-002', fase: 'fresatura', oraInizio: '11:30', oraFine: '13:00' },
        { lavorazioneId: 'REQ-001', fase: 'fresatura', oraInizio: '15:00', oraFine: '17:30' },
      ],
    ],
    4: [
      [
        { lavorazioneId: 'REQ-004', fase: 'rifinitura', oraInizio: '09:00', oraFine: '11:00' },
        { lavorazioneId: 'REQ-001', fase: 'rifinitura', oraInizio: '14:00', oraFine: '16:00' },
      ],
      [
        { lavorazioneId: 'REQ-002', fase: 'rifinitura', oraInizio: '08:30', oraFine: '10:30' },
        { lavorazioneId: 'REQ-005', fase: 'rifinitura', oraInizio: '11:00', oraFine: '13:00' },
        { lavorazioneId: 'REQ-003', fase: 'rifinitura', oraInizio: '15:00', oraFine: '17:00' },
      ],
      [
        { lavorazioneId: 'REQ-006', fase: 'rifinitura', oraInizio: '10:00', oraFine: '12:00' },
        { lavorazioneId: 'REQ-001', fase: 'rifinitura', oraInizio: '14:30', oraFine: '17:30' },
      ],
    ],
  };
  
  const result = [];
  let idCounter = 1;
  
  OPERATORI.forEach(op => {
    const pool = mansioniPool[op.id];
    const selectedSetIndex = (seed + op.id) % pool.length;
    const selectedSet = pool[selectedSetIndex];
    
    selectedSet.forEach((m, idx) => {
      const startMinutes = timeToMinutes(m.oraInizio);
      const currentMinutes = timeToMinutes(getCurrentTime());
      const isInPast = startMinutes + 90 < currentMinutes;
      
      result.push({
        ...m,
        id: `${dateStr}-m${idCounter++}`,
        operatoreId: op.id,
        data: dateStr,
        completata: isInPast && (seed + idx) % 3 !== 0,
      });
    });
  });
  
  return result;
};

// --- HELPERS ---
const timeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const getCurrentTime = () => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

const formatDateFull = (date) => {
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatDateISO = (date) => {
  return date.toISOString().split('T')[0];
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr);
  target.setHours(0,0,0,0);
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Timeline config
const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_WIDTH = 80;
const HOUR_HEIGHT = 60;
const TIMELINE_WIDTH = (END_HOUR - START_HOUR) * HOUR_WIDTH;

// ============================================================================
// COMPONENTE: BLOCCO MANSIONE (per vista Lavorazioni)
// ============================================================================
function MansionBlockRow({ mansione, operatore, onEdit }) {
  const fase = FASI.find(f => f.id === mansione.fase);
  const startMinutes = timeToMinutes(mansione.oraInizio);
  const endMinutes = timeToMinutes(mansione.oraFine);
  const left = ((startMinutes - START_HOUR * 60) / 60) * HOUR_WIDTH;
  const width = ((endMinutes - startMinutes) / 60) * HOUR_WIDTH - 4;
  
  const currentMinutes = timeToMinutes(getCurrentTime());
  const isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute top-1 bottom-1 rounded-lg border-2 cursor-pointer
        ${operatore.colorLight} ${operatore.colorBorder}
        ${mansione.completata ? 'opacity-50' : ''}
        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
        hover:shadow-lg transition-all group
      `}
      style={{ left: `${left}px`, width: `${width}px` }}
      onClick={() => onEdit(mansione)}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 cursor-grab">
        <GripVertical size={12} />
      </div>
      
      <div className="px-2 py-1 h-full flex flex-col justify-center overflow-hidden">
        <div className="flex items-center gap-1">
          <span className="text-xs">{fase?.icon}</span>
          <span className={`text-[11px] font-bold ${operatore.colorText} truncate`}>
            {fase?.nome}
          </span>
          {mansione.completata && <Check size={12} className="text-green-600 shrink-0" />}
          {isActive && !mansione.completata && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
        </div>
        
        {width > 70 && (
          <div className="flex items-center gap-1 mt-0.5">
            <div className={`w-4 h-4 rounded-full ${operatore.color} flex items-center justify-center shrink-0`}>
              <span className="text-[8px] text-white font-bold">{operatore.nome[0]}</span>
            </div>
            <span className="text-[9px] text-neutral-500 truncate">{operatore.nome}</span>
          </div>
        )}
        
        {width > 90 && (
          <span className="text-[9px] font-mono text-neutral-400 mt-0.5">
            {mansione.oraInizio}-{mansione.oraFine}
          </span>
        )}
      </div>
      
      <button className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/50 rounded">
        <MoreVertical size={12} className="text-neutral-400" />
      </button>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE: RIGA LAVORAZIONE (Vista Lavorazioni)
// ============================================================================
function LavorazioneRow({ lavorazione, mansioni, onEditMansione, showCurrentLine, currentLineLeft, selectedDateStr }) {
  const daysUntil = getDaysUntil(lavorazione.dataConsegna);
  const isOverdue = daysUntil < 0;
  const isUrgent = daysUntil <= 2;
  
  const isDeliveryDay = lavorazione.dataConsegna === selectedDateStr;
  const isTryInDay = lavorazione.dataTryIn === selectedDateStr;
  
  // Se è giorno di consegna finale, progress = 100%
  const displayProgress = isDeliveryDay ? 100 : lavorazione.progress;
  
  return (
    <div className="flex border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
      {/* Info Lavorazione */}
      <div className="w-64 shrink-0 p-3 border-r border-neutral-200 bg-white sticky left-0 z-10">
        <div className="flex items-start gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
            ${lavorazione.urgente ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'}
          `}>
            {lavorazione.paziente.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-neutral-800 truncate">{lavorazione.paziente}</h4>
              {lavorazione.urgente && <AlertCircle size={14} className="text-red-500 shrink-0" />}
            </div>
            
            <p className="text-[10px] text-neutral-500 truncate">
              {lavorazione.tipo} • {lavorazione.elementi} • {lavorazione.materiale}
            </p>
            
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-[9px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                {lavorazione.id}
              </span>
              <div className={`
                flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded
                ${isDeliveryDay ? 'bg-green-500 text-white' :
                  isOverdue ? 'bg-red-100 text-red-700' : 
                  isUrgent ? 'bg-orange-100 text-orange-700' : 
                  'bg-green-100 text-green-700'}
              `}>
                <Truck size={10} />
                {isDeliveryDay ? 'CONSEGNA' : isOverdue ? 'SCADUTO' : `${daysUntil}g`}
              </div>
              {isTryInDay && (
                <div className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-orange-700">
                  <Flag size={10} />
                  PROVA
                </div>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    displayProgress >= 100 ? 'bg-green-500' : 
                    displayProgress >= 80 ? 'bg-green-400' : 'bg-primary'
                  }`}
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <span className="text-[9px] font-bold text-neutral-500">{displayProgress}%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="flex-1 relative h-20" style={{ minWidth: `${TIMELINE_WIDTH}px` }}>
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
          <div key={i} className="absolute top-0 bottom-0 border-l border-neutral-100" style={{ left: `${i * HOUR_WIDTH}px` }} />
        ))}
        
        {mansioni.map(mansione => {
          const operatore = OPERATORI.find(o => o.id === mansione.operatoreId);
          return (
            <MansionBlockRow
              key={mansione.id}
              mansione={mansione}
              operatore={operatore}
              onEdit={onEditMansione}
            />
          );
        })}
        
        {showCurrentLine && (
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none" style={{ left: `${currentLineLeft}px` }}>
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: BLOCCO MANSIONE (per vista Operatori)
// ============================================================================
function MansionBlockColumn({ mansione, lavorazione, onEdit }) {
  const fase = FASI.find(f => f.id === mansione.fase);
  const startMinutes = timeToMinutes(mansione.oraInizio);
  const endMinutes = timeToMinutes(mansione.oraFine);
  const top = ((startMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT - 4;
  
  const currentMinutes = timeToMinutes(getCurrentTime());
  const isActive = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  
  const operatore = OPERATORI.find(o => o.id === mansione.operatoreId);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute left-1 right-1 rounded-lg border ${operatore.colorLight} ${operatore.colorBorder}
        ${mansione.completata ? 'opacity-50' : ''}
        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
        cursor-pointer hover:shadow-md transition-all group overflow-hidden
      `}
      style={{ top: `${top}px`, height: `${height}px` }}
      onClick={() => onEdit(mansione)}
    >
      <div className="p-2 h-full flex flex-col">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs">{fase?.icon}</span>
          <span className={`text-[10px] font-bold ${operatore.colorText} truncate`}>{fase?.nome}</span>
          {mansione.completata && <Check size={10} className="text-green-600" />}
          {isActive && !mansione.completata && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        </div>
        
        {height > 45 && (
          <p className="text-[9px] text-neutral-700 font-medium truncate">{lavorazione?.paziente}</p>
        )}
        
        {height > 60 && (
          <p className="text-[8px] text-neutral-400 truncate">{lavorazione?.tipo} • {lavorazione?.id}</p>
        )}
        
        {height > 80 && (
          <span className="text-[8px] font-mono text-neutral-400 mt-auto">
            {mansione.oraInizio}-{mansione.oraFine}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE: COLONNA OPERATORE (Vista Operatori)
// ============================================================================
function OperatorColumn({ operatore, mansioni, lavorazioniMap, onEditMansione, showCurrentLine, currentLineTop }) {
  return (
    <div className="flex-1 min-w-[160px] border-r border-neutral-100 last:border-r-0 relative">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 p-3 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${operatore.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
          {operatore.nome[0]}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-neutral-800 truncate">{operatore.nome}</h4>
          <p className="text-[10px] text-neutral-400">{operatore.ruolo}</p>
        </div>
      </div>

      <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
          <div key={i} className="absolute left-0 right-0 border-t border-neutral-100" style={{ top: `${i * HOUR_HEIGHT}px` }} />
        ))}

        {mansioni.map(mansione => (
          <MansionBlockColumn
            key={mansione.id}
            mansione={mansione}
            lavorazione={lavorazioniMap[mansione.lavorazioneId]}
            onEdit={onEditMansione}
          />
        ))}

        {showCurrentLine && (
          <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${currentLineTop}px` }}>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="flex-1 h-0.5 bg-red-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: MODAL EDIT MANSIONE
// ============================================================================
function EditMansioneModal({ mansione, lavorazione, onClose, onSave }) {
  const [formData, setFormData] = useState({
    operatoreId: mansione.operatoreId,
    oraInizio: mansione.oraInizio || '',
    oraFine: mansione.oraFine || '',
    completata: mansione.completata
  });
  
  const fase = FASI.find(f => f.id === mansione.fase);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-neutral-800">Modifica Mansione</h3>
            <p className="text-sm text-neutral-500">{fase?.icon} {fase?.nome} • {lavorazione?.paziente}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Operatore</label>
            <div className="grid grid-cols-2 gap-2">
              {OPERATORI.map(op => (
                <button
                  key={op.id}
                  onClick={() => setFormData({ ...formData, operatoreId: op.id })}
                  className={`p-3 rounded-xl border-2 flex items-center gap-2 transition-all
                    ${formData.operatoreId === op.id ? `${op.colorLight} ${op.colorBorder}` : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full ${op.color} flex items-center justify-center text-white font-bold text-sm`}>
                    {op.nome[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{op.nome}</p>
                    <p className="text-[10px] text-neutral-400">{op.ruolo}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Ora Inizio</label>
              <input
                type="time"
                value={formData.oraInizio}
                onChange={e => setFormData({ ...formData, oraInizio: e.target.value })}
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Ora Fine</label>
              <input
                type="time"
                value={formData.oraFine}
                onChange={e => setFormData({ ...formData, oraFine: e.target.value })}
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          
          <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={formData.completata}
              onChange={e => setFormData({ ...formData, completata: e.target.checked })}
              className="w-5 h-5 rounded border-neutral-300 text-primary focus:ring-primary"
            />
            <span className="font-medium text-neutral-700">Segna come completata</span>
          </label>
        </div>
        
        <div className="p-5 border-t border-neutral-100 flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button onClick={() => { onSave(formData); onClose(); }}>Salva</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPALE
// ============================================================================
export default function PlanningRegister() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [viewMode, setViewMode] = useState('lavorazioni');
  const [editingMansione, setEditingMansione] = useState(null);
  
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(getCurrentTime()), 60000);
    return () => clearInterval(interval);
  }, []);

  const dateStr = formatDateISO(selectedDate);
  const mansioni = useMemo(() => generateMansioniForDate(dateStr), [dateStr]);
  
  const lavorazioniMap = useMemo(() => {
    const map = {};
    LAVORAZIONI_DB.forEach(l => { map[l.id] = l; });
    return map;
  }, []);
  
  const lavorazioniOggi = useMemo(() => {
    const lavorazioniIds = [...new Set(mansioni.map(m => m.lavorazioneId))];
    return lavorazioniIds.map(id => ({
      ...lavorazioniMap[id],
      mansioniOggi: mansioni.filter(m => m.lavorazioneId === id)
    })).filter(l => l.id);
  }, [mansioni, lavorazioniMap]);
  
  const mansioniPerOperatore = useMemo(() => {
    return OPERATORI.map(op => ({
      operatore: op,
      mansioni: mansioni.filter(m => m.operatoreId === op.id).sort((a, b) => timeToMinutes(a.oraInizio) - timeToMinutes(b.oraInizio))
    }));
  }, [mansioni]);

  const currentMinutes = timeToMinutes(currentTime);
  const isToday = formatDateISO(new Date()) === dateStr;
  const showCurrentLine = isToday && currentMinutes >= START_HOUR * 60 && currentMinutes <= END_HOUR * 60;
  const currentLineLeft = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_WIDTH;
  const currentLineTop = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

  const goToPrevDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const goToNextDay = () => setSelectedDate(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const goToToday = () => setSelectedDate(new Date());

  const handleEditMansione = (mansione) => setEditingMansione(mansione);
  const handleSaveMansione = (formData) => console.log('Salvataggio:', formData);

  const weekend = isWeekend(selectedDate);

  return (
    <div className="p-6 max-w-full mx-auto min-h-screen space-y-4">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-800 flex items-center gap-2">
          <Calendar className="text-primary" size={28} />
          Planning Register
        </h1>
        <p className="text-neutral-500 text-sm">Pianificazione lavorazioni e mansioni</p>
      </div>

      {/* TOOLBAR */}
      <Card className="!p-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          
          {/* Navigazione Data */}
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[240px]">
              <h2 className="font-bold text-neutral-800 capitalize">{formatDateFull(selectedDate)}</h2>
              {isToday && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Oggi</span>}
              {weekend && <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-bold ml-1">Weekend</span>}
            </div>
            <button onClick={goToNextDay} className="p-2 hover:bg-neutral-100 rounded-lg">
              <ChevronRight size={20} />
            </button>
            {!isToday && (
              <button onClick={goToToday} className="ml-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
                Oggi
              </button>
            )}
          </div>

          {/* Ora Corrente */}
          <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg">
            <Clock size={16} className="text-primary" />
            <span className="font-mono font-bold text-neutral-800">{currentTime}</span>
          </div>

          {/* Switch Vista */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg">
            <button
              onClick={() => setViewMode('lavorazioni')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${viewMode === 'lavorazioni' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              <List size={16} />
              Lavorazioni
            </button>
            <button
              onClick={() => setViewMode('operatori')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${viewMode === 'operatori' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              <Users size={16} />
              Operatori
            </button>
          </div>
        </div>
      </Card>

      {/* CONTENUTO */}
      {weekend ? (
        <Card className="!p-12 text-center">
          <Calendar size={64} className="mx-auto mb-4 text-neutral-200" />
          <h3 className="text-xl font-bold text-neutral-400 mb-2">Laboratorio Chiuso</h3>
          <p className="text-neutral-400">Nessuna attività programmata nel weekend</p>
          <button onClick={goToNextDay} className="mt-4 px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20">
            Vai a Lunedì →
          </button>
        </Card>
      ) : viewMode === 'lavorazioni' ? (
        <Card className="!p-0 overflow-hidden">
          <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-20">
            <div className="w-64 shrink-0 p-3 border-r border-neutral-200">
              <span className="text-xs font-bold text-neutral-400 uppercase">
                Lavorazioni ({lavorazioniOggi.length})
              </span>
            </div>
            <div className="flex-1 flex relative" style={{ minWidth: `${TIMELINE_WIDTH}px` }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <div key={i} className="border-l border-neutral-200 text-center py-2" style={{ width: `${HOUR_WIDTH}px` }}>
                  <span className="text-xs font-mono text-neutral-500">{(START_HOUR + i).toString().padStart(2, '0')}:00</span>
                </div>
              ))}
              {showCurrentLine && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30" style={{ left: `${currentLineLeft}px` }}>
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500" />
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {lavorazioniOggi.length > 0 ? (
              lavorazioniOggi.map(lav => (
                <LavorazioneRow
                  key={lav.id}
                  lavorazione={lav}
                  mansioni={lav.mansioniOggi}
                  onEditMansione={handleEditMansione}
                  showCurrentLine={showCurrentLine}
                  currentLineLeft={currentLineLeft}
                  selectedDateStr={dateStr}
                />
              ))
            ) : (
              <div className="p-12 text-center text-neutral-400">
                <Calendar size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Nessuna lavorazione per oggi</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="flex overflow-x-auto">
            <div className="w-16 shrink-0 border-r border-neutral-200 bg-neutral-50">
              <div className="h-[52px] border-b border-neutral-200" />
              <div className="relative" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
                {Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => (
                  <div key={i} className="absolute left-0 right-0 flex items-start justify-end pr-2 text-[10px] font-mono text-neutral-400" style={{ top: `${i * HOUR_HEIGHT - 6}px` }}>
                    {(START_HOUR + i).toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            {mansioniPerOperatore.map(({ operatore, mansioni }) => (
              <OperatorColumn
                key={operatore.id}
                operatore={operatore}
                mansioni={mansioni}
                lavorazioniMap={lavorazioniMap}
                onEditMansione={handleEditMansione}
                showCurrentLine={showCurrentLine}
                currentLineTop={currentLineTop}
              />
            ))}
          </div>

          {mansioni.length === 0 && (
            <div className="p-12 text-center text-neutral-400 border-t">
              <Calendar size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Nessuna mansione per oggi</p>
            </div>
          )}
        </Card>
      )}

      {/* LEGENDA */}
      <div className="flex flex-wrap items-center gap-6 justify-center">
        <span className="text-xs text-neutral-400 uppercase font-bold">Operatori:</span>
        {OPERATORI.map(op => (
          <div key={op.id} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${op.color}`} />
            <span className="text-sm text-neutral-600">{op.nome}</span>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {editingMansione && (
          <EditMansioneModal
            mansione={editingMansione}
            lavorazione={lavorazioniMap[editingMansione.lavorazioneId]}
            onClose={() => setEditingMansione(null)}
            onSave={handleSaveMansione}
          />
        )}
      </AnimatePresence>
    </div>
  );
}