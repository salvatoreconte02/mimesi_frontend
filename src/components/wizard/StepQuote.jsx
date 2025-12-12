import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Truck, Receipt, ArrowRight, Edit3, Check, Euro } from 'lucide-react';
import Button from '../ui/Button';
import { GROUP_COLORS } from '../dental/VisualOdontogram';

// Prezzi base per materiale
const BASE_PRICES = { 
  'zirconio': 120, 
  'disilicato': 140, 
  'metallo_ceramica': 100, 
  'pmma': 50, 
  'resina': 40 
};

const SHIPMENT_COST = 8;

export default function StepQuote({ data, quote, setQuote, onBack, onNext, hideNavigation = false }) {
  // Stato per i prezzi personalizzati di ogni gruppo
  const [groupPrices, setGroupPrices] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);

  // Inizializza i prezzi al caricamento
  useEffect(() => {
    const mat = data.technicalInfo?.material || 'zirconio';
    const basePrice = BASE_PRICES[mat] || 100;
    
    // Crea un array di prezzi per ogni gruppo
    const initialPrices = (data.elements || []).map((group, idx) => ({
      groupId: group.id || idx,
      groupIndex: group.groupIndex ?? idx,
      teeth: group.teeth || [],
      isBridge: group.isBridge,
      unitPrice: basePrice,
      elementCount: group.teeth?.length || 0
    }));
    
    setGroupPrices(initialPrices);
  }, [data.elements, data.technicalInfo?.material]);

  // Calcola spedizioni
  const getShipmentCount = () => {
    let count = 1; // Delivery
    if (data.dates?.tryIn1) count++;
    if (data.dates?.tryIn2) count++;
    if (data.dates?.tryIn3) count++;
    return count;
  };

  // Calcola totali
  const calculateTotals = () => {
    const elementsTotal = groupPrices.reduce((acc, group) => {
      return acc + (group.unitPrice * group.elementCount);
    }, 0);
    
    const shipmentCount = getShipmentCount();
    const shipmentTotal = shipmentCount * SHIPMENT_COST;
    const totalElements = groupPrices.reduce((acc, g) => acc + g.elementCount, 0);
    
    return {
      elementsTotal,
      shipmentCount,
      shipmentTotal,
      totalElements,
      grandTotal: elementsTotal + shipmentTotal
    };
  };

  const totals = calculateTotals();

  // Aggiorna il quote quando cambiano i prezzi
  useEffect(() => {
    const t = calculateTotals();
    setQuote({
      elementCount: t.totalElements,
      groupCount: groupPrices.length,
      shipmentCount: t.shipmentCount,
      shipmentTotal: t.shipmentTotal,
      elementsTotal: t.elementsTotal,
      total: t.grandTotal,
      groupPrices: groupPrices // Salva i prezzi dettagliati
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupPrices]);

  // Aggiorna prezzo di un gruppo
  const updateGroupPrice = (groupId, newPrice) => {
    setGroupPrices(prev => prev.map(g => 
      g.groupId === groupId ? { ...g, unitPrice: Number(newPrice) || 0 } : g
    ));
  };

  const materialLabel = data.technicalInfo?.material?.replace('_', ' ') || 'N/D';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* HEADER - Nascosto se dentro DocumentPreview */}
      {!hideNavigation && (
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Calculator className="text-primary" size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-neutral-800">Definizione Preventivo</h3>
            <p className="text-sm text-neutral-500">
              {totals.totalElements} elementi in {materialLabel} • {groupPrices.length} {groupPrices.length === 1 ? 'gruppo' : 'gruppi'}
            </p>
          </div>
        </div>
      )}

      {/* SEZIONE ELEMENTI */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200 flex justify-between items-center">
          <h4 className="font-bold text-sm text-neutral-700 flex items-center gap-2">
            <Receipt size={16} className="text-primary" /> Dettaglio Elementi
          </h4>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-lg font-bold">
            {totals.totalElements} elem.
          </span>
        </div>

        <div className="p-4 space-y-3">
          {groupPrices.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Nessun elemento configurato
            </div>
          ) : (
            groupPrices.map((group, idx) => {
              const style = GROUP_COLORS[group.groupIndex % GROUP_COLORS.length];
              const isEditing = editingGroupId === group.groupId;
              const subtotal = group.unitPrice * group.elementCount;

              return (
                <motion.div
                  key={group.groupId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white border rounded-xl p-4 relative overflow-hidden transition-all ${
                    isEditing ? 'ring-2 ring-primary shadow-lg' : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Barra colorata laterale */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bg}`} />

                  <div className="flex items-center gap-4 pl-3">
                    {/* Badge gruppo */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                      <span className="font-bold text-sm">{group.elementCount}</span>
                    </div>

                    {/* Info gruppo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-800">
                          {group.isBridge ? `Ponte` : 'Singolo'}
                        </span>
                        <span className="text-xs text-neutral-400">•</span>
                        <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {group.teeth.join('-')}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {group.elementCount} {group.elementCount === 1 ? 'elemento' : 'elementi'} in {materialLabel}
                      </p>
                    </div>

                    {/* Prezzo unitario (modificabile) */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Prezzo/elem.</span>
                        {isEditing ? (
                          <div className="flex items-center gap-1 mt-1">
                            <Euro size={14} className="text-neutral-400" />
                            <input
                              type="number"
                              value={group.unitPrice}
                              onChange={(e) => updateGroupPrice(group.groupId, e.target.value)}
                              className="w-20 p-1 text-right font-bold text-neutral-800 border border-primary rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                              autoFocus
                              onKeyDown={(e) => e.key === 'Enter' && setEditingGroupId(null)}
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-neutral-800">€ {group.unitPrice.toFixed(2)}</span>
                        )}
                      </div>

                      {/* Bottone modifica */}
                      <button
                        onClick={() => setEditingGroupId(isEditing ? null : group.groupId)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isEditing 
                            ? 'bg-primary text-white' 
                            : 'bg-neutral-100 text-neutral-400 hover:bg-primary/10 hover:text-primary'
                        }`}
                      >
                        {isEditing ? <Check size={16} /> : <Edit3 size={14} />}
                      </button>

                      {/* Subtotale */}
                      <div className="w-24 text-right pl-3 border-l border-neutral-100">
                        <span className="text-[10px] text-neutral-400 uppercase font-bold block">Subtotale</span>
                        <span className={`font-bold ${style.text}`}>€ {subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Subtotale elementi */}
        <div className="bg-neutral-50 px-5 py-3 border-t border-neutral-200 flex justify-between items-center">
          <span className="text-sm text-neutral-600">Subtotale Elementi</span>
          <span className="font-bold text-neutral-800">€ {totals.elementsTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* SEZIONE SPEDIZIONI */}
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-neutral-50 px-5 py-3 border-b border-neutral-200">
          <h4 className="font-bold text-sm text-neutral-700 flex items-center gap-2">
            <Truck size={16} className="text-blue-500" /> Logistica e Spedizioni
          </h4>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Truck size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-blue-900">{totals.shipmentCount} Spedizioni (A/R)</p>
                <p className="text-xs text-blue-600">
                  1 consegna {data.dates?.tryIn1 && '+ prova 1'} {data.dates?.tryIn2 && '+ prova 2'} {data.dates?.tryIn3 && '+ prova 3'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-400 block">€ {SHIPMENT_COST}/cad</span>
              <span className="font-bold text-blue-800">€ {totals.shipmentTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CARD TOTALE CON COLORI MIMESI --- */}
      <div className="bg-mimesi-gradient rounded-2xl p-6 text-white shadow-xl shadow-primary/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-blue-100 uppercase font-bold tracking-widest">Totale Preventivo</p>
            <p className="text-4xl font-bold mt-1">€ {totals.grandTotal.toFixed(2)}</p>
          </div>
          <div className="bg-white/20 rounded-xl px-4 py-2 text-right backdrop-blur-sm border border-white/10">
            <p className="text-xs text-blue-50">Elementi</p>
            <p className="font-bold">{totals.totalElements}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-100">Lavorazione</span>
            <span className="font-medium">€ {totals.elementsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-100">Spedizioni</span>
            <span className="font-medium">€ {totals.shipmentTotal.toFixed(2)}</span>
          </div>
        </div>

        {!hideNavigation && (
          <p className="text-xs text-blue-100 mt-4 pt-4 border-t border-white/20 opacity-80">
            Cliccando avanti genererai il documento PDF pronto per l'approvazione o l'invio al dottore.
          </p>
        )}
      </div>

      {/* FOOTER NAVIGAZIONE - Nascosto se hideNavigation */}
      {!hideNavigation && (
        <div className="flex justify-between pt-4 border-t border-neutral-100">
          <Button variant="ghost" onClick={onBack}>← Indietro</Button>
          <Button onClick={onNext}>
            Genera Documento <ArrowRight size={18} className="ml-2"/>
          </Button>
        </div>
      )}
    </motion.div>
  );
}