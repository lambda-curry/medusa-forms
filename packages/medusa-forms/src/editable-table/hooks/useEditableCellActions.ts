import { useCallback } from 'react';
import type { EditableCellActionFn, EditableCellActions, GetCellActionsFn } from '../types/cells';

// biome-ignore lint/suspicious/noExplicitAny: It can be any type
type EditableCellActionsFn<T = any> = (key: string) => EditableCellActionFn<Record<string, unknown>, T> | undefined;

export const useEditableCellActions = ({
  getValidateHandler,
  getSaveHandler,
  getOptionsHandler,
}: {
  getValidateHandler: EditableCellActionsFn<string | null>;
  getSaveHandler: EditableCellActionsFn<string | null>;
  getOptionsHandler: EditableCellActionsFn<{ label: string; value: unknown }[]>;
}): GetCellActionsFn => {
  return useCallback(
    ({ meta, data, table }): EditableCellActions => {
      const validateHandler = getValidateHandler?.(meta.key) || (() => null);
      const saverHandler =
        getSaveHandler?.(meta.key) ||
        (async () => {
          // Consistent error surface; do not throw in UI flow
          return 'No save handler available for this field';
        });
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
