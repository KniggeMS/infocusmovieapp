import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { MovieConductor } from '../core/conductor/MovieConductor';

interface ListCreationModalProps {
  conductor: MovieConductor;
  onClose: () => void;
}

export function ListCreationModal({ conductor, onClose }: ListCreationModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setIsCreating(true);
    try {
      await conductor.dispatch({
        type: 'CREATE_LIST',
        payload: { name: name.trim(), description: description.trim() || undefined }
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="bg-app-bg rounded-3xl w-full max-w-md mx-4 border border-app-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-app-border">
          <h2 className="text-xl font-bold">Neue Liste erstellen</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm text-app-text-muted mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-app-secondary border border-app-border rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500"
              placeholder="z.B. Lieblingsfilme 2025"
            />
          </div>
          <div>
            <label className="block text-sm text-app-text-muted mb-2">Beschreibung (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-app-secondary border border-app-border rounded-2xl px-4 py-3 h-24 focus:outline-none focus:border-blue-500"
              placeholder="Filme, die ich unbedingt noch schauen will..."
            />
          </div>
        </div>

        <div className="p-6 border-t border-app-border flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border border-app-border">Abbrechen</button>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || isCreating}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-2xl font-medium"
          >
            {isCreating ? 'Wird erstellt...' : 'Liste erstellen'}
          </button>
        </div>
      </div>
    </div>
  );
}
