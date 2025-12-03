import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, FileText, Upload, Clock, CheckCircle, 
  AlertCircle, Calendar, Save, Eye, 
  Link as LinkIcon, Trash2, Info, Check, Send 
} from 'lucide-react';
import Card from '../../components/ui/Card'; 
import Button from '../../components/ui/Button'; 

// --- HELPER: COLORI GRUPPI ---
const GROUP_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
];

// --- HELPER: LOGICA ADIACENZA DENTI (ISO 3950) ---
const checkAdjacency = (teeth) => {
  if (teeth.length < 2) return true;
  
  const UPPER = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const LOWER = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
  
  const sorted = [...teeth].sort();
  
  const isUpper = teeth.every(t => UPPER.includes(t));
  const isLower = teeth.every(t => LOWER.includes(t));
  
  if (!isUpper && !isLower) return false;
  
  const refArray = isUpper ? UPPER : LOWER;
  
  const indices = teeth.map(t => refArray.indexOf(t)).sort((a,b) => a-b);
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i+1] !== indices[i] + 1) return false;
  }
  
  return true;
};

// --- SAGOME ANATOMICHE DEI DENTI (Solo Corona - Vista Occlusale) ---

const TOOTH_SHAPES = {
  // Molare: forma rettangolare arrotondata con 4-5 cuspidi
  molar: {
    outline: `M -10 -12 
              Q -13 -12, -13 -8 
              L -13 8 
              Q -13 12, -10 12 
              L 10 12 
              Q 13 12, 13 8 
              L 13 -8 
              Q 13 -12, 10 -12 Z`,
    // Solco centrale a forma di H/croce
    details: `M -7 0 L 7 0 M 0 -7 L 0 7 
              M -6 -6 Q -3 -3, 0 -6 Q 3 -3, 6 -6
              M -6 6 Q -3 3, 0 6 Q 3 3, 6 6`,
    // Cuspidi (4 angoli)
    cusps: [
      { cx: -6, cy: -6, r: 3 },
      { cx: 6, cy: -6, r: 3 },
      { cx: -6, cy: 6, r: 3 },
      { cx: 6, cy: 6, r: 3 },
    ]
  },
  
  // Premolare: forma ovale con 2 cuspidi
  premolar: {
    outline: `M -7 -10 
              Q -10 -10, -10 -6 
              L -10 6 
              Q -10 10, -7 10 
              L 7 10 
              Q 10 10, 10 6 
              L 10 -6 
              Q 10 -10, 7 -10 Z`,
    // Solco centrale
    details: `M 0 -6 L 0 6`,
    cusps: [
      { cx: -4, cy: 0, r: 3.5 },
      { cx: 4, cy: 0, r: 3.5 },
    ]
  },
  
  // Canino: forma a diamante/rombo con punta
  canine: {
    outline: `M 0 -11 
              Q 6 -8, 9 0 
              Q 6 8, 0 11 
              Q -6 8, -9 0 
              Q -6 -8, 0 -11 Z`,
    // Cresta centrale
    details: `M 0 -7 L 0 7`,
    cusps: [
      { cx: 0, cy: 0, r: 4 },
    ]
  },
  
  // Incisivo centrale: forma a pala/rettangolo largo
  incisor_central: {
    outline: `M -8 -6 
              Q -9 -6, -9 -4 
              L -9 6 
              Q -9 8, -7 8 
              L 7 8 
              Q 9 8, 9 6 
              L 9 -4 
              Q 9 -6, 8 -6 Z`,
    // Margine incisale
    details: `M -6 -3 L 6 -3`,
    cusps: []
  },
  
  // Incisivo laterale: simile al centrale ma più piccolo e stretto
  incisor_lateral: {
    outline: `M -6 -5 
              Q -7 -5, -7 -3 
              L -7 5 
              Q -7 7, -5 7 
              L 5 7 
              Q 7 7, 7 5 
              L 7 -3 
              Q 7 -5, 6 -5 Z`,
    details: `M -4 -2 L 4 -2`,
    cusps: []
  }
};

