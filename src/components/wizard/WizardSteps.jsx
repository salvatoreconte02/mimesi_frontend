import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Info, AlertTriangle, FileText, Plus, Trash2, Eye, X, Box, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import VisualOdontogram from './VisualOdontogram'; 
import Button from '../ui/Button';

// --- STEP 1: DATI PAZIENTE (Invariato) ---
export const StepPaziente = ({ data, onChange, readOnly = false }) => {
  const handleChange = (field, value) => {
    if (!readOnly) onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Nome (Opzionale)</label>
          <input type="text" disabled={readOnly} className="w-full p-2 rounded-lg border border-neutral-200" 
            value={data.nome || ''} onChange={e => handleChange('nome', e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Cognome (Opzionale)</label>
          <input type="text" disabled={readOnly} className="w-full p-2 rounded-lg border border-neutral-200" 
            value={data.cognome || ''} onChange={e => handleChange('cognome', e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-primary uppercase mb-1">Codice Paziente *</label>
            <input type="text" disabled={readOnly} className="w-full p-2 rounded-lg border border-primary/30 bg-primary/5 font-bold" 
              value={data.codicePaziente || ''} onChange={e => handleChange('codicePaziente', e.target.value)} placeholder="Es. PZ-001" />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Età (Opz)</label>
            <input type="number" disabled={readOnly} className="w-full p-2 rounded-lg border border-neutral-200" 
              value={data.eta || ''} onChange={e => handleChange('eta', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Sesso (Opz)</label>
            <select disabled={readOnly} className="w-full p-2 rounded-lg border border-neutral-200 bg-white"
              value={data.sesso || 'M'} onChange={e => handleChange('sesso', e.target.value)}>
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
            </select>
          </div>
      </div>
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <h4 className="font-bold text-sm text-neutral-600 mb-3">Anamnesi (Opzionale)</h4>
        <div className="grid grid-cols-2 gap-3">
          {['Allergie', 'Bruxismo', 'Disfunzioni Articolari', 'Dispositivi Presenti', 'Handicap'].map(label => {
            const key = label.toLowerCase().replace(' ', '');
            return (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" disabled={readOnly} className="w-4 h-4 text-primary rounded" 
                  checked={data[key] || false} onChange={e => handleChange(key, e.target.checked)} />
                <span className="text-sm text-neutral-700">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};


// --- STEP 2: ELEMENTI (Semplificato: Solo pulsante "Aggiungi") ---
export const StepElementi = ({ data, onChange, readOnly = false }) => {
  // data: { groups: [], currentSelection: [], config: {}, dates: {} }
  
  const handleConfigChange = (field, value) => {
    if (!readOnly) onChange({ ...data, config: { ...data.config, [field]: value } });
  };
  const handleDateChange = (field, value) => {
    if (!readOnly) onChange({ ...data, dates: { ...data.dates, [field]: value } });
  };

  // Toggle selezione corrente
  const toggleTooth = (id) => {
    if (readOnly) return;
    
    // Se il dente è già in un gruppo confermato, chiediamo se rimuoverlo
    const existingGroupIndex = data.groups?.findIndex(g => g.teeth.includes(id));
    if (existingGroupIndex !== -1 && existingGroupIndex !== undefined) {
       if (confirm("Questo elemento è già in un gruppo. Vuoi rimuoverlo?")) {
          const newGroups = [...data.groups];
          newGroups[existingGroupIndex].teeth = newGroups[existingGroupIndex].teeth.filter(t => t !== id);
          if (newGroups[existingGroupIndex].teeth.length === 0) {
             newGroups.splice(existingGroupIndex, 1);
          }
          onChange({ ...data, groups: newGroups });
       }
       return;
    }

    const current = data.currentSelection || [];
    const updated = current.includes(id) ? current.filter(t => t !== id) : [...current, id];
    onChange({ ...data, currentSelection: updated });
  };

  // Logica unica: se > 1 dente è un Ponte, altrimenti Singolo
  const addGroup = () => {
     if (!data.currentSelection || data.currentSelection.length === 0) return;
     
     const isBridge = data.currentSelection.length > 1;
     
     const newGroup = {
        id: Date.now(),
        teeth: [...data.currentSelection].sort(),
        type: isBridge ? 'Ponte' : 'Elemento Singolo',
        isBridge: isBridge
     };

     onChange({ 
        ...data, 
        groups: [...(data.groups || []), newGroup],
        currentSelection: [] // Resetta selezione
     });
  };

  const removeGroup = (idx) => {
     const newGroups = [...data.groups];
     newGroups.splice(idx, 1);
     onChange({ ...data, groups: newGroups });
  };

  return (
    <div className="space-y-6">
      {/* Configurazione Globale Materiali */}
      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-neutral-600 mb-1 block uppercase">Materiale (Unico per l'ordine)</label>
          <select disabled={readOnly} value={data.config?.material || 'zirconio'} onChange={e => handleConfigChange('material', e.target.value)} 
            className="w-full p-2 text-sm border rounded bg-white font-medium">
            <option value="zirconio">Zirconio Multistrato</option>
            <option value="disilicato">Disilicato di Litio</option>
            <option value="metallo_ceramica">Metallo-Ceramica</option>
            <option value="pmma">PMMA Provvisorio</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-600 mb-1 block uppercase">Colore</label>
          <select disabled={readOnly} value={data.config?.color || 'A2'} onChange={e => handleConfigChange('color', e.target.value)} 
            className="w-full p-2 text-sm border rounded bg-white">
            <optgroup label="Scala Vita A"><option>A1</option><option>A2</option><option>A3</option><option>A3.5</option><option>A4</option></optgroup>
            <optgroup label="Bleach"><option>BL1</option><option>BL2</option><option>BL3</option></optgroup>
          </select>
        </div>
      </div>

      {/* SEZIONE ODONTOGRAMMA */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm relative">
        <div className="absolute top-4 right-4 bg-neutral-100 px-3 py-1 rounded text-xs text-neutral-500 hidden sm:block">
           Clicca sui denti per selezionarli
        </div>
        
        <VisualOdontogram 
           selected={data.currentSelection || []} 
           groups={data.groups || []}
           onToggle={toggleTooth} 
        />
        
        {/* Barra Azioni Semplificata */}
        {!readOnly && data.currentSelection?.length > 0 && (
           <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in-up">
              <span className="text-sm font-bold text-blue-800">
                 Denti Selezionati: <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 ml-2">{data.currentSelection.join(', ')}</span>
              </span>
              <div className="flex gap-2 w-full sm:w-auto">
                 <Button size="sm" variant="ghost" className="flex-1 sm:flex-none" onClick={() => onChange({...data, currentSelection: []})}>Annulla</Button>
                 {/* UNICO PULSANTE AGGIUNGI */}
                 <Button size="sm" className="flex-1 sm:flex-none" onClick={addGroup}>
                    <Plus size={14} className="mr-1"/> Aggiungi
                 </Button>
              </div>
           </div>
        )}
      </div>

      {/* SEZIONE GRUPPI CONFIGURATI */}
      <div className="space-y-3">
         <h4 className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2">
            <FileText size={14}/> Riepilogo Gruppi Configurati
         </h4>
         
         {data.groups && data.groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
               {data.groups.map((group, idx) => (
                  <div key={group.id} className="bg-white border border-neutral-200 p-3 rounded-xl shadow-sm flex justify-between items-center group hover:border-primary/50 transition-colors">
                     <div>
                        <div className="flex items-center gap-2">
                           <span className={`w-3 h-3 rounded-full border border-black/10`} style={{ backgroundColor: ['#22C55E', '#3B82F6', '#A855F7', '#F97316'][idx % 4] }}></span>
                           <span className="font-bold text-sm text-neutral-800">{group.type}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 pl-5">
                           Elementi: <span className="font-mono font-bold text-neutral-700">{group.teeth.join('-')}</span>
                        </p>
                     </div>
                     {!readOnly && (
                        <button onClick={() => removeGroup(idx)} className="text-neutral-400 hover:text-error p-2 rounded-lg hover:bg-red-50 transition-colors">
                           <Trash2 size={16} />
                        </button>
                     )}
                  </div>
               ))}
            </div>
         ) : (
            <div className="text-center py-6 bg-neutral-50 rounded-xl border border-dashed border-neutral-200 text-neutral-400 text-xs">
               Nessun elemento configurato.<br/>Seleziona i denti dall'odontogramma e clicca "Aggiungi".
            </div>
         )}
      </div>

      {/* Date */}
      <div className="border-t pt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-primary mb-1 block">Consegna Richiesta</label>
              <input type="date" disabled={readOnly} className="w-full p-2 border border-primary/30 rounded bg-white text-sm" 
                value={data.dates?.delivery || ''} onChange={e => handleDateChange('delivery', e.target.value)} />
            </div>
            {[1, 2, 3].map(i => (
               <div key={i}>
                 <label className="text-xs text-neutral-500 mb-1 block">Prova {i}</label>
                 <input type="date" disabled={readOnly} className="w-full p-2 border rounded bg-neutral-50 text-sm"
                   value={data.dates?.[`tryIn${i}`] || ''} onChange={e => handleDateChange(`tryIn${i}`, e.target.value)} />
               </div>
            ))}
        </div>
      </div>
    </div>
  );
};
// --- STEP 3: ALLEGATI (Con Input Reale e Preview) ---
export const StepAllegati = ({ data, onChange, readOnly = false }) => {
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleImpressionChange = (field, value) => {
    if (!readOnly) onChange({ ...data, impression: { ...data.impression, [field]: value } });
  };

  const handleFileSelect = (e) => {
     if (e.target.files && e.target.files.length > 0) {
        const newFiles = Array.from(e.target.files);
        // Aggiungiamo ai file esistenti
        const updatedFiles = [...(data.files || []), ...newFiles];
        onChange({ ...data, files: updatedFiles });
     }
  };

  const removeFile = (idx) => {
     const newFiles = [...data.files];
     newFiles.splice(idx, 1);
     onChange({ ...data, files: newFiles });
  };

  // Helper per icona file
  const getFileIcon = (file) => {
     if (file.name.match(/\.(jpg|jpeg|png)$/i)) return <ImageIcon className="text-purple-500" />;
     if (file.name.match(/\.(stl|ply|obj)$/i)) return <Box className="text-blue-500" />;
     return <FileText className="text-neutral-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Modale Anteprima */}
      <AnimatePresence>
         {previewFile && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
               <motion.div initial={{scale:0.9}} animate={{scale:1}} exit={{scale:0.9}} className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">{previewFile.name}</h3>
                     <button onClick={() => setPreviewFile(null)}><X /></button>
                  </div>
                  <div className="bg-neutral-100 rounded-xl h-64 flex items-center justify-center overflow-hidden border">
                     {previewFile.name.match(/\.(jpg|jpeg|png)$/i) ? (
                        <img src={URL.createObjectURL(previewFile)} alt="preview" className="h-full object-contain" />
                     ) : (
                        <div className="text-center">
                           <Box size={48} className="mx-auto text-neutral-400 mb-2" />
                           <p className="font-bold text-neutral-600">Anteprima 3D non disponibile</p>
                           <p className="text-xs text-neutral-400">Il viewer STL verrà caricato in produzione.</p>
                        </div>
                     )}
                  </div>
                  <div className="mt-4 flex justify-end">
                     <Button onClick={() => setPreviewFile(null)}>Chiudi</Button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Area Upload */}
      {!readOnly && (
        <>
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect} 
            accept=".stl,.ply,.obj,.jpg,.jpeg,.png,.pdf"
          />
          <div 
             onClick={() => fileInputRef.current?.click()}
             className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group"
          >
            <Upload className="mx-auto h-16 w-16 text-primary mb-6 group-hover:scale-110 transition-transform" />
            <p className="font-bold text-lg text-neutral-700">Clicca per caricare file</p>
            <p className="text-sm text-neutral-500 mt-2">STL, PLY, OBJ, JPG (Max 50MB)</p>
          </div>
        </>
      )}

      {/* Lista File Caricati (Cards) */}
      {data.files && data.files.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.files.map((file, idx) => (
               <div key={idx} className="bg-white border border-neutral-200 p-4 rounded-xl shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                     <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0 border">
                        {getFileIcon(file)}
                     </div>
                     <div className="min-w-0">
                        <p className="font-bold text-sm truncate">{file.name}</p>
                        <p className="text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                     <Button size="sm" variant="secondary" onClick={() => setPreviewFile(file)}>
                        <Eye size={16} />
                     </Button>
                     {!readOnly && (
                        <Button size="sm" variant="ghost" className="text-error" onClick={() => removeFile(idx)}>
                           <Trash2 size={16} />
                        </Button>
                     )}
                  </div>
               </div>
            ))}
         </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-neutral-200">
        <h4 className="font-bold text-sm text-neutral-800 mb-4 flex items-center gap-2">
          <Info size={16} /> Specifiche Materiali Impronta
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Rilevata In</label>
            <select disabled={readOnly} className="w-full p-2.5 rounded-lg border border-neutral-200 bg-white"
               value={data.impression?.materiale || ''} onChange={e => handleImpressionChange('materiale', e.target.value)}>
               <option value="">Seleziona...</option>
               <option value="scansione_digitale">Scansione Digitale</option>
               <option value="alginato">Alginato</option>
               <option value="silicone">Silicone</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Disinfezione</label>
            <select disabled={readOnly} className="w-full p-2.5 rounded-lg border border-neutral-200 bg-white"
               value={data.impression?.disinfezione || ''} onChange={e => handleImpressionChange('disinfezione', e.target.value)}>
               <option value="">Seleziona...</option>
               <option value="spray">Spray</option>
               <option value="immersione">Immersione</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- RIEPILOGO (Invariato nella logica, ma mostra i gruppi) ---
export const RiepilogoScheda = ({ fullData, doctorInfo }) => {
  const { paziente, elementi, allegati } = fullData;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
       <div className="bg-neutral-50 p-4 border-b flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-primary">MPO - Prescrizione</h3>
            <p className="text-xs text-neutral-500">ID: #{paziente.codicePaziente}</p>
          </div>
          <div className="text-right">
             <p className="font-bold text-neutral-800">{doctorInfo?.name}</p>
             <p className="text-xs text-neutral-500">{doctorInfo?.studio}</p>
          </div>
       </div>

       <div className="p-6 space-y-8">
          {/* Dati Paziente */}
          <div>
             <h4 className="text-xs font-bold text-neutral-400 uppercase border-b pb-1 mb-2">Paziente</h4>
             <p className="text-sm font-bold">{paziente.nome} {paziente.cognome} ({paziente.codicePaziente})</p>
          </div>

          {/* Lavorazioni */}
          <div>
             <h4 className="text-xs font-bold text-neutral-400 uppercase border-b pb-1 mb-2">Configurazione</h4>
             <div className="mb-4">
                <span className="font-bold text-primary text-lg">{elementi.config?.material?.toUpperCase()}</span>
                <span className="ml-2 text-sm text-neutral-600">Colore: {elementi.config?.color}</span>
             </div>
             
             <div className="space-y-2">
                {elementi.groups?.map((g, i) => (
                   <div key={i} className="flex items-center gap-3 text-sm p-2 bg-neutral-50 rounded border">
                      <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#22C55E', '#3B82F6', '#A855F7', '#F97316'][i % 4] }}></span>
                      <span className="font-bold">{g.type}:</span>
                      <span className="font-mono">{g.teeth.join('-')}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Allegati */}
          <div>
             <h4 className="text-xs font-bold text-neutral-400 uppercase border-b pb-1 mb-2">Files Allegati</h4>
             {allegati.files?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                   {allegati.files.map((f, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 flex items-center gap-1">
                         <FileText size={10}/> {f.name}
                      </span>
                   ))}
                </div>
             ) : <span className="text-xs text-neutral-400">Nessun file</span>}
          </div>
       </div>
    </div>
  );
};