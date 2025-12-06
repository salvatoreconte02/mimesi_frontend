import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, ArrowRight, Info, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';

export default function StepFiles({ 
  files, setFiles, 
  photos, setPhotos, 
  impressionParams, setImpressionParams, 
  onBack, onNext 
}) {
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);

  // --- GESTIONE FILE (STL/PLY) ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Aggiungiamo i nuovi file alla lista esistente
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // --- GESTIONE FOTO (JPG/PNG) ---
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files);
      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Validazione: Almeno 1 file STL è richiesto
  const isValid = files.length > 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      
      {/* SEZIONE 1: UPLOAD FILE SCANSIONE (OBBLIGATORIO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <h4 className="font-bold text-neutral-800 flex items-center gap-2">
                <File className="text-primary" size={20}/> File Scansione (STL/PLY) *
            </h4>
            <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded border">
                {files.length} file caricati
            </span>
        </div>

        <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".stl,.ply,.obj" 
            multiple 
            onChange={handleFileChange} 
        />

        <div 
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group
                ${files.length > 0 
                    ? 'border-green-300 bg-green-50/30 hover:bg-green-50' 
                    : 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50'
                }`}
        >
            <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Upload className={`w-8 h-8 ${files.length > 0 ? 'text-green-500' : 'text-primary'}`} />
            </div>
            <p className="font-bold text-lg text-neutral-700">Clicca per caricare i file STL/PLY</p>
            <p className="text-sm text-neutral-500 mt-1">Puoi selezionare più file contemporaneamente</p>
        </div>

        {/* LISTA FILE CARICATI */}
        {files.length > 0 && (
            <div className="grid grid-cols-1 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200 max-h-[150px] overflow-y-auto custom-scrollbar">
                {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                                <File size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-neutral-700 truncate">{file.name}</p>
                                <p className="text-[10px] text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <button onClick={() => removeFile(i)} className="p-1.5 hover:bg-red-50 text-neutral-400 hover:text-red-500 rounded-lg transition-colors">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* SEZIONE 2: PARAMETRI IMPRONTA (OPZIONALI) */}
      <div className="bg-white border border-neutral-200 p-5 rounded-2xl shadow-sm">
         <h4 className="font-bold text-sm text-neutral-700 mb-4 flex items-center gap-2">
            <Info size={18} className="text-neutral-400"/> Dati Tecnici Impronta (Opzionale)
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wide">Rilevate in</label>
                <select 
                    className="w-full p-3 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    value={impressionParams.material}
                    onChange={(e) => setImpressionParams({...impressionParams, material: e.target.value})}
                >
                    <option value="">-- Seleziona --</option>
                    <option value="alginato">Alginato</option>
                    <option value="silicone_a">Silicone A (Polivinilsilossano)</option>
                    <option value="silicone_c">Silicone C</option>
                    <option value="polietere">Polietere</option>
                    <option value="gesso">Gesso</option>
                    <option value="scanner">Scanner Intraorale Diretto</option>
                </select>
            </div>
            <div>
                <label className="text-xs font-bold text-neutral-500 mb-1.5 block uppercase tracking-wide">Disinfettate in</label>
                <select 
                    className="w-full p-3 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    value={impressionParams.disinfection}
                    onChange={(e) => setImpressionParams({...impressionParams, disinfection: e.target.value})}
                >
                    <option value="">-- Seleziona --</option>
                    <option value="ipoclorito">Ipoclorito di Sodio</option>
                    <option value="glutaraldeide">Glutaraldeide</option>
                    <option value="composti_fenolici">Composti Fenolici</option>
                    <option value="raggi_uv">Raggi UV</option>
                    <option value="alcol">Alcol / Spray Disinfettante</option>
                    <option value="non_disinfettato">Non Disinfettato</option>
                </select>
            </div>
         </div>
      </div>

      {/* SEZIONE 3: FOTO ACCESSORIE (OPZIONALI) */}
      <div className="space-y-4">
        <h4 className="font-bold text-neutral-800 flex items-center gap-2 text-sm">
            <ImageIcon className="text-neutral-400" size={18}/> Allegati Fotografici <span className="text-neutral-400 font-normal ml-1">(Opzionale)</span>
        </h4>
        
        <input 
            type="file" 
            ref={photoInputRef} 
            className="hidden" 
            accept="image/*" 
            multiple 
            onChange={handlePhotoChange} 
        />

        <div className="flex gap-4">
            {/* Tasto Upload Foto */}
            <div 
                onClick={() => photoInputRef.current.click()}
                className="w-24 h-24 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer transition-all shrink-0"
            >
                <Upload size={24} className="mb-1" />
                <span className="text-[10px] font-bold uppercase">Aggiungi</span>
            </div>

            {/* Lista Foto (Anteprime) */}
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {photos.map((photo, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm shrink-0 group">
                        <img 
                            src={URL.createObjectURL(photo)} 
                            alt="preview" 
                            className="w-full h-full object-cover"
                        />
                        <button 
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
                {photos.length === 0 && (
                    <div className="flex items-center text-xs text-neutral-400 italic px-2">
                        Nessuna foto allegata
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* FOOTER NAVIGAZIONE */}
      <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <div className={!isValid ? 'opacity-50 pointer-events-none' : ''}>
            <Button onClick={onNext} disabled={!isValid}>
                Riepilogo <ArrowRight size={18} className="ml-2"/>
            </Button>
        </div>
      </div>
    </motion.div>
  );
}