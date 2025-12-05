import { motion } from 'framer-motion';
import { FileText, Send, User, Calendar, ShieldAlert, Info } from 'lucide-react';
import Button from '../ui/Button';
import { GROUP_COLORS } from '../dental/VisualOdontogram';

export default function StepSummary({ formData, configuredElements, dates, onBack, onSubmit }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header Riepilogo */}
        <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex justify-between items-center">
          <h3 className="font-bold text-lg text-neutral-800 flex items-center gap-2">
            <FileText size={20} className="text-primary"/> Scheda Prescrizione
          </h3>
          <span className="text-xs bg-white border px-2 py-1 rounded text-neutral-500">
             {new Date().toLocaleDateString()}
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Colonna 1: Anagrafica e Date */}
          <div className="space-y-6">
            <div>
               <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                 <User size={16}/> Dati Paziente
               </h4>
               <div className="bg-neutral-50 p-3 rounded-lg text-sm space-y-2 border border-neutral-100">
                 <div className="flex justify-between">
                    <span className="text-neutral-500">Paziente</span>
                    <span className="font-medium">{formData.nome} {formData.cognome}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-neutral-500">Codice Interno</span>
                    <span className="font-mono bg-white px-2 py-0.5 border rounded text-xs">{formData.codicePaziente}</span>
                 </div>
                 <div className="flex justify-between">
                    <span className="text-neutral-500">Età / Sesso</span>
                    <span>{formData.eta || '-'} / {formData.sesso}</span>
                 </div>
                 <div className="pt-2 mt-2 border-t border-neutral-200/50 text-xs text-neutral-500">
                    <span className="font-bold">Note Cliniche:</span> {[
                      formData.allergie && 'Allergie', formData.bruxismo && 'Bruxismo', 
                      formData.disfunzioni && 'Disfunzioni', formData.dispositivi && 'Dispositivi', 
                      formData.handicap && 'Handicap'
                    ].filter(Boolean).join(', ') || 'Nessuna specifica'}
                 </div>
               </div>
            </div>

            <div>
               <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
                 <Calendar size={16}/> Pianificazione
               </h4>
               <div className="grid grid-cols-2 gap-2">
                 <div className="bg-primary/5 border border-primary/20 p-2 rounded text-center">
                   <span className="block text-[10px] text-primary font-bold uppercase tracking-wider">Consegna</span>
                   <span className="font-bold text-neutral-800 text-sm">{dates.delivery}</span>
                 </div>
                 {dates.tryIn1 && (
                    <div className="bg-white border border-neutral-200 p-2 rounded text-center">
                        <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Prova 1</span>
                        <span className="font-medium text-neutral-600 text-sm">{dates.tryIn1}</span>
                    </div>
                 )}
               </div>
            </div>
          </div>

          {/* Colonna 2: Elementi Protesici */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-primary mb-3 pb-1 border-b border-primary/10">
               <ShieldAlert size={16}/> Configurazione Protesica
            </h4>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {configuredElements.map((el, i) => {
                 const style = GROUP_COLORS[el.groupIndex % GROUP_COLORS.length];
                 return (
                    <div key={i} className={`flex gap-3 p-3 border rounded-xl bg-white hover:shadow-md transition-shadow relative overflow-hidden`}>
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg.replace('bg-', 'bg-')}`}></div>
                      
                      {/* Icona Tipo */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                        <span className="font-bold text-xs">{el.teeth.length}el</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-sm text-neutral-800">
                            {el.isBridge ? 'Ponte' : 'Elemento'} <span className="font-mono text-xs bg-neutral-100 px-1 rounded ml-1">{el.teeth.join('-')}</span>
                          </span>
                        </div>
                        <div className="text-xs text-neutral-500 mt-1 flex flex-wrap gap-2">
                           <span className="bg-neutral-50 px-1.5 py-0.5 rounded border">Mat: <b className="text-neutral-700">{el.material}</b></span>
                           <span className="bg-neutral-50 px-1.5 py-0.5 rounded border">Col: <b className="text-neutral-700">{el.color}</b></span>
                        </div>
                        {el.description && (
                            <p className="text-[10px] text-neutral-400 mt-1 italic line-clamp-1">"{el.description}"</p>
                        )}
                      </div>
                    </div>
                 );
              })}
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
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <Button variant="gradient" onClick={onSubmit} className="pl-6 pr-6 shadow-xl shadow-primary/20">
           <Send size={18} className="mr-2" /> Conferma Ordine
        </Button>
      </div>
    </motion.div>
  );
}