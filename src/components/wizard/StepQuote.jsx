import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';

// Prezzi mock
const PRICES = { 'zirconio': 120, 'disilicato': 140, 'metallo_ceramica': 100, 'pmma': 50, 'resina': 40 };
const SHIPMENT_COST = 8;

export default function StepQuote({ data, quote, setQuote, onBack, onNext }) {
    
    // Calcolo automatico all'ingresso
    useEffect(() => {
        const mat = data.technicalInfo?.material || 'zirconio';
        const basePrice = PRICES[mat] || 100;
        
        // CALCOLO CORRETTO: somma di tutti i denti in tutti i gruppi
        const elementCount = data.elements.reduce((acc, el) => acc + el.teeth.length, 0);
        
        // Calcolo spedizioni
        let datesCount = 1; // Delivery
        if (data.dates.tryIn1) datesCount++;
        if (data.dates.tryIn2) datesCount++;
        if (data.dates.tryIn3) datesCount++;
        
        const shipmentTotal = datesCount * SHIPMENT_COST;
        const subTotal = (elementCount * basePrice) + shipmentTotal;

        // Mantiene l'aggiustamento manuale se esiste, altrimenti 0
        const manualAdj = quote.manualAdjustment || 0;

        setQuote({
            basePrice,
            elementCount,
            groupCount: data.elements.length, // Numero di gruppi per info
            shipmentCount: datesCount,
            shipmentTotal,
            manualAdjustment: manualAdj,
            total: subTotal + Number(manualAdj)
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]); // Ricalcola se cambiano i dati a monte

    const updateManualAdjustment = (val) => {
        const manualAdj = Number(val);
        const subTotal = (quote.elementCount * quote.basePrice) + quote.shipmentTotal;
        setQuote(prev => ({
            ...prev,
            manualAdjustment: manualAdj,
            total: subTotal + manualAdj
        }));
    };

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                <h3 className="font-bold text-lg text-neutral-800 mb-6 flex items-center gap-2">
                    <Calculator className="text-primary"/> Definizione Preventivo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Dettagli Calcolo */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <p className="text-xs font-bold text-neutral-500 uppercase">Lavorazione</p>
                                <p className="text-sm font-medium">
                                    {quote.elementCount} elem. in {data.technicalInfo.material?.replace('_', ' ')}
                                </p>
                                <p className="text-[10px] text-neutral-400">
                                    ({quote.groupCount || data.elements.length} {(quote.groupCount || data.elements.length) === 1 ? 'gruppo' : 'gruppi'})
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-neutral-400">x € {quote.basePrice}</p>
                                <p className="font-bold">€ {(quote.elementCount * quote.basePrice).toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                            <div>
                                <p className="text-xs font-bold text-neutral-500 uppercase">Logistica</p>
                                <p className="text-sm font-medium">{quote.shipmentCount} Spedizioni (A/R)</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-neutral-400">x € {SHIPMENT_COST}</p>
                                <p className="font-bold">€ {quote.shipmentTotal?.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="p-3 border border-neutral-200 rounded-lg">
                            <label className="text-xs font-bold text-neutral-500 uppercase mb-1 block">Variazione Manuale (Sconto/Extra)</label>
                            <div className="flex items-center gap-2">
                                <DollarSign size={16} className="text-neutral-400"/>
                                <input 
                                    type="number" 
                                    className="w-full bg-transparent outline-none font-bold text-neutral-800"
                                    placeholder="0.00"
                                    value={quote.manualAdjustment}
                                    onChange={(e) => updateManualAdjustment(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Totale */}
                    <div className="bg-neutral-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-lg">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold tracking-widest">Totale Preventivato</p>
                            <p className="text-4xl font-bold mt-2">€ {quote.total?.toFixed(2)}</p>
                            <p className="text-xs text-neutral-500 mt-2">
                                {quote.elementCount} elementi × € {quote.basePrice} + € {quote.shipmentTotal?.toFixed(2)} spedizioni
                                {quote.manualAdjustment !== 0 && ` ${quote.manualAdjustment > 0 ? '+' : ''} € ${quote.manualAdjustment}`}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-white/10 text-xs text-neutral-400">
                            Cliccando avanti genererai il documento PDF unificato pronto per la firma o l'invio.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-neutral-100">
                <Button variant="ghost" onClick={onBack}>← Indietro</Button>
                <Button onClick={onNext}>
                   Genera Documento <ArrowRight size={18} className="ml-2"/>
                </Button>
            </div>
        </motion.div>
    );
}