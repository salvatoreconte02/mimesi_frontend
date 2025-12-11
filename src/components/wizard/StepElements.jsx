import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Info, AlertTriangle, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import VisualOdontogram, { checkAdjacency, GROUP_COLORS } from '../dental/VisualOdontogram';

export default function StepElements({ 
  configuredElements, setConfiguredElements, 
  technicalInfo, setTechnicalInfo, 
  dates, setDates, 
  onBack, onNext,
  isAdmin,
  originalData
}) {
  const [selectedTeeth, setSelectedTeeth] = useState([]);

  // --- HELPER PER IL DIFF VISIVO ---
  // Confronta il valore corrente con quello originale e applica lo stile arancione se diverso
  const getDiffClass = (objName, fieldName) => {
    if (!isAdmin || !originalData || !originalData[objName]) return 'border-blue-200 bg-white';
    
    // Recupera il valore attuale
    const currentVal = fieldName ? (objName === 'dates' ? dates[fieldName] : technicalInfo[fieldName]) : null;
    // Recupera il valore originale
    const originalVal = originalData[objName][fieldName];

    // Confronto lasco (String) per sicurezza su date e numeri
    if (String(currentVal) !== String(originalVal)) {
        return 'border-orange-300 bg-orange-50 ring-1 ring-orange-200 text-orange-900 font-bold';
    }
    return 'border-blue-200 bg-white';
  };

  // Check specifico per l'array degli elementi (se è cambiata la struttura o il contenuto)
  const elementsChanged = isAdmin && originalData && JSON.stringify(configuredElements) !== JSON.stringify(originalData.elements);

  // --- LOGICA GESTIONE DENTI ---
  const toggleTooth = (toothId) => {
    const isAlreadyConfigured = configuredElements.some(group => group.teeth.includes(toothId));
    
    if (isAlreadyConfigured) {
      if(window.confirm("Questo elemento è già parte di un gruppo. Vuoi eliminarlo per riconfigurarlo?")) {
        setConfiguredElements(prev => prev.filter(group => !group.teeth.includes(toothId)));
      }
      return;
    }

    setSelectedTeeth(prev => 
      prev.includes(toothId) ? prev.filter(t => t !== toothId) : [...prev, toothId]
    );
  };

  const handleAddGroup = () => {
    if (selectedTeeth.length === 0) return;

    if (!checkAdjacency(selectedTeeth)) {
      alert("ATTENZIONE: Gli elementi selezionati non sono adiacenti.\nPer creare un ponte, gli elementi devono essere vicini.");
      return;
    }

    const newGroup = {
      id: Date.now(),
      groupIndex: configuredElements.length, 
      teeth: [...selectedTeeth].sort(), 
      isBridge: selectedTeeth.length > 1
    };

    setConfiguredElements([...configuredElements, newGroup]);
    setSelectedTeeth([]); 
  };

  const removeGroup = (groupId) => {
    setConfiguredElements(prev => prev.filter(el => el.id !== groupId));
  };

  // --- LOGICA VALIDAZIONE ---
  const validateDates = () => {
    if (!dates.delivery) return false;
    const dDelivery = new Date(dates.delivery);
    const now = new Date();
    now.setHours(0,0,0,0);
    if (!isAdmin && dDelivery < now) return false;
    return true;
  };

  const isDatesValid = validateDates();
  const isTechnicalInfoValid = technicalInfo.material && technicalInfo.color;
  const canProceed = configuredElements.length > 0 && isDatesValid && isTechnicalInfoValid;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      
      {/* 1. CONFIGURAZIONE TECNICA GLOBALE */}
      <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-sm">
        <h4 className="font-bold text-sm text-blue-800 mb-4 flex items-center gap-2">
            <Info size={18}/> Specifiche Tecniche Globali
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wide">Materiale *</label>
                <select 
                    value={technicalInfo.material} 
                    onChange={(e) => setTechnicalInfo({...technicalInfo, material: e.target.value})} 
                    className={`w-full p-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm border ${getDiffClass('technicalInfo', 'material')}`}
                >
                    <option value="zirconio">Zirconio</option>
                    <option value="disilicato">Disilicato di Litio</option>
                    <option value="metallo_ceramica">Metallo-Ceramica</option>
                    <option value="pmma">PMMA (Provvisorio)</option>
                    <option value="resina">Resina Stampata</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wide">Colore Riferimento *</label>
                <select 
                    value={technicalInfo.color} 
                    onChange={(e) => setTechnicalInfo({...technicalInfo, color: e.target.value})} 
                    className={`w-full p-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm border ${getDiffClass('technicalInfo', 'color')}`}
                >
                    <optgroup label="Scala Vita A"><option>A1</option><option>A2</option><option>A3</option><option>A3.5</option><option>A4</option></optgroup>
                    <optgroup label="Scala Vita B"><option>B1</option><option>B2</option><option>B3</option><option>B4</option></optgroup>
                    <optgroup label="Scala Vita C"><option>C1</option><option>C2</option><option>C3</option><option>C4</option></optgroup>
                    <optgroup label="Bleach"><option>BL1</option><option>BL2</option><option>BL3</option></optgroup>
                </select>
            </div>
        </div>
        
        <div>
           <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wide">Descrizione e Specifica (Opzionale)</label>
           <textarea 
             className={`w-full p-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-neutral-400 resize-y min-h-[80px] shadow-sm border ${getDiffClass('technicalInfo', 'description')}`} 
             placeholder="Es. Corona avvitata su impianto, spalla in ceramica, dettagli anatomici particolari..." 
             value={technicalInfo.description} 
             onChange={(e) => setTechnicalInfo({...technicalInfo, description: e.target.value})}
             rows={2}
           />
        </div>
      </div>

      {/* 2. AREA DI LAVORO: ODONTOGRAMMA E CONTROLLI */}
      <div className={`space-y-6 p-4 rounded-3xl border-2 transition-colors ${elementsChanged ? 'border-orange-300 bg-orange-50/30' : 'border-transparent'}`}>
          
          {elementsChanged && (
             <div className="text-xs text-orange-700 font-bold mb-2 flex items-center gap-2 p-2 bg-orange-100 rounded-lg border border-orange-200">
                <AlertTriangle size={14}/> Configurazione elementi modificata rispetto all'originale
             </div>
          )}

          {/* A. ODONTOGRAMMA */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-400 opacity-50"></div>
            
            <VisualOdontogram 
                selected={selectedTeeth} 
                onToggle={toggleTooth} 
                configured={configuredElements} 
            />
            
          </div>

          {/* B. LOGICA GRUPPI */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Box 1: Azione Aggiungi */}
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl shadow-sm flex flex-col h-[280px]">
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Selezione Corrente</span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${selectedTeeth.length > 0 ? 'bg-white text-blue-700 border border-blue-200' : 'bg-blue-100 text-blue-300 border border-blue-100'}`}>
                            {selectedTeeth.length > 0 ? selectedTeeth.sort().join('-') : '-'}
                        </span>
                    </div>
                    
                    <h5 className="text-blue-900 font-bold mb-2">Istruzioni Rapide</h5>
                    <ul className="text-sm text-blue-800/70 space-y-2 list-disc list-inside">
                        <li>Clicca sui denti nell'odontogramma per selezionarli.</li>
                        <li>Per creare un <b>ponte</b>, seleziona più elementi adiacenti.</li>
                        <li>Clicca "Aggiungi al Piano" per confermare il gruppo.</li>
                    </ul>
                </div>

                <button 
                    onClick={handleAddGroup}
                    disabled={selectedTeeth.length === 0}
                    className={`
                        w-full h-12 mt-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md
                        ${selectedTeeth.length > 0 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-[1.01]' 
                            : 'bg-blue-200 text-blue-400 cursor-not-allowed'}
                    `}
                >
                    <Plus size={20} />
                    <span>Aggiungi al Piano</span>
                </button>
            </div>

            {/* Box 2: Lista Elementi */}
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 h-[280px] flex flex-col shadow-sm">
                <h5 className="font-bold text-neutral-800 mb-4 flex items-center justify-between shrink-0">
                    <span>Elementi nel Piano</span>
                    <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-xs">{configuredElements.length}</span>
                </h5>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {configuredElements.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-300 border-2 border-dashed border-neutral-100 rounded-xl">
                            <Info size={32} className="mb-2 opacity-50"/>
                            <p className="text-sm font-medium">Nessun elemento inserito</p>
                        </div>
                    ) : (
                        configuredElements.map((group) => {
                             const style = GROUP_COLORS[group.groupIndex % GROUP_COLORS.length];
                             return (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    key={group.id} 
                                    className={`flex items-center justify-between p-3 rounded-xl border ${style.bg} ${style.border}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-white shadow-sm ${style.text}`}>
                                            {group.teeth.length}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${style.text}`}>
                                                {group.isBridge ? 'Ponte' : 'Singolo'}
                                            </p>
                                            <p className="text-xs text-neutral-500 font-mono">
                                                {group.teeth.join('-')}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => removeGroup(group.id)} 
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/50 hover:bg-red-50 text-neutral-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </motion.div>
                             )
                        })
                    )}
                </div>
            </div>
          </div>
      </div>

      {/* 3. DATE E SCADENZE */}
      <div className="bg-neutral-50 p-6 rounded-3xl border border-neutral-200">
         <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-neutral-200 shadow-sm text-primary">
                <Calendar size={20} />
             </div>
             <div>
                 <h4 className="font-bold text-neutral-800">Pianificazione Temporale</h4>
                 <p className="text-xs text-neutral-500">Definisci le scadenze per la lavorazione</p>
             </div>
         </div>

         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <div className="col-span-2 md:col-span-1">
               <label className="text-xs font-bold text-primary mb-1.5 block uppercase tracking-wide">Data Consegna *</label>
               <input 
                 type="date" 
                 className={`w-full p-3 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all 
                    ${getDiffClass('dates', 'delivery')} 
                    ${!dates.delivery && !originalData ? 'border-primary/30' : ''}`}
                 value={dates.delivery} 
                 onChange={e => setDates({...dates, delivery: e.target.value})} 
               />
             </div>
             {[1, 2, 3].map(i => (
               <div key={i}>
                 <label className="text-xs font-bold text-neutral-400 mb-1.5 block uppercase tracking-wide">Prova {i}</label>
                 <input 
                   type="date" 
                   className={`w-full p-3 border rounded-xl bg-white text-sm text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-200 shadow-sm transition-all hover:border-neutral-300 ${getDiffClass('dates', `tryIn${i}`)}`}
                   value={dates[`tryIn${i}`]} 
                   onChange={e => setDates({...dates, [`tryIn${i}`]: e.target.value})} 
                 />
               </div>
             ))}
         </div>

         {!isAdmin && (
            <div className="mt-6 flex gap-3 items-start bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-yellow-800 text-xs">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                    <b>Nota:</b> Le date indicate sono preferenziali. L'amministrazione confermerà la fattibilità o proporrà variazioni.
                </p>
            </div>
         )}
      </div>

      {/* FOOTER NAVIGAZIONE */}
      <div className="flex justify-between pt-6 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <div className={!canProceed ? 'opacity-50 pointer-events-none' : ''}>
             <Button onClick={onNext} disabled={!canProceed}>
                Prosegui <ArrowRight size={18} className="ml-2"/>
             </Button>
        </div>
      </div>
    </motion.div>
  );
}