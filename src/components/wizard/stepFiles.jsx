import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import Button from '../ui/Button';

export default function StepFiles({ onBack, onNext }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      
      {/* Area Dropzone STL */}
      <div className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
        <Upload className="mx-auto h-16 w-16 text-primary mb-6 group-hover:scale-110 transition-transform" />
        <p className="font-bold text-lg text-neutral-700">Trascina qui i file STL/PLY delle impronte</p>
        <p className="text-sm text-neutral-500 mt-2">o clicca per selezionare dal dispositivo</p>
      </div>

      {/* Area Allegati Foto */}
      <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer">
        <p className="text-sm text-neutral-500">Allegati fotografici (JPG, PNG) [Facoltativo]</p>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t border-neutral-100">
        <Button variant="ghost" onClick={onBack}>← Indietro</Button>
        <Button onClick={onNext}>Riepilogo →</Button>
      </div>
    </motion.div>
  );
}