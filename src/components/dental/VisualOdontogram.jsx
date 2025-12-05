import React from 'react';

// --- COSTANTI E CONFIGURAZIONI ---

export const GROUP_COLORS = [
  { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700' },
  { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700' },
  { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700' },
  { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700' },
];

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

// --- HELPER FUNCTIONS ---

export const getToothType = (toothId) => {
  const num = parseInt(toothId.slice(-1));
  if (num === 1) return 'incisor_central';
  if (num === 2) return 'incisor_lateral';
  if (num === 3) return 'canine';
  if (num === 4 || num === 5) return 'premolar';
  return 'molar'; // 6, 7, 8
};

/**
 * Logica di adiacenza denti (ISO 3950)
 * Ritorna true se i denti passati nell'array sono tutti adiacenti
 */
export const checkAdjacency = (teeth) => {
  if (teeth.length < 2) return true;
  
  const UPPER = ['18','17','16','15','14','13','12','11','21','22','23','24','25','26','27','28'];
  const LOWER = ['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38'];
  
  const sorted = [...teeth].sort();
  
  const isUpper = teeth.every(t => UPPER.includes(t));
  const isLower = teeth.every(t => LOWER.includes(t));
  
  if (!isUpper && !isLower) return false;
  
  const refArray = isUpper ? UPPER : LOWER;
  
  // Trova gli indici nell'array di riferimento
  const indices = teeth.map(t => refArray.indexOf(t)).sort((a,b) => a-b);
  
  // Controlla sequenzialità
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i+1] !== indices[i] + 1) return false;
  }
  
  return true;
};

// --- SOTTO-COMPONENTI ---

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
    // Usa l'indice del gruppo per assegnare un colore coerente
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

// --- COMPONENTE PRINCIPALE ---

const VisualOdontogram = ({ selected = [], onToggle, configured = [] }) => (
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

export default VisualOdontogram;