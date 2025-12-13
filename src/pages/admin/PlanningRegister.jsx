import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Calendar, Clock, 
  GripVertical, Truck, AlertCircle, Flag,
  X, Check, MoreVertical, List, Users, CheckCircle2, MessageSquare
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

// --- TIPI DI FASE ---
const FASI = [
  { id: 'cad', nome: 'CAD', icon: '🖥️' },
  { id: 'fresatura', nome: 'Fresatura', icon: '⚙️' },
  { id: 'ceramica', nome: 'Ceramica', icon: '🎨' },
  { id: 'rifinitura', nome: 'Rifinitura', icon: '✨' },
];

// --- NOTE DI COMPLETAMENTO (15 VARIANTI) ---
const COMPLETION_NOTES = [
  "Esecuzione perfetta, nessun difetto.",
  "Materiale leggermente poroso, corretto.",
  "Adattamento marginale eccellente.",
  "Rifatto bordi per imprecisione scansione.",
  "Colore A2 centrato perfettamente.",
  "Sinterizzazione completata con successo.",
  "Piccola bolla rimossa in rifinitura.",
  "Lucidatura a specchio richiesta dal dr.",
  "Punto di contatto mesiale stretto.",
  "Occlusione leggermente alta, ritoccata.",
  "Materiale scartato per impurità.",
  "Fresa usurata durante il processo.",
  "Tempi rispettati, estetica top.",
  "Necessaria ripassata al colletto.",
  "Struttura verificata al microscopio: OK."
];