// Mappa i tipi di dente ai loro path
const getToothType = (toothId) => {
  const num = parseInt(toothId.slice(-1));
  if (num === 1) return 'incisor_central';
  if (num === 2) return 'incisor_lateral';
  if (num === 3) return 'canine';
  if (num === 4 || num === 5) return 'premolar';
  return 'molar'; // 6, 7, 8
};

// Dati posizionamento arcate dentali
const DENTAL_ARCH_DATA = {
  upper: [
    { id: '18', x: 22, y: 155, rot: -15, lx: -28, ly: 5 },
    { id: '17', x: 30, y: 120, rot: -20, lx: -28, ly: 0 },
    { id: '16', x: 42, y: 88, rot: -25, lx: -26, ly: -5 },
    { id: '15', x: 58, y: 60, rot: -38, lx: -22, ly: -10 },
    { id: '14', x: 78, y: 40, rot: -50, lx: -18, ly: -14 },
    { id: '13', x: 102, y: 24, rot: -65, lx: -12, ly: -18 },
    { id: '12', x: 128, y: 14, rot: -78, lx: -6, ly: -22 },
    { id: '11', x: 152, y: 10, rot: -88, lx: 0, ly: -24 },
    { id: '21', x: 178, y: 10, rot: 88, lx: 0, ly: -24 },
    { id: '22', x: 202, y: 14, rot: 78, lx: 6, ly: -22 },
    { id: '23', x: 228, y: 24, rot: 65, lx: 12, ly: -18 },
    { id: '24', x: 252, y: 40, rot: 50, lx: 18, ly: -14 },
    { id: '25', x: 272, y: 60, rot: 38, lx: 22, ly: -10 },
    { id: '26', x: 288, y: 88, rot: 25, lx: 26, ly: -5 },
    { id: '27', x: 300, y: 120, rot: 20, lx: 28, ly: 0 },
    { id: '28', x: 308, y: 155, rot: 15, lx: 28, ly: 5 },
  ],
  lower: [
    { id: '48', x: 22, y: 25, rot: 15, lx: -28, ly: -5 },
    { id: '47', x: 30, y: 60, rot: 20, lx: -28, ly: 0 },
    { id: '46', x: 42, y: 92, rot: 25, lx: -26, ly: 5 },
    { id: '45', x: 58, y: 120, rot: 38, lx: -22, ly: 10 },
    { id: '44', x: 78, y: 140, rot: 50, lx: -18, ly: 14 },
    { id: '43', x: 102, y: 156, rot: 65, lx: -12, ly: 18 },
    { id: '42', x: 128, y: 166, rot: 78, lx: -6, ly: 22 },
    { id: '41', x: 152, y: 170, rot: 88, lx: 0, ly: 24 },
    { id: '31', x: 178, y: 170, rot: -88, lx: 0, ly: 24 },
    { id: '32', x: 202, y: 166, rot: -78, lx: 6, ly: 22 },
    { id: '33', x: 228, y: 156, rot: -65, lx: 12, ly: 18 },
    { id: '34', x: 252, y: 140, rot: -50, lx: 18, ly: 14 },
    { id: '35', x: 272, y: 120, rot: -38, lx: 22, ly: 10 },
    { id: '36', x: 288, y: 92, rot: -25, lx: 26, ly: 5 },
    { id: '37', x: 300, y: 60, rot: -20, lx: 28, ly: 0 },
    { id: '38', x: 308, y: 25, rot: -15, lx: 28, ly: -5 },
  ]
};

