import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Link as LinkIcon, Trash2, Info } from 'lucide-react';
import Button from '../ui/Button';
import VisualOdontogram, { checkAdjacency, GROUP_COLORS } from '../dental/VisualOdontogram';

export default function StepElements({ 
  configuredElements, setConfiguredElements, 
  dates, setDates, 
  onBack, onNext 
}) {
  // Stato locale per la selezione corrente
  const [selectedTeeth, setSelectedTeeth] = useState([]);
  const [currentConfig, setCurrentConfig] = useState({
    material: 'zirconio', 
    color: 'A2', 
    description: '', 
    isBridge: false
  });

  // --- LOGICA DI GESTIONE ---

  // Seleziona/Deseleziona un dente
  const toggleTooth = (toothId) => {
    // Se il dente è già parte di un gruppo configurato, chiedi se rimuoverlo
    if (configuredElements.some(c => c.teeth.includes(toothId))) {
      if(window.confirm("Questo elemento è già configurato. Vuoi rimuoverlo per modificarlo?")) {
        setConfiguredElements(prev => prev.filter(c => !c.teeth.includes(toothId)));
      }
      return;
    }
    // Toggle selezione
    setSelectedTeeth(prev => 
      prev.includes(toothId) ? prev.filter(t => t !== toothId) : [...prev, toothId]
    );
  };

  // Aggiungi la configurazione corrente alla lista
  const addElement = () => {
    if (selectedTeeth.length === 0) return;

    // Validazione Ponte
    if (currentConfig.isBridge && !checkAdjacency(selectedTeeth)) {
      alert("Errore: Puoi unire in un ponte solo elementi adiacenti (es. 11-12-13).");
      return;
    }

    const newElement = {
      id: Date.now(),
      groupIndex: configuredElements.length, // Usato per assegnare il colore
      teeth: [...selectedTeeth].sort(),
      ...currentConfig,
      inferredType: currentConfig.isBridge ? 'Ponte' : 'Elemento Singolo'
    };

    setConfiguredElements([...configuredElements, newElement]);
    
    // Reset selezione
    setSelectedTeeth([]); 
    setCurrentConfig({ ...currentConfig, isBridge: false, description: '' }); 
  };

  // Rimuovi un elemento configurato dalla lista
  const removeElement = (id) => {
    setConfiguredElements(prev => prev.filter(el => el.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* 1. ODONTOGRAMMA INTERATTIVO */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
        <VisualOdontogram 
           selected={selectedTeeth} 
           onToggle={toggleTooth} 
           configured={configuredElements} 
        />
      </div>

      {/* 2. AREA CONFIGURAZIONE MATERIALI */}
      <div className="p-5 border rounded-2xl bg-neutral-50 border-primary/10 shadow-inner">
        {selectedTeeth.length > 0 ? (
          <div className="space-y-4">
            {/* Header Selezione */}
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
               <div className="flex items-center gap-2">
                 <span className="font-bold text-neutral-800">Selezione:</span>
                 <span className="text-primary bg-white border px-2 py-1 rounded text-sm font-mono">
                   {selectedTeeth.sort().join(', ')}
                 </span>
               </div>
               {selectedTeeth.length > 1 && (
                 <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1 rounded-lg border hover:border-primary transition-colors">
                   <input 
                     type="checkbox" 
                     checked={currentConfig.isBridge} 
                     onChange={(e) => setCurrentConfig({...currentConfig, isBridge: e.target.checked})} 
                     className="accent-primary"
                   />
                   <LinkIcon size={14} className="text-primary" />
                   <span className="text-sm font-bold text-neutral-700">Unisci in Ponte</span>
                 </label>
               )}
            </div>

            {/* Form Materiali e Colori */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Materiale</label>
                <select 
                  value={currentConfig.material} 
                  onChange={(e) => setCurrentConfig({...currentConfig, material: e.target.value})} 
                  className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="zirconio">Zirconio</option>
                  <option value="disilicato">Disilicato</option>
                  <option value="metallo_ceramica">Metallo-Ceramica</option>
                  <option value="pmma">PMMA</option>
                  <option value="resina">Resina</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Colore</label>
                <select 
                  value={currentConfig.color} 
                  onChange={(e) => setCurrentConfig({...currentConfig, color: e.target.value})} 
                  className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <optgroup label="Scala Vita A"><option>A1</option><option>A2</option><option>A3</option><option>A3.5</option><option>A4</option></optgroup>
                  <optgroup label="Scala Vita B"><option>B1</option><option>B2</option><option>B3</option><option>B4</option></optgroup>
                  <optgroup label="Bleach"><option>BL1</option><option>BL2</option><option>BL3</option></optgroup>
                </select>
              </div>
            </div>
            
            {/* Descrizione Opzionale */}
            <div>
               <label className="text-xs font-bold text-neutral-500 mb-1 block uppercase">Descrizione e Specifica (Opzionale)</label>
               <input 
                 type="text" 
                 placeholder="Es. Tonalità cervicale più scura..." 
                 className="w-full p-2 text-sm border rounded bg-white outline-none focus:ring-2 focus:ring-primary/20" 
                 value={currentConfig.description} 
                 onChange={(e) => setCurrentConfig({...currentConfig, description: e.target.value})} 
               />
            </div>

            {/* Bottone Conferma Elementi */}
            <div className="flex justify-end">
              <Button onClick={addElement} variant="gradient">
                <Check size={16} /> Conferma Elementi
              </Button>
            </div>
          </div>
        ) : (
          // Placeholder quando nessun dente è selezionato
          <div className="text-center text-neutral-400 py-4 flex flex-col items-center gap-2">
            <Info size={24} />
            <p>Clicca sui denti nell'odontogramma per configurarli</p>
          </div>
        )}
      </div>

      {/* 3. LISTA RIEPILOGATIVA ELEMENTI AGGIUNTI */}
      {configuredElements.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-neutral-600">Elementi Configurati</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {configuredElements.map((el) => {
              // Calcola lo stile in base all'indice del gruppo
              const style = GROUP_COLORS[el.groupIndex % GROUP_COLORS.length];
              return (
                <div key={el.id} className={`flex items-center justify-between p-3 rounded-xl border ${style.bg} ${style.border}`}>
                  <div>
                    <p className={`font-bold text-sm ${style.text}`}>
                      {el.isBridge ? '🔗 Ponte' : '🦷 Singolo'} {el.teeth.join('-')}
                    </p>
                    <p className="text-xs text-neutral-600 capitalize">
                      {el.material} • {el.color} {el.description && `• ${el.description}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeElement(el.id)} 
                    className="text-neutral-400 hover:text-error p-1 transition-colors"
                    title="Rimuovi elemento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SELEZIONE DATE */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-neutral-200">
         <div className="col-span-2 md:col-span-1">
           <label className="text-xs font-bold text-primary mb-1 block">Data Consegna *</label>
           <input 
             type="date" 
             className="w-full p-2 border border-primary/30 rounded bg-white text-sm outline-none focus:ring-2 focus:ring-primary/20" 
             value={dates.delivery} 
             onChange={e => setDates({...dates, delivery: e.target.value})} 
           />
         </div>
         {[1, 2, 3].map(i => (
           <div key={i}>
             <label className="text-xs text-neutral-500 mb-1 block">Prova {i} (Opz.)</label>
             <input 
               type="date" 
               className="w-full p-2 border rounded bg-white text-sm text-neutral-600 outline-none focus:ring-2 focus:ring-neutral-200"
               value={dates[`tryIn${i}`]} 
               onChange={e => setDates({...dates, [`tryIn${i}`]: e.target.value})} 
             />
           </div>
         ))}
      </div>

      {/* FOOTER NAVIGAZIONE */}
      <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <Button 
          onClick={onNext} 
          disabled={configuredElements.length === 0 || !dates.delivery}
        >
          Avanti →
        </Button>
      </div>
    </motion.div>
  );
}