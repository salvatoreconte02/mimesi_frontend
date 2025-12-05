import React from 'react';

// --- COSTANTI E DATI GRAFICI ---
const TOOTH_SHAPES = {
  molar: {
    outline: `M -10 -12 Q -13 -12, -13 -8 L -13 8 Q -13 12, -10 12 L 10 12 Q 13 12, 13 8 L 13 -8 Q 13 -12, 10 -12 Z`,
    details: `M -7 0 L 7 0 M 0 -7 L 0 7 M -6 -6 Q -3 -3, 0 -6 Q 3 -3, 6 -6 M -6 6 Q -3 3, 0 6 Q 3 3, 6 6`,
    cusps: [{ cx: -6, cy: -6, r: 3 }, { cx: 6, cy: -6, r: 3 }, { cx: -6, cy: 6, r: 3 }, { cx: 6, cy: 6, r: 3 }]
  },
  premolar: {
    outline: `M -7 -10 Q -10 -10, -10 -6 L -10 6 Q -10 10, -7 10 L 7 10 Q 10 10, 10 6 L 10 -6 Q 10 -10, 7 -10 Z`,
    details: `M 0 -6 L 0 6`,
    cusps: [{ cx: -4, cy: 0, r: 3.5 }, { cx: 4, cy: 0, r: 3.5 }]
  },
  canine: {
    outline: `M 0 -11 Q 6 -8, 9 0 Q 6 8, 0 11 Q -6 8, -9 0 Q -6 -8, 0 -11 Z`,
    details: `M 0 -7 L 0 7`,
    cusps: [{ cx: 0, cy: 0, r: 4 }]
  },
  incisor_central: {
    outline: `M -8 -6 Q -9 -6, -9 -4 L -9 6 Q -9 8, -7 8 L 7 8 Q 9 8, 9 6 L 9 -4 Q 9 -6, 8 -6 Z`,
    details: `M -6 -3 L 6 -3`,
    cusps: []
  },
  incisor_lateral: {
    outline: `M -6 -5 Q -7 -5, -7 -3 L -7 5 Q -7 7, -5 7 L 5 7 Q 7 7, 7 5 L 7 -3 Q 7 -5, 6 -5 Z`,
    details: `M -4 -2 L 4 -2`,
    cusps: []
  }
};

// Helper Colori per i Gruppi Confermati
const GROUP_COLORS = [
  { fill: '#DCFCE7', stroke: '#22C55E', detail: '#86EFAC', num: '#15803D' }, // Verde
  { fill: '#DBEAFE', stroke: '#3B82F6', detail: '#93C5FD', num: '#1D4ED8' }, // Blu
  { fill: '#F3E8FF', stroke: '#A855F7', detail: '#C4B5FD', num: '#7E22CE' }, // Viola
  { fill: '#FFEDD5', stroke: '#F97316', detail: '#FDBA74', num: '#C2410C' }, // Arancio
];

const getToothType = (toothId) => {
  const num = parseInt(toothId.slice(-1));
  if (num === 1) return 'incisor_central';
  if (num === 2) return 'incisor_lateral';
  if (num === 3) return 'canine';
  if (num === 4 || num === 5) return 'premolar';
  return 'molar';
};

const DENTAL_ARCH_DATA = {
  upper: [
    { id: '18', x: 22, y: 155, rot: -15, lx: -28, ly: 5 }, { id: '17', x: 30, y: 120, rot: -20, lx: -28, ly: 0 },
    { id: '16', x: 42, y: 88, rot: -25, lx: -26, ly: -5 }, { id: '15', x: 58, y: 60, rot: -38, lx: -22, ly: -10 },
    { id: '14', x: 78, y: 40, rot: -50, lx: -18, ly: -14 }, { id: '13', x: 102, y: 24, rot: -65, lx: -12, ly: -18 },
    { id: '12', x: 128, y: 14, rot: -78, lx: -6, ly: -22 }, { id: '11', x: 152, y: 10, rot: -88, lx: 0, ly: -24 },
    { id: '21', x: 178, y: 10, rot: 88, lx: 0, ly: -24 }, { id: '22', x: 202, y: 14, rot: 78, lx: 6, ly: -22 },
    { id: '23', x: 228, y: 24, rot: 65, lx: 12, ly: -18 }, { id: '24', x: 252, y: 40, rot: 50, lx: 18, ly: -14 },
    { id: '25', x: 272, y: 60, rot: 38, lx: 22, ly: -10 }, { id: '26', x: 288, y: 88, rot: 25, lx: 26, ly: -5 },
    { id: '27', x: 300, y: 120, rot: 20, lx: 28, ly: 0 }, { id: '28', x: 308, y: 155, rot: 15, lx: 28, ly: 5 },
  ],
  lower: [
    { id: '48', x: 22, y: 25, rot: 15, lx: -28, ly: -5 }, { id: '47', x: 30, y: 60, rot: 20, lx: -28, ly: 0 },
    { id: '46', x: 42, y: 92, rot: 25, lx: -26, ly: 5 }, { id: '45', x: 58, y: 120, rot: 38, lx: -22, ly: 10 },
    { id: '44', x: 78, y: 140, rot: 50, lx: -18, ly: 14 }, { id: '43', x: 102, y: 156, rot: 65, lx: -12, ly: 18 },
    { id: '42', x: 128, y: 166, rot: 78, lx: -6, ly: 22 }, { id: '41', x: 152, y: 170, rot: 88, lx: 0, ly: 24 },
    { id: '31', x: 178, y: 170, rot: -88, lx: 0, ly: 24 }, { id: '32', x: 202, y: 166, rot: -78, lx: 6, ly: 22 },
    { id: '33', x: 228, y: 156, rot: -65, lx: 12, ly: 18 }, { id: '34', x: 252, y: 140, rot: -50, lx: 18, ly: 14 },
    { id: '35', x: 272, y: 120, rot: -38, lx: 22, ly: 10 }, { id: '36', x: 288, y: 92, rot: -25, lx: 26, ly: 5 },
    { id: '37', x: 300, y: 60, rot: -20, lx: 28, ly: 0 }, { id: '38', x: 308, y: 25, rot: -15, lx: 28, ly: -5 },
  ]
};

