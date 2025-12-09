import { User, Layers, Info, FileText, Box, Image as ImageIcon, Calendar } from 'lucide-react';

export default function RiepilogoScheda({ data }) {
    if(!data) return null;

    // Gestione array vuoti per sicurezza
    const filesMeta = data.filesMetadata || [];
    const photosMeta = data.photosMetadata || [];
    const configuredElements = data.elements || [];

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Header Scheda Interno */}
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-700">Dettaglio Prescrizione</h3>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* CELLA 1: Anagrafica + Materiali */}
                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                            <User size={14}/> Dati Paziente
                        </h4>
                        <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs text-neutral-500">Paziente</span>
                                <span className="font-bold text-sm text-neutral-800">{data.nome} {data.cognome}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-xs text-neutral-500">Codice</span>
                                <span className="font-mono text-xs bg-white px-2 rounded border">{data.codicePaziente}</span>
                            </div>
                            {(data.allergie || data.bruxismo) && (
                                <div className="mt-3 pt-2 border-t border-neutral-200 text-xs text-red-500 font-medium">
                                    ⚠ Note: {[data.allergie && 'Allergie', data.bruxismo && 'Bruxismo'].filter(Boolean).join(', ')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                            <Layers size={14}/> Materiali
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
                                <span className="block text-[9px] text-blue-400 uppercase font-bold">Materiale</span>
                                <span className="text-sm font-bold text-blue-800 capitalize">{data.technicalInfo?.material?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex-1 bg-purple-50 px-3 py-2 rounded-lg border border-purple-100">
                                <span className="block text-[9px] text-purple-400 uppercase font-bold">Colore</span>
                                <span className="text-sm font-bold text-purple-800">{data.technicalInfo?.color}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CELLA 2: Elementi */}
                <div className="flex flex-col">
                    <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <Info size={14}/> Configurazione Elementi
                    </h4>
                    <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-200 flex-1 min-h-[150px] space-y-2">
                        {configuredElements.map((el, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-white rounded-lg border border-neutral-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-bold">
                                        {el.teeth.length}
                                    </div>
                                    <div>
                                        <p className="font-bold text-xs text-neutral-700">{el.isBridge ? 'Ponte' : 'Singolo'}</p>
                                        <p className="text-[10px] text-neutral-400">{el.teeth.join('-')}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CELLA 3: File */}
                <div>
                     <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <FileText size={14}/> File & Impronta
                     </h4>
                     <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-2">
                        {filesMeta.length > 0 ? (
                            <ul className="space-y-1">
                                {filesMeta.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-xs text-neutral-600">
                                        <Box size={12} className="text-blue-500"/> <span className="truncate">{f.name}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <span className="text-xs text-neutral-400 italic">Nessun file 3D</span>}
                        
                        {photosMeta.length > 0 && (
                            <div className="pt-2 border-t border-neutral-200 text-xs font-medium text-neutral-600 flex items-center gap-1">
                                <ImageIcon size={12}/> {photosMeta.length} Foto allegate
                            </div>
                        )}
                        
                        <div className="pt-2 border-t border-neutral-200 grid grid-cols-2 gap-2">
                            <div>
                                <span className="text-[9px] text-neutral-400 block uppercase">Rilevazione</span>
                                <span className="text-xs font-medium capitalize">{data.impressionParams?.material?.replace('_', ' ') || '-'}</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-neutral-400 block uppercase">Disinfezione</span>
                                <span className="text-xs font-medium capitalize">{data.impressionParams?.disinfection?.replace('_', ' ') || '-'}</span>
                            </div>
                        </div>
                     </div>
                </div>

                {/* CELLA 4: Date */}
                <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
                        <Calendar size={14}/> Pianificazione
                    </h4>
                    <div className="space-y-2">
                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-green-700">Consegna</span>
                            <span className="font-bold text-green-800">{data.dates?.delivery ? new Date(data.dates.delivery).toLocaleDateString() : '-'}</span>
                        </div>
                        <div className="flex gap-2">
                            {[1,2,3].map(i => data.dates?.[`tryIn${i}`] && (
                                <div key={i} className="flex-1 bg-white border border-dashed border-neutral-300 p-2 rounded-lg text-center">
                                    <span className="block text-[9px] text-neutral-400 uppercase font-bold">Prova {i}</span>
                                    <span className="text-xs font-medium text-neutral-700">{new Date(data.dates[`tryIn${i}`]).toLocaleDateString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}