import { useCallback } from 'react';
import type {
  CellActionsHandlerGetter,
  EditableCellActionHandler,
  EditableCellActions,
  GetCellActionsFn,
} from '../types/cells';

export const useEditableCellActions = ({
  getValidateHandler,
  getSaveHandler,
  getOptionsHandler,
}: {
  getValidateHandler: CellActionsHandlerGetter<string | null>;
  getSaveHandler: CellActionsHandlerGetter<string | null>;
  getOptionsHandler: CellActionsHandlerGetter<{ label: string; value: unknown }[]>;
}): GetCellActionsFn => {
  return useCallback(
    ({ meta, data, table }): EditableCellActions => {
      const validateHandler = getValidateHandler?.(meta.key) || (() => null);
      const saverHandler: EditableCellActionHandler<string | null> = async (args) => {
        const saveHandler = getSaveHandler?.(meta.key);
        const validationError = validateHandler ? await validateHandler(args) : null;

        if (validationError) {
          return validationError;
        }

        if (!saveHandler) {
          // Consistent error surface; do not throw in UI flow
          return `No save handler available for ${meta.name}`;
        }

        return saveHandler(args);
      };
      const optionsHandler =
        getOptionsHandler?.(meta.key) || (async (): Promise<{ label: string; value: unknown }[]> => []);

      return {
        save: async (updatedValue: unknown): Promise<string | null> => {
          return await saverHandler({
            value: updatedValue,
            meta,
            data,
            table,
          });
        },
        validate: async (updatedValue: unknown): Promise<string | null> => {
          return await validateHandler({
            value: updatedValue,
            meta,
            data,
            table,
          });
        },
        getOptions: async (updatedValue: unknown): Promise<{ label: string; value: unknown }[]> => {
          return await optionsHandler({
            meta,
            data,
            value: updatedValue,
            table,
          });
        },
      };
    },
    [getValidateHandler, getSaveHandler, getOptionsHandler],
  );
};
