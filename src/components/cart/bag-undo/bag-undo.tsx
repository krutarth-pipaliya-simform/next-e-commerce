'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/** What a removed line needs to go back in the bag. */
export type RemovedLine = {
  /** The removed cart item's id. */
  lineId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  name: string;
};

type BagUndoValue = {
  /** The line removed last, until it's restored or the toast is dismissed. */
  removed: RemovedLine | null;
  setRemoved: (line: RemovedLine | null) => void;
};

const BagUndoContext = createContext<BagUndoValue | null>(null);

export type BagUndoProviderProps = {
  /** The cart page. Lines report removals here and the toast offers Undo. */
  children: ReactNode;
};

/**
 * Remembers the last line removed from the bag. It wraps the whole page,
 * so Undo stays on offer after the last line goes and the empty state shows.
 */
export function BagUndoProvider({ children }: BagUndoProviderProps) {
  const [removed, setRemoved] = useState<RemovedLine | null>(null);
  return (
    <BagUndoContext value={{ removed, setRemoved }}>{children}</BagUndoContext>
  );
}

export function useBagUndo() {
  const value = useContext(BagUndoContext);
  if (!value) throw new Error('useBagUndo needs a <BagUndoProvider>');
  return value;
}
