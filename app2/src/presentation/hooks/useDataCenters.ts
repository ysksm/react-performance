import { useState, useEffect, useCallback } from 'react';
import type { DataCenter as LegacyDataCenter } from '../../types/ServerData';
import { container } from '../../infrastructure/di/Container';
import { TOKENS } from '../../infrastructure/di/ServiceRegistry';
import type { IGetDataCentersUseCase } from '../../application/use-cases/GetDataCentersUseCase';
import { convertDataCentersToLegacy } from '../../utils/domainToLegacyConverter';

export interface UseDataCentersResult {
  dataCenters: LegacyDataCenter[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'online' | 'offline' | 'reconnecting';
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

export function useDataCenters(): UseDataCentersResult {
  const [dataCenters, setDataCenters] = useState<LegacyDataCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('offline');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const getDataCentersUseCase = container.resolve<IGetDataCentersUseCase>(TOKENS.GET_DATA_CENTERS_USE_CASE);

  const fetchDataCenters = useCallback(async () => {
    try {
      console.log('Starting fetchDataCenters...');
      setConnectionStatus('reconnecting');
      console.log('Executing use case...');
      const domainResult = await getDataCentersUseCase.execute();
      console.log('Domain result:', domainResult);
      console.log('Converting to legacy format...');
      const legacyResult = convertDataCentersToLegacy(domainResult);
      console.log('Legacy result:', legacyResult);
      setDataCenters(legacyResult);
      setError(null);
      setConnectionStatus('online');
      setLastUpdate(new Date());
      console.log('Data centers successfully loaded:', legacyResult.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setConnectionStatus('offline');
      console.error('Failed to fetch data centers:', err);
    } finally {
      setLoading(false);
    }
  }, [getDataCentersUseCase]);

  useEffect(() => {
    fetchDataCenters();

    const interval = setInterval(() => {
      if (connectionStatus !== 'reconnecting') {
        fetchDataCenters();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [fetchDataCenters, connectionStatus]);

  return {
    dataCenters,
    loading,
    error,
    connectionStatus,
    lastUpdate,
    refetch: fetchDataCenters,
  };
}