// --- DATABASE LAVORAZIONI ---
const LAVORAZIONI_DB = [
  { id: 'REQ-001', paziente: 'Rossi Mario', tipo: 'Corona', elementi: '24', materiale: 'Zirconio', dataConsegna: '2025-12-17', dataTryIn: '2025-12-16', urgente: true, progress: 65 },
  { id: 'REQ-002', paziente: 'Bianchi Laura', tipo: 'Ponte', elementi: '14-16', materiale: 'Disilicato', dataConsegna: '2025-12-19', dataTryIn: null, urgente: false, progress: 40 },
  { id: 'REQ-003', paziente: 'Verdi Giuseppe', tipo: 'Impianto', elementi: '36', materiale: 'Titanio', dataConsegna: '2025-12-22', dataTryIn: '2025-12-20', urgente: false, progress: 20 },
  { id: 'REQ-004', paziente: 'Neri Francesca', tipo: 'Faccette', elementi: '11-21', materiale: 'Ceramica', dataConsegna: '2025-12-16', dataTryIn: null, urgente: true, progress: 80 },
  { id: 'REQ-005', paziente: 'Gialli Antonio', tipo: 'Provvisorio', elementi: '35-37', materiale: 'PMMA', dataConsegna: '2025-12-15', dataTryIn: null, urgente: true, progress: 50 },
  { id: 'REQ-006', paziente: 'Blu Marco', tipo: 'Corona', elementi: '46', materiale: 'Zirconio', dataConsegna: '2025-12-20', dataTryIn: '2025-12-18', urgente: false, progress: 10 },
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
const HOUR_WIDTH = 100; // Allargato per leggibilità
const HOUR_HEIGHT = 80; // Aumentato altezza
const TIMELINE_WIDTH = (END_HOUR - START_HOUR) * HOUR_WIDTH;

// --- GENERATORE MANSIONI (CORRETTO SEQUENZIALE) ---
const generateMansioniForDate = (dateStr) => {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return []; // Weekend vuoto

  const seed = date.getDate() + date.getMonth() * 31;
  const result = [];
  let idCounter = 1;

  // Definiamo un flusso di lavoro ideale per ogni lavorazione
  // Mappiamo le lavorazioni a orari e operatori in modo che non si sovrappongano PER LAVORAZIONE
  // Esempio: REQ-001 -> CAD (08:30-10:30) -> Fresatura (11:00-13:00) -> Ceramica (14:00-16:00)
  
  // Per semplicità di demo, creo uno schedule fisso ma valido logicamente
  const scheduleTemplates = [
    // Template 1: Flusso Standard
    [
      { req: 'REQ-001', op: 1, fase: 'cad', start: '08:30', end: '10:00' },
      { req: 'REQ-001', op: 3, fase: 'fresatura', start: '10:30', end: '12:30' },
      { req: 'REQ-001', op: 2, fase: 'ceramica', start: '14:00', end: '16:00' },
      
      { req: 'REQ-002', op: 1, fase: 'cad', start: '10:30', end: '12:00' },
      { req: 'REQ-002', op: 3, fase: 'fresatura', start: '14:00', end: '15:30' },
      
      { req: 'REQ-003', op: 4, fase: 'rifinitura', start: '16:00', end: '17:30' }
    ],
    // Template 2: Flusso Alternativo
    [
      { req: 'REQ-004', op: 1, fase: 'cad', start: '08:00', end: '09:30' },
      { req: 'REQ-004', op: 3, fase: 'fresatura', start: '10:00', end: '11:30' },
      { req: 'REQ-004', op: 2, fase: 'ceramica', start: '12:00', end: '14:00' },
      { req: 'REQ-004', op: 4, fase: 'rifinitura', start: '14:30', end: '15:30' },

      { req: 'REQ-005', op: 1, fase: 'cad', start: '14:00', end: '15:30' },
      { req: 'REQ-006', op: 2, fase: 'ceramica', start: '09:00', end: '11:00' }
    ]
  ];

  const dailySchedule = scheduleTemplates[seed % scheduleTemplates.length];
  const currentMinutes = timeToMinutes(getCurrentTime());
  const isToday = formatDateISO(new Date()) === dateStr;

  dailySchedule.forEach((task, idx) => {
    const startMinutes = timeToMinutes(task.start);
    const endMinutes = timeToMinutes(task.end);
    
    // Determina se completata: se oggi ed è passato l'orario di fine, o se data passata
    let isCompleted = false;
    const now = new Date();
    const taskDate = new Date(dateStr);
    
    if (taskDate < new Date(formatDateISO(now))) {
       isCompleted = true; // Giorni passati
    } else if (isToday && currentMinutes > endMinutes) {
       isCompleted = true; // Oggi ma orario passato
    }

    // Assegna nota random se completata
    const noteIndex = (seed + idx + task.req.charCodeAt(4)) % COMPLETION_NOTES.length;
    const completionNote = isCompleted ? COMPLETION_NOTES[noteIndex] : null;

    result.push({
      id: `${dateStr}-m${idCounter++}`,
      lavorazioneId: task.req,
      operatoreId: task.op,
      fase: task.fase,
      oraInizio: task.start,
      oraFine: task.end,
      data: dateStr,
      completata: isCompleted,
      note: completionNote
    });
  });

  return result;
};

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
  const isCompleted = mansione.completata;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute top-2 bottom-2 rounded-lg border-2 px-2 py-1 flex flex-col justify-center overflow-hidden cursor-pointer hover:shadow-lg transition-all group
        ${isCompleted 
            ? 'bg-neutral-50 border-neutral-200 text-neutral-500 opacity-80' 
            : `${operatore.colorLight} ${operatore.colorBorder} ${operatore.colorText}`
        }
        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
      `}
      style={{ left: `${left}px`, width: `${width}px` }}
      onClick={() => onEdit(mansione)}
    >
      <div className="flex items-center gap-1">
        <span className="font-bold text-[10px] uppercase truncate">{fase?.nome}</span>
        {isCompleted && <CheckCircle2 size={10} className="text-green-600 shrink-0" />}
        {isActive && !isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />}
      </div>
      
      <div className="flex items-center gap-1 mt-1">
        <div className={`w-3 h-3 rounded-full text-[8px] flex items-center justify-center text-white shrink-0 ${isCompleted ? 'bg-neutral-400' : operatore.color}`}>
            {operatore.nome[0]}
        </div>
        {width > 60 && <span className="text-[9px] font-bold truncate">{operatore.nome}</span>}
      </div>

      {isCompleted && width > 100 && (
         <div className="text-[8px] italic mt-1 truncate border-t border-neutral-200 pt-0.5 opacity-70">
            "{mansione.note}"
         </div>
      )}
    </motion.div>
  );
}

// ============================================================================
// COMPONENTE: RIGA LAVORAZIONE (Vista Lavorazioni)
// ============================================================================
function LavorazioneRow({ lavorazione, mansioni, onEditMansione, showCurrentLine, currentLineLeft, selectedDateStr }) {
  const daysUntil = getDaysUntil(lavorazione.dataConsegna);
  const isOverdue = daysUntil < 0;
  const isDeliveryDay = lavorazione.dataConsegna === selectedDateStr;
  const displayProgress = isDeliveryDay ? 100 : lavorazione.progress;
  
  return (
    <div className="flex border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors h-24">
      {/* Info Lavorazione */}
      <div className="w-64 shrink-0 p-3 border-r border-neutral-200 bg-white sticky left-0 z-10 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-1">
            <h4 className="font-bold text-sm text-neutral-800 truncate pr-2">{lavorazione.paziente}</h4>
            <span className="text-[9px] font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500">{lavorazione.id}</span>
        </div>
        <p className="text-[10px] text-neutral-500 mb-2 truncate">{lavorazione.tipo} • {lavorazione.elementi}</p>
        
        <div className="flex items-center gap-2 mb-2">
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                {isOverdue ? 'SCADUTO' : `${daysUntil} gg`}
            </span>
            {lavorazione.urgente && <AlertCircle size={12} className="text-red-500"/>}
        </div>

        <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full ${displayProgress >= 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${displayProgress}%` }} />
        </div>
      </div>
      
      {/* Timeline */}
      <div className="flex-1 relative" style={{ minWidth: `${TIMELINE_WIDTH}px` }}>
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
          <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ left: `${currentLineLeft}px` }}>
            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: BLOCCO MANSIONE (per vista Operatori - Style Teams)
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
  const isCompleted = mansione.completata;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute left-1 right-1 rounded-lg border shadow-sm cursor-pointer overflow-hidden group transition-all
        ${isCompleted 
            ? 'bg-neutral-100 border-neutral-200 opacity-90' // Stile completato
            : `${operatore.colorLight} ${operatore.colorBorder} hover:shadow-md` // Stile attivo/futuro
        }
        ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
      `}
      style={{ top: `${top}px`, height: `${height}px` }}
      onClick={() => onEdit(mansione)}
    >
      {/* Barra laterale colorata */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isCompleted ? 'bg-neutral-400' : operatore.color.replace('bg-', 'bg-')}`}></div>

      <div className="p-2 h-full flex flex-col pl-3">
        <div className="flex justify-between items-start">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-neutral-500' : operatore.colorText}`}>
                {fase?.nome}
            </span>
            {isCompleted && <CheckCircle2 size={12} className="text-green-600" />}
            {isActive && !isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
        </div>
        
        <p className={`text-xs font-bold truncate mt-0.5 ${isCompleted ? 'text-neutral-600' : 'text-neutral-800'}`}>
            {lavorazione?.paziente}
        </p>
        <p className="text-[9px] text-neutral-400 font-mono mb-1">
            {lavorazione?.id} • {mansione.oraInizio}-{mansione.oraFine}
        </p>

        {/* NOTA DI ESITO (Solo se completata) */}
        {isCompleted && height > 60 && (
            <div className="mt-auto pt-1 border-t border-neutral-200/50 flex gap-1 items-start text-[9px] text-neutral-500 italic leading-tight">
                <MessageSquare size={8} className="mt-0.5 shrink-0"/>
                <span className="line-clamp-2">{mansione.note}</span>
            </div>
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
    <div className="flex-1 min-w-[200px] border-r border-neutral-100 last:border-r-0 relative">
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 p-3 flex items-center gap-2 shadow-sm">
        <div className={`w-8 h-8 rounded-full ${operatore.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
          {operatore.nome[0]}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-neutral-800 truncate">{operatore.nome}</h4>
          <p className="text-[10px] text-neutral-400">{operatore.ruolo}</p>
        </div>
      </div>

      <div className="relative bg-neutral-50/30" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
        {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
          <div key={i} className="absolute left-0 right-0 border-t border-neutral-200" style={{ top: `${i * HOUR_HEIGHT}px` }}>
             <span className="absolute -top-2.5 right-1 text-[9px] text-neutral-300 font-mono">{(START_HOUR + i).toString().padStart(2,'0')}:00</span>
          </div>
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
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
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
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
          <div>
            <h3 className="font-bold text-lg text-neutral-800">Modifica Mansione</h3>
            <p className="text-sm text-neutral-500 flex items-center gap-2">
                {fase?.icon} {fase?.nome} <span className="w-1 h-1 rounded-full bg-neutral-300"/> {lavorazione?.paziente}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X size={20} className="text-neutral-400" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Operatore Assegnato</label>
            <div className="grid grid-cols-2 gap-2">
              {OPERATORI.map(op => (
                <button
                  key={op.id}
                  onClick={() => setFormData({ ...formData, operatoreId: op.id })}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all text-left
                    ${formData.operatoreId === op.id ? `${op.colorLight} ${op.colorBorder} ring-1 ring-blue-200` : 'border-neutral-100 hover:border-neutral-300'}`}
                >
                  <div className={`w-8 h-8 rounded-full ${op.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {op.nome[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-neutral-800">{op.nome}</p>
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
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-neutral-50"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-2 block">Ora Fine</label>
              <input
                type="time"
                value={formData.oraFine}
                onChange={e => setFormData({ ...formData, oraFine: e.target.value })}
                className="w-full p-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-neutral-50"
              />
            </div>
          </div>
          
          <label className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer border transition-all ${formData.completata ? 'bg-green-50 border-green-200' : 'bg-neutral-50 border-neutral-100'}`}>
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.completata ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-neutral-300'}`}>
                {formData.completata && <Check size={14} />}
            </div>
            <input
              type="checkbox"
              checked={formData.completata}
              onChange={e => setFormData({ ...formData, completata: e.target.checked })}
              className="hidden"
            />
            <span className={`font-medium ${formData.completata ? 'text-green-800' : 'text-neutral-600'}`}>
                {formData.completata ? 'Mansione Completata' : 'Segna come completata'}
            </span>
          </label>
        </div>
        
        <div className="p-5 border-t border-neutral-100 flex gap-3 justify-end bg-neutral-50/30">
          <Button variant="ghost" onClick={onClose}>Annulla</Button>
          <Button onClick={() => { onSave(formData); onClose(); }}>Salva Modifiche</Button>
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
  const [viewMode, setViewMode] = useState('operatori'); // DEFAULT: VISTA OPERATORI (TEAMS)
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
        <p className="text-neutral-500 text-sm">Pianificazione lavorazioni e mansioni giornaliere</p>
      </div>

      {/* TOOLBAR */}
      <Card className="!p-3">
        <div className="flex flex-wrap justify-between items-center gap-4">
          
          {/* Navigazione Data */}
          <div className="flex items-center gap-2">
            <button onClick={goToPrevDay} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center min-w-[200px]">
              <h2 className="font-bold text-neutral-800 capitalize text-lg">
                {selectedDate.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
              </h2>
              <div className="flex justify-center gap-2 mt-0.5">
                {isToday && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Oggi</span>}
                {weekend && <span className="text-[10px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Weekend</span>}
              </div>
            </div>
            <button onClick={goToNextDay} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-600">
              <ChevronRight size={20} />
            </button>
            {!isToday && (
              <button onClick={goToToday} className="ml-2 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors">
                TORNA A OGGI
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
             {/* Ora Corrente */}
            <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-200">
                <Clock size={16} className="text-primary" />
                <span className="font-mono font-bold text-neutral-800">{currentTime}</span>
            </div>

            {/* Switch Vista */}
            <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg border border-neutral-200">
                <button
                onClick={() => setViewMode('operatori')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide
                    ${viewMode === 'operatori' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                <Users size={14} />
                Operatori
                </button>
                <button
                onClick={() => setViewMode('lavorazioni')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide
                    ${viewMode === 'lavorazioni' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                <List size={14} />
                Lavorazioni
                </button>
            </div>
          </div>
        </div>
      </Card>

      {/* CONTENUTO */}
      {weekend ? (
        <Card className="!p-16 text-center border-dashed">
          <div className="inline-flex p-4 rounded-full bg-neutral-50 mb-4">
             <Calendar size={48} className="text-neutral-300" />
          </div>
          <h3 className="text-xl font-bold text-neutral-800 mb-1">Laboratorio Chiuso</h3>
          <p className="text-neutral-400 max-w-xs mx-auto mb-6">Nessuna attività programmata nel weekend. Goditi il riposo!</p>
          <Button onClick={goToNextDay}>
            Vai a Lunedì
          </Button>
        </Card>
      ) : viewMode === 'lavorazioni' ? (
        <Card className="!p-0 overflow-hidden border border-neutral-200 shadow-sm">
          <div className="flex border-b border-neutral-200 bg-neutral-50 sticky top-0 z-20">
            <div className="w-64 shrink-0 p-3 border-r border-neutral-200 text-xs font-bold uppercase text-neutral-400 tracking-wider">
              Lavorazioni ({lavorazioniOggi.length})
            </div>
            <div className="flex-1 flex relative" style={{ minWidth: `${TIMELINE_WIDTH}px` }}>
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (
                <div key={i} className="border-l border-neutral-200 pl-1 pt-1 flex-1 relative group" style={{ width: `${HOUR_WIDTH}px` }}>
                  <span className="text-[10px] font-mono text-neutral-400 group-hover:text-primary transition-colors">{(START_HOUR + i).toString().padStart(2, '0')}:00</span>
                </div>
              ))}
              {showCurrentLine && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none" style={{ left: `${currentLineLeft}px` }}>
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-red-500 shadow-sm" />
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
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
              <div className="p-16 text-center text-neutral-400">
                <div className="inline-flex p-4 rounded-full bg-neutral-50 mb-3">
                    <List size={32} className="opacity-20" />
                </div>
                <p className="font-medium">Nessuna lavorazione attiva per oggi</p>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden border border-neutral-200 shadow-sm">
          <div className="flex overflow-x-auto custom-scrollbar bg-white">
            <div className="w-16 shrink-0 border-r border-neutral-200 bg-neutral-50/50">
              <div className="h-[65px] border-b border-neutral-200 bg-white sticky top-0 z-20" />
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
            <div className="p-16 text-center text-neutral-400 border-t border-neutral-100">
              <div className="inline-flex p-4 rounded-full bg-neutral-50 mb-3">
                 <Users size={32} className="opacity-20" />
              </div>
              <p className="font-medium">Nessuna mansione assegnata per oggi</p>
            </div>
          )}
        </Card>
      )}

      {/* LEGENDA */}
      <div className="flex flex-wrap items-center gap-6 justify-center py-2">
        <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest">Legenda Operatori</span>
        {OPERATORI.map(op => (
          <div key={op.id} className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${op.color}`} />
            <span className="text-xs font-medium text-neutral-600">{op.nome}</span>
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