// Componente singolo dente anatomico
const AnatomicalTooth = ({ data, isSelected, configuredGroup, onToggle }) => {
  const toothType = getToothType(data.id);
  const shape = TOOTH_SHAPES[toothType];
  
  // Colori basati sullo stato
  let fillColor = '#FFFFFF';
  let strokeColor = '#94A3B8';
  let detailColor = '#CBD5E1';
  let cuspFill = '#F1F5F9';
  let numBg = '#1E293B';
  let shadowOpacity = 0.08;

  if (isSelected) {
    fillColor = '#3B82F6';
    strokeColor = '#1D4ED8';
    detailColor = '#60A5FA';
    cuspFill = '#2563EB';
    numBg = '#1D4ED8';
    shadowOpacity = 0.25;
  } else if (configuredGroup) {
    const colors = [
      { fill: '#DBEAFE', stroke: '#3B82F6', detail: '#93C5FD', cusp: '#BFDBFE' },
      { fill: '#DCFCE7', stroke: '#22C55E', detail: '#86EFAC', cusp: '#BBF7D0' },
      { fill: '#F3E8FF', stroke: '#A855F7', detail: '#C4B5FD', cusp: '#E9D5FF' },
      { fill: '#FFEDD5', stroke: '#F97316', detail: '#FDBA74', cusp: '#FED7AA' },
      { fill: '#FCE7F3', stroke: '#EC4899', detail: '#F9A8D4', cusp: '#FBCFE8' },
    ];
    const idx = configuredGroup.groupIndex % colors.length;
    fillColor = colors[idx].fill;
    strokeColor = colors[idx].stroke;
    detailColor = colors[idx].detail;
    cuspFill = colors[idx].cusp;
    numBg = colors[idx].stroke;
  }

  // Scala per dimensioni uniformi
  const scale = toothType === 'molar' ? 1.15 : toothType === 'premolar' ? 1.05 : 1.0;

  return (
    <g 
      onClick={() => onToggle(data.id)} 
      className="cursor-pointer transition-all duration-200"
      style={{ filter: `drop-shadow(0 2px 3px rgba(0,0,0,${shadowOpacity}))` }}
    >
      {/* Numero del dente */}
      <g>
        <circle 
          cx={data.x + data.lx} 
          cy={data.y + data.ly} 
          r="11" 
          fill={numBg}
          className="transition-colors duration-200"
        />
        <text 
          x={data.x + data.lx} 
          y={data.y + data.ly + 4} 
          textAnchor="middle" 
          fill="white" 
          fontSize="11" 
          fontWeight="bold"
          className="pointer-events-none select-none"
        >
          {data.id}
        </text>
      </g>
      
      {/* Dente anatomico - Solo corona */}
      <g transform={`translate(${data.x}, ${data.y}) rotate(${data.rot}) scale(${scale})`}>
        {/* Contorno esterno della corona */}
        <path 
          d={shape.outline} 
          fill={fillColor} 
          stroke={strokeColor} 
          strokeWidth="1.8"
          className="transition-colors duration-200"
        />
        
        {/* Cuspidi (cerchi per molari/premolari) */}
        {shape.cusps && shape.cusps.map((cusp, i) => (
          <circle
            key={i}
            cx={cusp.cx}
            cy={cusp.cy}
            r={cusp.r}
            fill={cuspFill}
            stroke={detailColor}
            strokeWidth="0.8"
          />
        ))}
        
        {/* Dettagli/solchi */}
        <path 
          d={shape.details} 
          fill="none" 
          stroke={detailColor} 
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
};

// Componente Odontogramma completo
const VisualOdontogram = ({ selected, onToggle, configured }) => (
  <div className="flex flex-col xl:flex-row gap-6 justify-center items-center py-4 select-none">
    {['upper', 'lower'].map(arch => (
      <div key={arch} className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full ${arch === 'upper' ? 'bg-blue-400' : 'bg-emerald-400'}`}></div>
          <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Arcata {arch === 'upper' ? 'Superiore' : 'Inferiore'}
          </h4>
        </div>
        <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl p-3 border border-slate-200 shadow-inner">
          <svg 
            width="340" 
            height="200" 
            viewBox="0 0 340 200"
            className="overflow-visible"
          >
            {/* Linea mediana */}
            <line 
              x1="165" y1="0" x2="165" y2="200" 
              stroke="#CBD5E1" 
              strokeWidth="1" 
              strokeDasharray="4,4"
            />
            
            {/* Etichette quadranti */}
            <text x="80" y="195" fill="#94A3B8" fontSize="9" fontWeight="500">
              {arch === 'upper' ? 'Q1' : 'Q4'}
            </text>
            <text x="250" y="195" fill="#94A3B8" fontSize="9" fontWeight="500">
              {arch === 'upper' ? 'Q2' : 'Q3'}
            </text>
            
            {/* Denti */}
            {DENTAL_ARCH_DATA[arch].map(tooth => {
              const group = configured.find(c => c.teeth.includes(tooth.id));
              return (
                <AnatomicalTooth 
                  key={tooth.id} 
                  data={tooth} 
                  isSelected={selected.includes(tooth.id)} 
                  configuredGroup={group}
                  onToggle={onToggle}
                />
              );
            })}
          </svg>
        </div>
        
        {/* Legenda tipi dente */}
        <div className="flex justify-center gap-4 mt-2 text-xs text-slate-500">
          <span>M = Molari</span>
          <span>P = Premolari</span>
          <span>C = Canini</span>
          <span>I = Incisivi</span>
        </div>
      </div>
    ))}
  </div>
);

// --- WIZARD COMPONENTE PRINCIPALE ---

const NuovaRichiesta = ({ onCancel, onSubmit }) => {
  const [step, setStep] = useState(1);
  
  // Dati Paziente
  const [formData, setFormData] = useState({
    nome: '', cognome: '', codicePaziente: '', eta: '', sesso: 'M',
    allergie: false, bruxismo: false, disfunzioni: false, dispositivi: false, handicap: false
  });

  // Dati Elementi
  const [selectedTeeth, setSelectedTeeth] = useState([]); 
  const [configuredElements, setConfiguredElements] = useState([]); 
  const [currentConfig, setCurrentConfig] = useState({
    material: 'zirconio', color: 'A2', description: '', isBridge: false
  });
  
  // Date
  const [dates, setDates] = useState({
    delivery: '', tryIn1: '', tryIn2: '', tryIn3: ''
  });

  // Logica Odontogramma
  const toggleTooth = (toothId) => {
    if (configuredElements.some(c => c.teeth.includes(toothId))) {
      if(confirm("Questo elemento è già configurato. Vuoi rimuoverlo per modificarlo?")) {
        setConfiguredElements(prev => prev.filter(c => !c.teeth.includes(toothId)));
      }
      return;
    }
    setSelectedTeeth(prev => prev.includes(toothId) ? prev.filter(t => t !== toothId) : [...prev, toothId]);
  };

  const removeElement = (id) => {
    setConfiguredElements(prev => prev.filter(el => el.id !== id));
  };

  const addElement = () => {
    if (selectedTeeth.length === 0) return;

    if (currentConfig.isBridge && !checkAdjacency(selectedTeeth)) {
      alert("Errore: Puoi unire in un ponte solo elementi adiacenti (es. 11-12-13).");
      return;
    }

    const newElement = {
      id: Date.now(),
      groupIndex: configuredElements.length,
      teeth: [...selectedTeeth].sort(),
      ...currentConfig,
      inferredType: currentConfig.isBridge ? 'Ponte' : 'Elemento Singolo'
    };

    setConfiguredElements([...configuredElements, newElement]);
    setSelectedTeeth([]); 
    setCurrentConfig({ ...currentConfig, isBridge: false, description: '' }); 
  };

  const submitFullRequest = () => {
    const newMsg = {
      id: Date.now(),
      from: `Dott. ${formData.cognome || 'Rossi'}`,
      subject: `Nuova Lavorazione - Pz. ${formData.codicePaziente}`,
      preview: `Richiesta per ${configuredElements.length} elementi. Consegna: ${dates.delivery}`,
      date: new Date().toISOString(),
      read: false,
      type: 'request'
    };
    
    const existingInbox = JSON.parse(localStorage.getItem('mimesi_admin_inbox') || '[]');
    localStorage.setItem('mimesi_admin_inbox', JSON.stringify([newMsg, ...existingInbox]));
    
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* HEADER PROGRESSO */}
      <div className="flex items-center justify-between mb-6">
        <div>
           <h2 className="text-2xl font-bold text-primary">Nuova Prescrizione (MPO)</h2>
           <p className="text-sm text-neutral-500">Compila i dati per inviare la richiesta</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(s => (
            <span key={s} className={`px-3 py-1 rounded-full text-sm transition-colors ${step === s ? 'bg-primary text-white font-medium' : 'bg-neutral-100 text-neutral-500'}`}>
              {s === 1 ? '1. Paziente' : s === 2 ? '2. Elementi' : s === 3 ? '3. File' : '4. Riepilogo'}
            </span>
          ))}
        </div>
      </div>

      {/* STEP 1: PAZIENTE  */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Nome</label>
              <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Cognome</label>
              <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
                value={formData.cognome} onChange={e => setFormData({...formData, cognome: e.target.value})} />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Codice Paziente</label>
               <input type="text" className="w-full p-2 rounded-lg border border-neutral-200 outline-none" 
                 value={formData.codicePaziente} onChange={e => setFormData({...formData, codicePaziente: e.target.value})} placeholder="Es. PZ-001" />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Età</label>
               <input type="number" className="w-full p-2 rounded-lg border border-neutral-200 outline-none" 
                 value={formData.eta} onChange={e => setFormData({...formData, eta: e.target.value})} />
             </div>
             <div>
               <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Sesso</label>
               <select className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white"
                 value={formData.sesso} onChange={e => setFormData({...formData, sesso: e.target.value})}>
                  <option value="M">Maschio</option>
                  <option value="F">Femmina</option>
               </select>
             </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <h4 className="font-bold text-sm text-primary mb-3">Anamnesi e Condizioni Cliniche</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'allergie', label: 'Allergie Accertate' },
                { key: 'bruxismo', label: 'Bruxismo' },
                { key: 'disfunzioni', label: 'Disfunzioni Articolari' },
                { key: 'dispositivi', label: 'Altri dispositivi presenti' },
                { key: 'handicap', label: 'Handicap Psicomotori' },
              ].map(item => (
                <label key={item.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-primary rounded" 
                    checked={formData[item.key]} onChange={e => setFormData({...formData, [item.key]: e.target.checked})} />
                  <span className="text-sm text-neutral-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)}>Avanti →</Button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: ELEMENTI E DATE */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          
          <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
            <VisualOdontogram 
              selected={selectedTeeth} 
              onToggle={toggleTooth} 
              configured={configuredElements} 
            />
          </div>

          <div className="p-5 border rounded-2xl bg-neutral-50 border-primary/10 shadow-inner">
            {selectedTeeth.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                   <div className="flex items-center gap-2">
                     <span className="font-bold text-neutral-800">Selezione:</span>
                     <span className="text-primary bg-white border px-2 py-1 rounded text-sm font-mono">{selectedTeeth.sort().join(', ')}</span>
                   </div>
                   {selectedTeeth.length > 1 && (
                     <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-lg border hover:border-primary transition-colors">
                       <input type="checkbox" checked={currentConfig.isBridge} onChange={(e) => setCurrentConfig({...currentConfig, isBridge: e.target.checked})} className="accent-primary"/>
                       <LinkIcon size={14} className="text-primary" />
                       <span className="text-sm font-bold text-neutral-700">Unisci in Ponte</span>
                     </label>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Materiale</label>
                    <select value={currentConfig.material} onChange={(e) => setCurrentConfig({...currentConfig, material: e.target.value})} className="w-full p-2 text-sm border rounded bg-white">
                      <option value="zirconio">Zirconio</option>
                      <option value="disilicato">Disilicato</option>
                      <option value="metallo_ceramica">Metallo-Ceramica</option>
                      <option value="pmma">PMMA</option>
                      <option value="resina">Resina</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Colore</label>
                    <select value={currentConfig.color} onChange={(e) => setCurrentConfig({...currentConfig, color: e.target.value})} className="w-full p-2 text-sm border rounded bg-white">
                      <optgroup label="Scala Vita A"><option>A1</option><option>A2</option><option>A3</option><option>A3.5</option><option>A4</option></optgroup>
                      <optgroup label="Scala Vita B"><option>B1</option><option>B2</option><option>B3</option><option>B4</option></optgroup>
                      <optgroup label="Bleach"><option>BL1</option><option>BL2</option><option>BL3</option></optgroup>
                    </select>
                  </div>
                </div>
                
                <div>
                   <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Descrizione e Specifica (Opzionale)</label>
                   <input type="text" placeholder="Es. Tonalità cervicale più scura..." className="w-full p-2 text-sm border rounded bg-white" 
                     value={currentConfig.description} onChange={(e) => setCurrentConfig({...currentConfig, description: e.target.value})} />
                </div>

                <div className="flex justify-end">
                  <Button onClick={addElement} variant="gradient"><Check size={16} /> Conferma Elementi</Button>
                </div>
              </div>
            ) : (
              <div className="text-center text-neutral-400 py-4 flex flex-col items-center gap-2">
                <Info size={24} />
                <p>Clicca sui denti nell'odontogramma per configurarli</p>
              </div>
            )}
          </div>

          {/* RIEPILOGO ELEMENTI CON COLORI */}
          {configuredElements.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-neutral-600">Elementi Configurati</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {configuredElements.map((el) => {
                  const style = GROUP_COLORS[el.groupIndex % GROUP_COLORS.length];
                  return (
                    <div key={el.id} className={`flex items-center justify-between p-3 rounded-xl border ${style.bg} ${style.border}`}>
                      <div>
                        <p className={`font-bold text-sm ${style.text}`}>
                          {el.isBridge ? '🔗 Ponte' : '🦷 Singolo'} {el.teeth.join('-')}
                        </p>
                        <p className="text-xs text-neutral-600 capitalize">
                          {el.material} • {el.color} {el.description && `• ${el.description}`}
                        </p>
                      </div>
                      <button onClick={() => removeElement(el.id)} className="text-neutral-400 hover:text-error p-1"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DATE (Consegna + Prove) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t">
             <div className="col-span-2 md:col-span-1">
               <label className="text-xs font-bold text-primary mb-1 block">Consegna *</label>
               <input type="date" className="w-full p-2 border border-primary/30 rounded bg-white text-sm" 
                 value={dates.delivery} onChange={e => setDates({...dates, delivery: e.target.value})} />
             </div>
             {[1, 2, 3].map(i => (
               <div key={i}>
                 <label className="text-xs text-neutral-500 mb-1 block">Prova {i} (Opz.)</label>
                 <input type="date" className="w-full p-2 border rounded bg-white text-sm"
                   value={dates[`tryIn${i}`]} onChange={e => setDates({...dates, [`tryIn${i}`]: e.target.value})} />
               </div>
             ))}
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setStep(1)}>← Indietro</Button>
            <Button onClick={() => setStep(3)} disabled={configuredElements.length === 0 || !dates.delivery}>Avanti →</Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: UPLOAD */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
            <Upload className="mx-auto h-16 w-16 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-lg text-neutral-700">Trascina qui i file STL/PLY delle impronte</p>
            <p className="text-sm text-neutral-500 mt-2">o clicca per selezionare dal dispositivo</p>
          </div>
          <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer">
            <p className="text-sm text-neutral-500">Allegati fotografici (JPG, PNG) [Facoltativo]</p>
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setStep(2)}>← Indietro</Button>
            <Button onClick={() => setStep(4)}>Riepilogo →</Button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: RIEPILOGO DETTAGLIATO */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-neutral-50 p-4 border-b border-neutral-200">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2"><FileText size={20}/> Riepilogo Prescrizione</h3>
            </div>
            <div className="p-6 space-y-6">
              
              {/* Paziente */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Paziente</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p><span className="text-neutral-500">Nominativo:</span> <span className="font-medium">{formData.nome} {formData.cognome}</span></p>
                  <p><span className="text-neutral-500">Codice:</span> <span className="font-medium">{formData.codicePaziente}</span></p>
                  <p><span className="text-neutral-500">Età/Sesso:</span> {formData.eta} / {formData.sesso}</p>
                  <p><span className="text-neutral-500">Condizioni:</span> {[
                    formData.allergie && 'Allergie', formData.bruxismo && 'Bruxismo', 
                    formData.disfunzioni && 'Disfunzioni', formData.dispositivi && 'Dispositivi', formData.handicap && 'Handicap'
                  ].filter(Boolean).join(', ') || 'Nessuna'}</p>
                </div>
              </div>

              {/* Lavorazioni */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Elementi ({configuredElements.length})</h4>
                <div className="space-y-2">
                  {configuredElements.map((el) => {
                    const style = GROUP_COLORS[el.groupIndex % GROUP_COLORS.length];
                    return (
                      <div key={el.id} className={`p-3 rounded-lg text-sm border flex justify-between items-center ${style.bg} ${style.border}`}>
                        <div>
                          <span className={`font-bold ${style.text}`}>{el.isBridge ? 'Ponte' : 'Elemento'} {el.teeth.join('-')}</span>
                          <span className="mx-2 text-neutral-400">|</span>
                          <span>{el.material} {el.color}</span>
                        </div>
                        {el.description && <span className="text-xs bg-white px-2 py-1 rounded border opacity-75">{el.description}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date */}
              <div>
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Pianificazione</h4>
                <div className="flex gap-4 text-sm">
                  <div className="bg-primary/5 text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-medium">
                    Consegna: {dates.delivery}
                  </div>
                  {dates.tryIn1 && <div className="text-neutral-600 px-2 py-1.5">Prova 1: {dates.tryIn1}</div>}
                  {dates.tryIn2 && <div className="text-neutral-600 px-2 py-1.5">Prova 2: {dates.tryIn2}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
             <Info size={20} className="text-yellow-600 mt-0.5 shrink-0" />
             <p className="text-sm text-yellow-800">
               Confermando, la richiesta verrà inviata all'Amministrazione per la validazione. Riceverai una notifica quando il preventivo sarà pronto.
             </p>
          </div>

          <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
            <Button variant="ghost" onClick={() => setStep(3)}>← Indietro</Button>
            <Button variant="gradient" onClick={submitFullRequest} className="shadow-lg shadow-primary/20 pl-6 pr-6">
               <Send size={18} className="mr-2" /> Conferma e Invia
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// 2. LISTA PREVENTIVI DA FIRMARE
const PreventiviDaFirmare = () => {
  const [showOtp, setShowOtp] = useState(null);

  const handleSign = (id) => {
    alert(`Codice OTP inviato alla tua email.`);
    setShowOtp(id);
  };

  const confirmSign = (id) => {
    alert("Documento firmato digitalmente con successo! La lavorazione è stata avviata.");
    setShowOtp(null);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-800 mb-4">Documenti in attesa di firma</h3>
      <Card className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-warning">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold bg-warning/10 text-warning px-2 py-1 rounded">IN ATTESA</span>
             <span className="text-xs text-neutral-400">Emesso il 29/11/2025</span>
          </div>
          <h4 className="font-bold text-lg">Paziente: Giuseppe Verdi</h4>
          <p className="text-sm text-neutral-600">Ponte in Zirconio (3 elementi) - Rif. Prev #2024-88</p>
          <p className="text-sm font-bold text-primary mt-1">Totale: € 450,00</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {!showOtp ? (
            <>
              <Button variant="ghost" className="text-error hover:bg-error/10">Rifiuta</Button>
              <Button onClick={() => handleSign(1)}>Visualizza e Firma</Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 animate-fade-in-up">
               <input type="text" placeholder="Inserisci OTP" className="p-2 border rounded text-center w-32" />
               <Button variant="success" onClick={() => confirmSign(1)}>Conferma OTP</Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

// 3. DASHBOARD PRINCIPALE
export default function DashboardDottore() {
  const [view, setView] = useState('dashboard');

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
      
      {/* HEADER E AZIONI RAPIDE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Il mio Studio</h1>
          <p className="text-neutral-500">Gestione prescrizioni e avanzamento lavori</p>
        </div>
        
        <div className="flex gap-3">
           <Button 
             variant={view === 'quotes' ? 'primary' : 'secondary'} 
             onClick={() => setView('quotes')}
             className="relative"
           >
             <FileText size={18} /> Preventivi
             <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] flex items-center justify-center rounded-full">1</span>
           </Button>
           <Button 
             variant="gradient" 
             onClick={() => setView('new-request')}
             className="shadow-lg hover:shadow-xl"
           >
             <Plus size={18} /> Nuova Lavorazione
           </Button>
        </div>
      </div>

      {/* CONTENUTO DINAMICO */}
      <AnimatePresence mode="wait">
        
        {/* VISTA: NUOVA RICHIESTA */}
        {view === 'new-request' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-neutral-100"
          >
            <NuovaRichiesta onCancel={() => setView('dashboard')} onSubmit={() => {
               alert("Richiesta inviata all'Amministrazione per validazione!");
               setView('dashboard');
            }} />
          </motion.div>
        )}

        {/* VISTA: PREVENTIVI */}
        {view === 'quotes' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <Button variant="ghost" onClick={() => setView('dashboard')} className="mb-4">← Torna alla Dashboard</Button>
             <PreventiviDaFirmare />
          </motion.div>
        )}

        {/* VISTA: DASHBOARD (Default) */}
        {view === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="flex items-center gap-4 bg-primary/5 border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Lavorazione</p>
                  <h3 className="text-2xl font-bold text-primary">4 Casi</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-warning/5 border-warning/20">
                <div className="w-12 h-12 rounded-full bg-warning flex items-center justify-center text-white">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">In Attesa (Prova)</p>
                  <h3 className="text-2xl font-bold text-warning">1 Caso</h3>
                </div>
              </Card>
              <Card className="flex items-center gap-4 bg-success/5 border-success/20">
                <div className="w-12 h-12 rounded-full bg-success flex items-center justify-center text-white">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Consegnati (Mese)</p>
                  <h3 className="text-2xl font-bold text-success">12 Casi</h3>
                </div>
              </Card>
            </div>

            {/* Lista Lavorazioni Attive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-bold text-neutral-800 text-lg">Lavorazioni Attive</h3>
                
                <Card className="group hover:border-primary/50 transition-colors cursor-pointer">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LAV-2024-105</span>
                         <h4 className="font-bold text-lg mt-1">Mario Rossi</h4>
                         <p className="text-sm text-neutral-500">Corona Singola - Zirconio A3</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">In Ceramizzazione</span>
                   </div>
                   <div className="flex items-center gap-4 text-xs text-neutral-400 border-t pt-3 mt-3">
                      <span className="flex items-center gap-1"><Calendar size={12}/> Consegna: 12/02/2025</span>
                      <span className="flex items-center gap-1"><Save size={12}/> Impronta: Digitale</span>
                   </div>
                </Card>

                <Card className="group hover:border-primary/50 transition-colors cursor-pointer border-l-4 border-l-warning">
                   <div className="flex justify-between items-start mb-3">
                      <div>
                         <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LAV-2024-102</span>
                         <h4 className="font-bold text-lg mt-1">Luigi Bianchi</h4>
                         <p className="text-sm text-neutral-500">Ponte (3 Elementi)</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning text-white">IN PROVA</span>
                   </div>
                   <div className="text-xs text-neutral-500 bg-neutral-50 p-2 rounded">
                      ⚠️ Dispositivo spedito allo studio. In attesa di esito prova.
                   </div>
                </Card>
              </div>

              {/* Storico / Recenti */}
              <div className="space-y-4">
                 <h3 className="font-bold text-neutral-800 text-lg">Storico Recente</h3>
                 <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
                    {[1,2,3].map((i) => (
                       <div key={i} className="p-4 border-b last:border-0 hover:bg-neutral-50 flex justify-between items-center">
                          <div>
                             <p className="font-medium text-sm">Paziente Test {i}</p>
                             <p className="text-xs text-neutral-400">Completato il 20/01/2025</p>
                          </div>
                          <Button variant="ghost" className="h-8 w-8 p-0 rounded-full"><Eye size={16}/></Button>
                       </div>
                    ))}
                 </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
