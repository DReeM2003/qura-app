import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import useBLE, { BluetoothLowEnergyApi } from '../hooks/useBLE';

interface BLEContextType extends BluetoothLowEnergyApi {
  simulationMode: boolean;
  setSimulationMode: (mode: boolean) => void;
}

const SIMULATION_MODE_KEY = '@QuraBand:simulationMode';
const BLEContext = createContext<BLEContextType | null>(null);

export function BLEProvider({ children }: { children: ReactNode }) {
  const ble = useBLE();
  const [simulationMode, setSimulationMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved simulation mode on startup
  useEffect(() => {
    AsyncStorage.getItem(SIMULATION_MODE_KEY)
      .then(value => {
        if (value !== null) {
          setSimulationMode(value === 'true');
        }
        setIsInitialized(true);
      })
      .catch(error => {
        console.error('Error loading simulation mode:', error);
        setIsInitialized(true);
      });
  }, []);

  // Persist simulation mode changes
  const setAndPersistSimulationMode = async (mode: boolean) => {
    try {
      await AsyncStorage.setItem(SIMULATION_MODE_KEY, String(mode));
      setSimulationMode(mode);
    } catch (error) {
      console.error('Error saving simulation mode:', error);
    }
  };

  const contextValue: BLEContextType = {
    ...ble,
    simulationMode,
    setSimulationMode: setAndPersistSimulationMode
  };

  // Don't render children until we've loaded the saved simulation mode
  if (!isInitialized) {
    return null; // or a loading spinner if you prefer
  }

  return <BLEContext.Provider value={contextValue}>{children}</BLEContext.Provider>;
}

export function useBLEContext() {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLEContext must be used within BLEProvider');
  return ctx;
}