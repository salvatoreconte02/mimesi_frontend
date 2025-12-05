import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus, Trash2, Info, AlertTriangle, Calendar } from 'lucide-react';
import Button from '../ui/Button';
import VisualOdontogram, { checkAdjacency, GROUP_COLORS } from '../dental/VisualOdontogram';

export default function StepElements({ 
  configuredElements, setConfiguredElements, 
  technicalInfo, setTechnicalInfo, // <--- NUOVI PROPS DAL PADRE
  dates, setDates, 
  onBack, onNext 
}) {
  // Stato locale solo per la selezione temporanea dei denti nell'odontogramma
  const [selectedTeeth, setSelectedTeeth] = useState([]);

  // --- LOGICA GESTIONE DENTI ---

  const toggleTooth = (toothId) => {
    // Se il dente è già presente in un gruppo configurato, impediamo la selezione e avvisiamo
    const isAlreadyConfigured = configuredElements.some(group => group.teeth.includes(toothId));
    
    if (isAlreadyConfigured) {
      if(window.confirm("Questo elemento è già parte di un gruppo. Vuoi eliminarlo per riconfigurarlo?")) {
        // Rimuoviamo il gruppo che contiene quel dente
        setConfiguredElements(prev => prev.filter(group => !group.teeth.includes(toothId)));
      }
      return;
    }

    // Toggle selezione normale
    setSelectedTeeth(prev => 
      prev.includes(toothId) ? prev.filter(t => t !== toothId) : [...prev, toothId]
    );
  };

  const handleAddGroup = () => {
    if (selectedTeeth.length === 0) return;

    // 1. Controllo Adiacenza (Fondamentale per ponti o gruppi uniti)
    if (!checkAdjacency(selectedTeeth)) {
      alert("ATTENZIONE: Gli elementi selezionati non sono adiacenti/contigui.\n\nPer creare un ponte o un gruppo unico, gli elementi devono essere vicini (es. 11-12-13).\nSe vuoi inserire elementi distanti, aggiungili uno alla volta.");
      return;
    }

    // 2. Creazione Oggetto Gruppo
    const newGroup = {
      id: Date.now(),
      groupIndex: configuredElements.length, // Usato per il colore nell'odontogramma
      teeth: [...selectedTeeth].sort(), // Ordiniamo sempre i denti (es. 11 prima di 12)
      isBridge: selectedTeeth.length > 1 // Se più di uno, lo consideriamo unito/ponte
    };

    // 3. Aggiornamento Stato
    setConfiguredElements([...configuredElements, newGroup]);
    setSelectedTeeth([]); // Reset selezione
  };

  const removeGroup = (groupId) => {
    setConfiguredElements(prev => prev.filter(el => el.id !== groupId));
  };

  // --- LOGICA VALIDAZIONE DATE ---

  const validateDates = () => {
    if (!dates.delivery) return false;

    const dDelivery = new Date(dates.delivery);
    const dTry1 = dates.tryIn1 ? new Date(dates.tryIn1) : null;
    const dTry2 = dates.tryIn2 ? new Date(dates.tryIn2) : null;
    const dTry3 = dates.tryIn3 ? new Date(dates.tryIn3) : null;
    const now = new Date();
    now.setHours(0,0,0,0);

    // La consegna non può essere nel passato
    if (dDelivery < now) return false;

    // Controllo sequenzialità temporale (Se le prove esistono, devono essere prima della consegna e in ordine)
    if (dTry1 && dTry1 >= dDelivery) return false;
    if (dTry2 && (dTry2 >= dDelivery || (dTry1 && dTry2 <= dTry1))) return false;
    if (dTry3 && (dTry3 >= dDelivery || (dTry2 && dTry3 <= dTry2))) return false;

    return true;
  };

  const isDatesValid = validateDates();
  const canProceed = configuredElements.length > 0 && isDatesValid;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* SEZIONE 1: CONFIGURAZIONE TECNICA GLOBALE */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <h4 className="font-bold text-sm text-blue-800 mb-3 flex items-center gap-2">
            <Info size={16}/> Specifiche Tecniche Globali
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Materiale (Unico per richiesta)</label>
            <select 
                value={technicalInfo.material} 
                onChange={(e) => setTechnicalInfo({...technicalInfo, material: e.target.value})} 
                className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <option value="zirconio">Zirconio</option>
                <option value="disilicato">Disilicato di Litio</option>
                <option value="metallo_ceramica">Metallo-Ceramica</option>
                <option value="pmma">PMMA (Provvisorio)</option>
                <option value="resina">Resina Stampata</option>
            </select>
            </div>
            <div>
            <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Colore Riferimento</label>
            <select 
                value={technicalInfo.color} 
                onChange={(e) => setTechnicalInfo({...technicalInfo, color: e.target.value})} 
                className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
            >
                <optgroup label="Scala Vita A"><option>A1</option><option>A2</option><option>A3</option><option>A3.5</option><option>A4</option></optgroup>
                <optgroup label="Scala Vita B"><option>B1</option><option>B2</option><option>B3</option><option>B4</option></optgroup>
                <optgroup label="Scala Vita C"><option>C1</option><option>C2</option><option>C3</option><option>C4</option></optgroup>
                <optgroup label="Bleach"><option>BL1</option><option>BL2</option><option>BL3</option></optgroup>
            </select>
            </div>
        </div>
      </div>

      {/* SEZIONE 2: ODONTOGRAMMA E SELEZIONE */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Colonna SX: Odontogramma */}
          <div className="xl:col-span-2 bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm relative">
            <VisualOdontogram 
                selected={selectedTeeth} 
                onToggle={toggleTooth} 
                configured={configuredElements} 
            />
            {/* Overlay indicativo se nessun dente selezionato */}
            {selectedTeeth.length === 0 && (
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-neutral-500 shadow-sm border">
                    Seleziona i denti sull'immagine
                </div>
            )}
          </div>

          {/* Colonna DX: Azioni e Lista */}
          <div className="xl:col-span-1 space-y-4">
            
            {/* Box Azione Aggiungi */}
            <div className="bg-neutral-800 text-white p-5 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-neutral-400 uppercase">Selezione Corrente</span>
                    <span className="bg-neutral-700 px-2 py-1 rounded text-xs font-mono">
                        {selectedTeeth.length > 0 ? selectedTeeth.sort().join('-') : 'Nessuna'}
                    </span>
                </div>
                
                <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
                    Seleziona uno o più elementi <b>adiacenti</b> per creare un gruppo unico (o ponte). Clicca "Aggiungi" per confermare.
                </p>

                <Button 
                    variant="primary" 
                    className="w-full justify-center bg-white text-neutral-900 hover:bg-neutral-200 border-none"
                    onClick={handleAddGroup}
                    disabled={selectedTeeth.length === 0}
                >
                    <Plus size={18} className="mr-2"/> Aggiungi al Piano
                </Button>
            </div>

            {/* Lista Elementi Configurati */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-4 min-h-[200px]">
                <h5 className="font-bold text-sm text-neutral-700 mb-3">Elementi in lavorazione ({configuredElements.length})</h5>
                {configuredElements.length === 0 ? (
                    <div className="text-center py-8 text-neutral-400 text-sm italic">
                        Nessun elemento inserito.
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
                        {configuredElements.map((group) => {
                             const style = GROUP_COLORS[group.groupIndex % GROUP_COLORS.length];
                             return (
                                <div key={group.id} className={`flex items-center justify-between p-2.5 rounded-lg border text-sm ${style.bg} ${style.border}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-white/50 ${style.text}`}>
                                            {group.teeth.length}
                                        </div>
                                        <span className={`font-medium ${style.text}`}>
                                            {group.isBridge ? 'Ponte' : 'Singolo'} <b>{group.teeth.join('-')}</b>
                                        </span>
                                    </div>
                                    <button onClick={() => removeGroup(group.id)} className="text-neutral-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                             )
                        })}
                    </div>
                )}
            </div>
          </div>
      </div>

      {/* SEZIONE 3: DATE E SCADENZE */}
      <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
         <div className="flex items-start gap-3 mb-4">
             <Calendar className="text-primary mt-1" size={20} />
             <div>
                 <h4 className="font-bold text-neutral-800">Pianificazione Temporale</h4>
                 <p className="text-xs text-neutral-500">
                    Inserisci la data di consegna desiderata e le eventuali prove intermedie.
                 </p>
             </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="col-span-2 md:col-span-1">
               <label className="text-xs font-bold text-primary mb-1 block">Data Consegna (Richiesta) *</label>
               <input 
                 type="date" 
                 className={`w-full p-2 border rounded bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 ${!dates.delivery ? 'border-primary/30' : 'border-primary font-bold'}`}
                 value={dates.delivery} 
                 onChange={e => setDates({...dates, delivery: e.target.value})} 
               />
             </div>
             {[1, 2, 3].map(i => (
               <div key={i}>
                 <label className="text-xs font-bold text-neutral-500 mb-1 block">Prova {i} (Opzionale)</label>
                 <input 
                   type="date" 
                   className="w-full p-2 border border-neutral-200 rounded bg-white text-sm text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-200"
                   value={dates[`tryIn${i}`]} 
                   onChange={e => setDates({...dates, [`tryIn${i}`]: e.target.value})} 
                 />
               </div>
             ))}
         </div>

         {/* Disclaimer Obbligatorio */}
         <div className="mt-4 flex gap-2 items-start bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-yellow-800 text-xs">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <p>
                <b>Nota Importante:</b> Le date indicate sono una preferenza del Dottore. 
                L'amministrazione confermerà la fattibilità temporale o proporrà variazioni in fase di accettazione del preventivo.
                Assicurati che le date delle prove siano antecedenti alla consegna.
            </p>
         </div>
      </div>

      {/* FOOTER NAVIGAZIONE */}
      <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <div className={!canProceed ? 'opacity-50 pointer-events-none' : ''}>
             <Button onClick={onNext} disabled={!canProceed}>Avanti →</Button>
        </div>
      </div>
    </motion.div>
  );
}