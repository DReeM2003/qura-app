import React, { createContext, ReactNode, useContext } from 'react';
import useBLE, { BluetoothLowEnergyApi } from '../hooks/useBLE';

const BLEContext = createContext<BluetoothLowEnergyApi | null>(null);

export function BLEProvider({ children }: { children: ReactNode }) {
  const ble = useBLE();
  return <BLEContext.Provider value={ble}>{children}</BLEContext.Provider>;
}

export function useBLEContext() {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLEContext must be used within BLEProvider');
  return ctx;
}