// src/hooks/use-simulation.ts
import { useState, useEffect, useCallback } from 'react';
import { simulationService } from '../services/api';

export function useSimulation() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string>('idle');

  const checkStatus = useCallback(async () => {
    try {
      const data = await simulationService.getStatus();
      if (data) {
        setSimulationStatus(data.message || 'unknown');
        
        if (data.is_running && !isSimulating) setIsSimulating(true);
        if (!data.is_running && isSimulating) setIsSimulating(false);
      }
    } catch (error) {
      console.error("Error checking simulation status:", error);
      if (isSimulating) setIsSimulating(false);
    }
  }, [isSimulating]);

  const startSimulation = async () => {
    setIsSimulating(true);
    await simulationService.start();
    checkStatus(); 
  };

  const stopSimulation = async () => {
    setIsSimulating(false);
    await simulationService.stop();
    checkStatus(); 
  };

  useEffect(() => {
    // KITA UBAH TIPE INI JADI 'any' AGAR ERROR 'Cannot find namespace NodeJS' HILANG
    let interval: any; 
    
    checkStatus();

    if (isSimulating) {
      interval = setInterval(checkStatus, 2000);
    }

    return () => clearInterval(interval);
  }, [isSimulating, checkStatus]);

  return {
    isSimulating,
    simulationStatus,
    startSimulation,
    stopSimulation
  };
}