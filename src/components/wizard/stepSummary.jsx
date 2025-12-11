import { motion } from 'framer-motion';
import { FileText, Send, User, Calendar, ShieldAlert, Layers, Paperclip, Activity, Box, Info } from 'lucide-react';
import Button from '../ui/Button';
import { GROUP_COLORS } from '../dental/VisualOdontogram';

// Helper per distinguere File reali da metadati
const isRealFile = (file) => {
  if (!file) return false;
  return (
    typeof file.slice === 'function' && 
    typeof file.size === 'number' && 
    'type' in file &&
    'lastModified' in file
  );
};

export default function StepSummary({ 
  formData, 
  configuredElements, 
  technicalInfo, 
  dates, 
  files, 
  photos, 
  impressionParams, 
  onBack, 
  onSubmit,
  readOnly = false,
  originalData
}) {
  
  // CALCOLO TOTALE ELEMENTI (somma di tutti i denti in tutti i gruppi)
  const totalElements = configuredElements.reduce((acc, group) => acc + group.teeth.length, 0);

  // Helper per controllare se un campo specifico è cambiato
  const getDiffStyle = (current, original, baseClass = "") => {
     if(!originalData) return baseClass;
     if(String(current) !== String(original)) {
         return `${baseClass} bg-orange-100 text-orange-900 border-orange-200 ring-2 ring-orange-200/50 rounded px-1 -mx-1 transition-all`;
     }
     return baseClass;
  };

  // Gestione fallback per totalSizeMB
  const totalSizeMB = files?.reduce((acc, file) => acc + (file.size || 0), 0) / 1024 / 1024 || 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Header Riepilogo */}
        <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
              <FileText size={20} className="text-primary"/> Scheda Prescrizione
            </h3>
            <p className="text-xs text-neutral-500 ml-7">
              Richiesta da: <span className="font-bold text-neutral-700">Dr. {formData.nomeDottore} {formData.cognomeDottore}</span> ({formData.nomeStudio})
            </p>
          </div>
          <span className="text-xs bg-white border px-2 py-1 rounded text-neutral-500 font-mono">
             {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* GRIGLIA FLUIDA (4 CELLE) */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CELLA 1 (SX, Riga 1): Anagrafica + Materiali */}
          <div className="space-y-6">
             {/* Sezione Anagrafica */}
             <div>
               <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                 <User size={16}/> Anagrafica Paziente
               </h4>
               <div className="bg-neutral-50 p-4 rounded-xl text-sm space-y-2 border border-neutral-100">
                 <div className="flex justify-between border-b border-neutral-200 pb-2 mb-2">
                    <span className="text-neutral-500">Paziente</span>
                    <span className={`font-bold text-neutral-800 ${getDiffStyle(formData.nome, originalData?.nome)}`}>
                        {formData.nome} {formData.cognome}
                    </span>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Codice</span>
                        <p className={`font-mono text-xs font-bold bg-white border rounded px-1 py-0.5 inline-block mt-0.5 ${getDiffStyle(formData.codicePaziente, originalData?.codicePaziente)}`}>
                            {formData.codicePaziente}
                        </p>
                    </div>
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase font-bold">Età / Sesso</span>
                        <p className="font-medium text-neutral-700">{formData.eta || '-'} / {formData.sesso}</p>
                    </div>
                 </div>
                 
                 {(formData.allergie || formData.bruxismo || formData.disfunzioni || formData.dispositivi || formData.handicap) && (
                   <div className="mt-3 bg-red-50 p-2 rounded border border-red-100 text-xs text-red-700 flex gap-2 items-start">
                      <Activity size={14} className="mt-0.5 shrink-0"/>
                      <span className="font-medium">
                        {[
                          formData.allergie && 'Allergie', formData.bruxismo && 'Bruxismo', 
                          formData.disfunzioni && 'Disfunzioni', formData.dispositivi && 'Dispositivi', 
                          formData.handicap && 'Handicap'
                        ].filter(Boolean).join(', ')}
                      </span>
                   </div>
                 )}
               </div>
             </div>

             {/* Sezione Materiali */}
             <div>
               <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                 <Layers size={16}/> Specifiche Materiali
               </h4>
               <div className="grid grid-cols-2 gap-3">
                  <div className={`bg-blue-50 border border-blue-100 p-3 rounded-xl ${getDiffStyle(technicalInfo.material, originalData?.technicalInfo?.material)}`}>
                      <span className="text-[10px] uppercase text-blue-400 font-bold block mb-1">Materiale</span>
                      <span className="text-sm font-bold text-blue-900 capitalize">{technicalInfo?.material?.replace('_', ' ') || 'N/A'}</span>
                  </div>
                  <div className={`bg-purple-50 border border-purple-100 p-3 rounded-xl ${getDiffStyle(technicalInfo.color, originalData?.technicalInfo?.color)}`}>
                      <span className="text-[10px] uppercase text-purple-400 font-bold block mb-1">Colore/Scala</span>
                      <span className="text-sm font-bold text-purple-900">{technicalInfo?.color || 'N/A'}</span>
                  </div>
               </div>
               {technicalInfo?.description && (
                 <div className="mt-2 text-xs text-neutral-500 italic border-l-2 border-neutral-300 pl-2">
                    "{technicalInfo.description}"
                 </div>
               )}
            </div>
          </div>

          {/* CELLA 2 (DX, Riga 1): Elementi Protesici */}
          <div className="flex flex-col">
                <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                   <ShieldAlert size={16}/> Configurazione Elementi
                   {/* MOSTRA TOTALE ELEMENTI */}
                   <span className="ml-auto flex items-center gap-2">
                       <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded text-xs">
                           {configuredElements.length} {configuredElements.length === 1 ? 'gruppo' : 'gruppi'}
                       </span>
                       <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">
                           {totalElements} {totalElements === 1 ? 'elemento' : 'elementi'}
                       </span>
                   </span>
                </h4>
                
                <div className="bg-neutral-50 rounded-xl p-2 border border-neutral-200 min-h-[220px] max-h-[300px] overflow-y-auto custom-scrollbar space-y-2">
                  {configuredElements.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-neutral-400 text-xs italic min-h-[200px]">
                          Nessun elemento configurato
                      </div>
                  ) : (
                    configuredElements.map((el, i) => {
                       const style = GROUP_COLORS[el.groupIndex % GROUP_COLORS.length];
                       return (
                          <div key={i} className={`flex gap-3 p-3 border rounded-lg bg-white relative overflow-hidden shadow-sm`}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.bg.replace('bg-', 'bg-')}`}></div>
                            
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text} mt-1`}>
                              <span className="font-bold text-xs">{el.teeth.length}</span>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-sm text-neutral-800">
                                  {el.isBridge ? `Ponte (${el.teeth.length} elem.)` : 'Elemento Singolo'} 
                                </span>
                                <span className="font-mono text-xs font-bold bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 border border-neutral-200">
                                    {el.teeth.join('-')}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-400 mt-1">
                                 Materiale: {technicalInfo.material} • Colore: {technicalInfo.color}
                              </p>
                            </div>
                          </div>
                       );
                    })
                  )}
                </div>
          </div>

          {/* CELLA 3 (SX, Riga 2): Allegati */}
          <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                    <Paperclip size={16}/> Allegati & Impronta
                </h4>
                
                <div className="space-y-3">
                    {/* Lista File */}
                    <div className="bg-neutral-50 rounded-xl border border-neutral-100 overflow-hidden">
                        <div className="bg-neutral-100/50 px-3 py-2 flex justify-between items-center border-b border-neutral-200/50">
                            <span className="text-xs font-bold text-neutral-600">File Scansione 3D</span>
                            <span className="text-[10px] bg-white border px-1.5 rounded text-neutral-400">{files?.length || 0} files • {totalSizeMB.toFixed(1)} MB</span>
                        </div>
                        <div className="p-2 space-y-1">
                            {files && files.length > 0 ? files.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700 px-1">
                                    <Box size={14} className="text-blue-400 shrink-0"/>
                                    <span className="truncate font-mono">{file.name}</span>
                                </div>
                            )) : <div className="text-[10px] text-neutral-400 italic p-1">Nessun file caricato</div>}
                        </div>
                    </div>

                    {/* Parametri Impronta */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div className={`bg-white p-2 rounded border border-neutral-200 shadow-sm ${getDiffStyle(impressionParams.material, originalData?.impressionParams?.material)}`}>
                                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Rilevazione</span>
                                <span className="font-medium text-neutral-700 capitalize">{impressionParams.material?.replace('_', ' ') || '-'}</span>
                            </div>
                            <div className={`bg-white p-2 rounded border border-neutral-200 shadow-sm ${getDiffStyle(impressionParams.disinfection, originalData?.impressionParams?.disinfection)}`}>
                                <span className="text-neutral-400 block text-[10px] uppercase font-bold">Disinfezione</span>
                                <span className="font-medium text-neutral-700 capitalize">{impressionParams.disinfection?.replace('_', ' ') || '-'}</span>
                            </div>
                    </div>
                </div>
          </div>

          {/* CELLA 4 (DX, Riga 2): Date */}
          <div>
               <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                 <Calendar size={16}/> Pianificazione Temporale
               </h4>
               
               <div className="space-y-3">
                   {/* Data Consegna Principale */}
                   <div className={`bg-green-50 border border-green-200 p-3 rounded-xl flex justify-between items-center ${getDiffStyle(dates.delivery, originalData?.dates?.delivery)}`}>
                       <div>
                           <span className="block text-[10px] text-green-600 font-bold uppercase tracking-wider">Consegna Finale</span>
                           <span className="font-bold text-green-800 text-lg">
                               {dates.delivery ? new Date(dates.delivery).toLocaleDateString() : 'Non specificata'}
                           </span>
                       </div>
                       <Calendar className="text-green-300" size={24} />
                   </div>

                   {/* Griglia Prove Intermedie */}
                   {(dates.tryIn1 || dates.tryIn2 || dates.tryIn3) && (
                       <div className="grid grid-cols-3 gap-2">
                           {[1, 2, 3].map((num) => {
                               const dateVal = dates[`tryIn${num}`];
                               if (!dateVal) return null;
                               return (
                                   <div key={num} className={`bg-white border border-dashed border-neutral-300 p-2 rounded-xl text-center ${getDiffStyle(dateVal, originalData?.dates?.[`tryIn${num}`])}`}>
                                       <span className="block text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Prova {num}</span>
                                       <span className="font-medium text-neutral-700 text-xs">
                                           {new Date(dateVal).toLocaleDateString()}
                                       </span>
                                   </div>
                               );
                           })}
                       </div>
                   )}
                   {(!dates.tryIn1 && !dates.tryIn2 && !dates.tryIn3) && (
                       <div className="text-center p-4 border border-dashed border-neutral-200 rounded-xl text-xs text-neutral-400">
                           Nessuna prova intermedia programmata
                       </div>
                   )}
               </div>
          </div>

        </div>
      </div>

      {/* FOOTER - VISIBILE SOLO SE NON READONLY */}
      {!readOnly && (
        <>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3 items-start">
                <Info size={20} className="text-yellow-600 mt-0.5 shrink-0" />
                <p className="text-sm text-yellow-800">
                Confermando, la richiesta verrà inviata all'Amministrazione per la validazione. Riceverai una notifica quando il preventivo sarà pronto.
                </p>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
                <Button variant="ghost" onClick={onBack}>← Indietro</Button>
                <Button variant="gradient" onClick={() => onSubmit()} className="pl-6 pr-6 shadow-xl shadow-primary/20">
                <Send size={18} className="mr-2" /> Conferma Ordine
                </Button>
            </div>
        </>
      )}
    </motion.div>
  );
}