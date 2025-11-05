import { useCallback, useState } from 'react';

export const useCellState = () => {
  const [error, setError] = useState<string | null>(null);
  const [canRetrySave, setCanRetrySave] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSavingState] = useState(false);
  const [justSaved, setJustSavedState] = useState(false);

  const setJustSaved = useCallback(() => {
    setJustSavedState(true);
    setTimeout(() => {
      setJustSavedState(false);
    }, 2000);
  }, []);

  const setIsSaving = useCallback(
    (newSaving: boolean) => {
      setIsSavingState((prev) => {
        const wasSaving = prev;

        if (wasSaving && !newSaving) {
          // status just changed from saving to not saving
          setJustSaved();
        }

        return newSaving;
      });
    },
    [setJustSaved],
  );

  return { error, canRetrySave, isEditing, isSaving, justSaved, setError, setCanRetrySave, setIsEditing, setIsSaving };
};
