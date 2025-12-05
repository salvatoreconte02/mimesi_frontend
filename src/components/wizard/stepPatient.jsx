import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function StepPatient({ formData, setFormData, onNext }) {
  
  // Gestisce input testuali, numerici e checkbox
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Validazione semplice: verifica che i campi obbligatori siano pieni
  const isValid = formData.nome && formData.cognome && formData.codicePaziente;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* Campi Anagrafica */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Nome *</label>
          <input 
            type="text" 
            name="nome"
            className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
            value={formData.nome} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Cognome *</label>
          <input 
            type="text" 
            name="cognome"
            className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
            value={formData.cognome} 
            onChange={handleChange} 
          />
        </div>
      </div>
      
      {/* Dettagli Paziente */}
      <div className="grid grid-cols-3 gap-4">
         <div>
           <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Codice Paziente *</label>
           <input 
             type="text" 
             name="codicePaziente"
             className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
             value={formData.codicePaziente} 
             onChange={handleChange} 
             placeholder="Es. PZ-001" 
           />
         </div>
         <div>
           <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Età</label>
           <input 
             type="number" 
             name="eta"
             className="w-full p-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-primary/20" 
             value={formData.eta} 
             onChange={handleChange} 
           />
         </div>
         <div>
           <label className="text-xs font-bold text-neutral-500 uppercase mb-1">Sesso</label>
           <select 
             name="sesso"
             className="w-full p-2 rounded-lg border border-neutral-200 outline-none bg-white focus:ring-2 focus:ring-primary/20"
             value={formData.sesso} 
             onChange={handleChange}
           >
              <option value="M">Maschio</option>
              <option value="F">Femmina</option>
           </select>
         </div>
      </div>

      {/* Anamnesi (Checkbox) */}
      <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <h4 className="font-bold text-sm text-primary mb-3">Anamnesi e Condizioni Cliniche</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'allergie', label: 'Allergie Accertate' },
            { key: 'bruxismo', label: 'Bruxismo' },
            { key: 'disfunzioni', label: 'Disfunzioni Articolari' },
            { key: 'dispositivi', label: 'Altri dispositivi presenti' },
            { key: 'handicap', label: 'Handicap Psicomotori' },
          ].map(item => (
            <label key={item.key} className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                name={item.key}
                className="w-4 h-4 accent-primary rounded cursor-pointer" 
                checked={formData[item.key]} 
                onChange={handleChange} 
              />
              <span className="text-sm text-neutral-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Footer Navigazione */}
      <div className="flex justify-end pt-4 border-t border-neutral-100 mt-4">
        <Button onClick={onNext} disabled={!isValid}>Avanti →</Button>
      </div>
    </motion.div>
  );
}