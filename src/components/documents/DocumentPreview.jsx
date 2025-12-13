import { User, Layers, Calendar, Info, FileText, PenTool, Calculator } from 'lucide-react';
import { GROUP_COLORS } from '../dental/VisualOdontogram'; 
import StepQuote from '../wizard/StepQuote';

export default function DocumentPreview({ data, quote, setQuote }) {
  const pageStyle = "w-[595px] min-h-[842px] bg-white shadow-xl mx-auto mb-8 p-10 text-neutral-800 relative text-sm flex flex-col";
  const headerStyle = "border-b border-neutral-200 pb-4 mb-6 flex justify-between items-center bg-neutral-50 -mx-10 -mt-10 p-10";

  // Valori sicuri per evitare crash
  const safeQuote = {
    total: quote?.total || 0,
    elementsTotal: quote?.elementsTotal || 0,
    shipmentTotal: quote?.shipmentTotal || 0,
    shipmentCount: quote?.shipmentCount || 1,
    elementCount: quote?.elementCount || 0,
    groupCount: quote?.groupCount || 0,
    groupPrices: quote?.groupPrices || []
  };

  const materialLabel = data?.technicalInfo?.material?.replace(/_/g, ' ') || 'N/D';

  // Prepara i dati per StepQuote
  const stepQuoteData = {
    formData: data,
    technicalInfo: data?.technicalInfo || { material: 'zirconio', color: 'A2' },
    elements: data?.elements || [],
    dates: data?.dates || {}
  };

  return (
    <div className="flex flex-col items-center">
        {/* PAGINA 1: SCHEDA TECNICA */}
        <div className={pageStyle}>
            <div className={headerStyle}>
                <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><FileText size={24}/> Scheda Produzione</h1>
                    <p className="text-xs text-neutral-500 mt-1">Documento Tecnico Validato</p>
                </div>
                <div className="text-right">
                    <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded font-mono">RIF: {data?.id || 'BOZZA'}</span>
                    <p className="text-[10px] text-neutral-400 mt-1">{new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6 flex-1 content-start">
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-primary/10 pb-1"><User size={14}/> Anagrafica</h4>
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 text-sm">
                        <div className="flex justify-between mb-2"><span className="text-neutral-500">Paziente</span><span className="font-bold">{data?.cognome} {data?.nome}</span></div>
                        <div className="flex justify-between mb-2"><span className="text-neutral-500">Dottore</span><span className="font-bold">Dr. {data?.nomeDottore} {data?.cognomeDottore}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Codice</span><span className="font-mono bg-white px-2 rounded border text-xs">{data?.codicePaziente || '-'}</span></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-primary/10 pb-1"><Layers size={14}/> Specifiche</h4>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <span className="block text-[9px] text-blue-400 uppercase font-bold mb-1">Materiale</span>
                            <span className="text-[11px] font-bold text-blue-900 capitalize break-words leading-tight block">
                                {materialLabel}
                            </span>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                            <span className="block text-[9px] text-purple-400 uppercase font-bold mb-1">Colore</span>
                            <span className="text-xs font-bold text-purple-900">{data?.technicalInfo?.color || '-'}</span>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 space-y-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-primary/10 pb-1"><Info size={14}/> Configurazione ({data?.elements?.length || 0} gruppi, {safeQuote.elementCount} elementi)</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {(data?.elements || []).map((el, i) => {
                            const style = GROUP_COLORS[(el.groupIndex || i) % GROUP_COLORS.length] || GROUP_COLORS[0];
                            return (
                                <div key={i} className="flex gap-3 p-3 border rounded-lg bg-white relative overflow-hidden shadow-sm">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg}`}></div>
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                                        <span className="font-bold text-[10px]">{el.teeth?.length || 0}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-neutral-800">{el.isBridge ? 'Ponte' : 'Singolo'}</p>
                                        <p className="font-mono text-[10px] text-neutral-500">{el.teeth?.join('-') || '-'}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="col-span-2 space-y-4">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-primary uppercase border-b border-primary/10 pb-1"><Calendar size={14}/> Pianificazione</h4>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-green-50 border border-green-200 p-3 rounded-xl flex justify-between items-center">
                            <div>
                                <span className="block text-[9px] text-green-600 font-bold uppercase">Consegna</span>
                                <span className="font-bold text-green-800 text-lg">
                                    {data?.dates?.delivery ? new Date(data.dates.delivery).toLocaleDateString() : '-'}
                                </span>
                            </div>
                        </div>
                        {data?.dates?.tryIn1 && (
                            <div className="flex-1 bg-white border border-dashed border-neutral-300 p-3 rounded-xl text-center">
                                <span className="block text-[9px] text-neutral-400 font-bold uppercase">Prova 1</span>
                                <span className="font-medium text-neutral-700">{new Date(data.dates.tryIn1).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-auto text-center text-[10px] text-neutral-400 border-t pt-2">Pagina 1 di 3 • Scheda Tecnica</div>
        </div>

        {/* PAGINA 2: PREVENTIVO CON STEPQUOTE */}
        <div className="w-[650px] bg-white shadow-xl mx-auto mb-8 rounded-2xl overflow-hidden">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Calculator size={24} className="text-primary" />
                    <div>
                        <h1 className="text-xl font-bold text-neutral-800">Preventivo</h1>
                        <p className="text-xs text-neutral-500">Modifica i prezzi se necessario prima dell'approvazione</p>
                    </div>
                </div>
                <span className="bg-neutral-800 text-white text-xs px-2 py-1 rounded font-mono">RIF: {data?.id || 'BOZZA'}</span>
            </div>
            <div className="p-6">
                <StepQuote 
                    data={stepQuoteData}
                    quote={quote}
                    setQuote={setQuote || (() => {})}
                    onBack={() => {}}
                    onNext={() => {}}
                    hideNavigation={true}
                />
            </div>
        </div>

        {/* PAGINA 3: APPROVAZIONE */}
        <div className={pageStyle}>
            <div className={headerStyle}>
                 <div>
                    <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><PenTool size={24}/> Approvazione</h1>
                    <p className="text-xs text-neutral-500 mt-1">Conferma Ordine</p>
                </div>
            </div>
            <div className="space-y-12 mt-8 flex-1">
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900 leading-relaxed text-justify">
                    Il sottoscritto <b>Dr. {data?.nomeDottore} {data?.cognomeDottore}</b>, presa visione della scheda tecnica (pag. 1) e del preventivo economico (pag. 2), 
                    accetta integralmente le specifiche e i costi. Si autorizza Mimesi Lab a procedere con la realizzazione del dispositivo.
                </div>
                
                {/* Riepilogo Totale */}
                <div className="bg-neutral-900 text-white p-6 rounded-xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xs text-neutral-400 uppercase font-bold">Totale Ordine da Approvare</p>
                            <p className="text-3xl font-bold mt-1">€ {safeQuote.total.toFixed(2)}</p>
                        </div>
                        <div className="text-right text-sm">
                            <p className="text-neutral-400">{safeQuote.elementCount} elementi</p>
                            <p className="text-neutral-400">{safeQuote.shipmentCount} spedizioni</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12">
                    <div className="border-t-2 border-dashed border-neutral-300 pt-4">
                        <p className="font-bold text-neutral-700 mb-8 uppercase text-xs tracking-wider">Timbro e Firma Clinico</p>
                        <div className="h-32 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-300">Firma qui</div>
                    </div>
                    <div className="border-t-2 border-dashed border-neutral-300 pt-4">
                        <p className="font-bold text-neutral-700 mb-8 uppercase text-xs tracking-wider">Validazione Laboratorio</p>
                        <div className="h-32 flex flex-col justify-center gap-2">
                            <div className="text-2xl font-script text-neutral-600 italic">Mimesi Lab Admin</div>
                            <div className="text-[10px] text-neutral-400 uppercase">Approvato digitalmente il {new Date().toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-auto text-center text-[10px] text-neutral-400 border-t pt-2">Pagina 3 di 3 • Firma e Accettazione</div>
        </div>
    </div>
  );
}