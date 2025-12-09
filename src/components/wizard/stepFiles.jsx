/* eslint-disable no-unused-vars */
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, ArrowRight, Info, Eye, Box } from 'lucide-react';
import Button from '../ui/Button';
import FileRenderer from '../ui/FileRenderer';
/* eslint-enable no-unused-vars */

// ===== HELPER FUNCTION =====
// Controlla se un file è un oggetto File/Blob reale o solo metadati
// Usa duck-typing invece di instanceof per evitare errori di contesto
const isRealFile = (file) => {
  if (!file) return false;
  
  // Un File/Blob reale ha questi metodi/proprietà
  // Un oggetto JSON di metadati non li ha
  return (
    typeof file.slice === 'function' && 
    typeof file.size === 'number' && 
    'type' in file &&
    'lastModified' in file
  );
};

export default function StepFiles({ 
  files, setFiles, 
  photos, setPhotos, 
  impressionParams, setImpressionParams, 
  onBack, onNext 
}) {
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  
  // Stato per la modale di anteprima
  const [previewFile, setPreviewFile] = useState(null);

  // --- GESTIONE FILE (STL/PLY/OBJ) ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Validazione estensione
      const validExtensions = ['stl', 'ply', 'obj'];
      const validFiles = newFiles.filter(file => {
          const ext = file.name.split('.').pop().toLowerCase();
          return validExtensions.includes(ext);
      });
      
      if (validFiles.length !== newFiles.length) {
          alert("Alcuni file non sono stati caricati perché non sono formati 3D supportati (.stl, .ply, .obj).");
      }

      setFiles((prev) => [...prev, ...validFiles]);
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

  const isValid = files.length > 0;

  return (
    <>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
        
        {/* SEZIONE 1: UPLOAD FILE SCANSIONE (OBBLIGATORIO) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-800 flex items-center gap-2">
                  <File className="text-primary" size={20}/> File Scansione (STL/PLY/OBJ) *
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
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group
                  ${files.length > 0 
                      ? 'border-green-300 bg-green-50/30 hover:bg-green-50' 
                      : 'border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50'
                  }`}
          >
              <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className={`w-8 h-8 ${files.length > 0 ? 'text-green-500' : 'text-primary'}`} />
              </div>
              <p className="font-bold text-lg text-neutral-700">Clicca per caricare i file STL/PLY/OBJ</p>
              <p className="text-sm text-neutral-500 mt-1">Trascina qui o clicca per selezionare</p>
          </div>

          {/* LISTA FILE CARICATI */}
          {files.length > 0 && (
              <div className="grid grid-cols-1 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-200 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {files.map((file, i) => {
                      const isReal = isRealFile(file);
                      const fileName = isReal ? file.name : file.name;
                      const fileSize = isReal ? file.size : (file.size || 0);
                      const fileExt = fileName.split('.').pop();
                      
                      return (
                          <div key={`${fileName}-${fileSize}-${i}`} className="flex items-center justify-between bg-white p-3 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                      <Box size={20} />
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-bold text-neutral-700 truncate">{fileName}</p>
                                      <p className="text-[10px] text-neutral-400 uppercase font-mono">
                                        {fileExt} • {(fileSize / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2">
                                  {/* TASTO ANTEPRIMA 3D - Solo se è un file reale */}
                                  {isReal && (
                                      <button 
                                        type="button"
                                        onClick={() => setPreviewFile(file)}
                                        className="p-2 bg-blue-50 text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-2 group"
                                        title="Anteprima 3D"
                                      >
                                          <Eye size={18} />
                                          <span className="text-xs font-bold hidden group-hover:inline">Vedi 3D</span>
                                      </button>
                                  )}

                                  {/* TASTO RIMUOVI */}
                                  <button 
                                    type="button"
                                    onClick={() => removeFile(i)} 
                                    className="p-2 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                                    title="Rimuovi file"
                                  >
                                      <X size={18} />
                                  </button>
                              </div>
                          </div>
                      );
                  })}
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
                      className="w-full p-3 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
                      className="w-full p-3 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
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
              <div 
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400 hover:border-primary/50 hover:text-primary hover:bg-primary/5 cursor-pointer transition-all shrink-0"
              >
                  <Upload size={24} className="mb-1" />
                  <span className="text-[10px] font-bold uppercase">Aggiungi</span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {photos.map((photo, i) => {
                      const isReal = isRealFile(photo);
                      
                      return (
                          <div key={`photo-${photo.name || 'photo'}-${i}`} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-200 shadow-sm shrink-0 group">
                              {/* SE È UN FILE REALE: mostra l'immagine vera */}
                              {isReal ? (
                                  <img 
                                      src={URL.createObjectURL(photo)} 
                                      alt={`preview-${i}`}
                                      className="w-full h-full object-cover"
                                  />
                              ) : (
                                  /* SE SONO METADATI: mostra un placeholder con icona */
                                  <div className="w-full h-full bg-neutral-100 flex flex-col items-center justify-center">
                                      <ImageIcon size={32} className="text-neutral-400 mb-1" />
                                      <span className="text-[8px] text-neutral-400 font-mono px-1 text-center truncate w-full">
                                          {photo.name}
                                      </span>
                                  </div>
                              )}
                              
                              <button 
                                  type="button"
                                  onClick={() => removePhoto(i)}
                                  className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                              >
                                  <X size={12} />
                              </button>
                          </div>
                      );
                  })}
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

      {/* MODALE ANTEPRIMA 3D - Solo se il file è reale */}
      <AnimatePresence>
        {previewFile && isRealFile(previewFile) && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 md:p-8 backdrop-blur-sm"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              className="bg-neutral-900 w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Header Modale */}
                <div className="flex justify-between items-center p-4 border-b border-white/10 bg-neutral-800">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Box className="text-primary"/> 
                        <span className="truncate max-w-[300px]">{previewFile.name}</span>
                    </h3>
                    <button 
                        type="button"
                        onClick={() => setPreviewFile(null)} 
                        className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* VISUALIZZATORE 3D */}
                <div className="flex-1 relative">
                    <FileRenderer file={previewFile} />
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}