// --- COMPONENTE DENTE ---
const AnatomicalTooth = ({ data, isSelected, groupIndex, onToggle }) => {
  const toothType = getToothType(data.id);
  const shape = TOOTH_SHAPES[toothType];
  
  // Default (Bianco)
  let colors = { fill: '#FFFFFF', stroke: '#94A3B8', detail: '#CBD5E1', num: '#1E293B' };

  if (isSelected) {
    // Selezione corrente (Blu scuro/attivo)
    colors = { fill: '#3B82F6', stroke: '#1D4ED8', detail: '#93C5FD', num: '#1E3A8A' };
  } else if (groupIndex !== undefined && groupIndex !== -1) {
    // Gruppo confermato (Colore ciclico)
    const theme = GROUP_COLORS[groupIndex % GROUP_COLORS.length];
    colors = { fill: theme.fill, stroke: theme.stroke, detail: theme.detail, num: theme.num };
  }

  let scale = toothType === 'molar' ? 1.15 : toothType === 'premolar' ? 1.05 : 1.0;

  return (
    <g 
      onClick={() => onToggle(data.id)} 
      className="cursor-pointer transition-all duration-200 hover:opacity-80"
    >
      <g>
        <circle cx={data.x + data.lx} cy={data.y + data.ly} r="11" fill={colors.num} />
        <text x={data.x + data.lx} y={data.y + data.ly + 4} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" className="pointer-events-none select-none">
          {data.id}
        </text>
      </g>
      <g transform={`translate(${data.x}, ${data.y}) rotate(${data.rot}) scale(${scale})`}>
        <path d={shape.outline} fill={colors.fill} stroke={colors.stroke} strokeWidth="1.8" />
        {shape.cusps && shape.cusps.map((cusp, i) => (
          <circle key={i} cx={cusp.cx} cy={cusp.cy} r={cusp.r} fill={isSelected ? colors.stroke : colors.fill} stroke={colors.detail} strokeWidth="0.8" />
        ))}
        <path d={shape.details} fill="none" stroke={colors.detail} strokeWidth="1" strokeLinecap="round" />
      </g>
    </g>
  );
};

// --- COMPONENTE PRINCIPALE ---
export default function VisualOdontogram({ selected = [], groups = [], onToggle }) {
  return (
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
            <svg width="340" height="200" viewBox="0 0 340 200" className="overflow-visible">
              <line x1="165" y1="0" x2="165" y2="200" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="4,4" />
              <text x="80" y="195" fill="#94A3B8" fontSize="9" fontWeight="500">{arch === 'upper' ? 'Q1' : 'Q4'}</text>
              <text x="250" y="195" fill="#94A3B8" fontSize="9" fontWeight="500">{arch === 'upper' ? 'Q2' : 'Q3'}</text>
              {DENTAL_ARCH_DATA[arch].map(tooth => {
                // Trova se il dente appartiene a un gruppo confermato
                const grpIdx = groups.findIndex(g => g.teeth.includes(tooth.id));
                return (
                  <AnatomicalTooth 
                    key={tooth.id} 
                    data={tooth} 
                    isSelected={selected.includes(tooth.id)} 
                    groupIndex={grpIdx}
                    onToggle={onToggle}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}