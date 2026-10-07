import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import type { PublicLocations } from '../types';
import { fetchPublicLocations } from '../lib/mistri.api';

interface LocationsContextValue {
  /** States / cities that currently have at least one live Mistri. */
  locations: PublicLocations;
  activeStates: string[];
  getActiveCities: (stateName: string) => string[];
  totalRegistered: number;
  loading: boolean;
  reload: () => void;
}

const EMPTY: PublicLocations = { total: 0, states: [] };

const LocationsContext = createContext<LocationsContextValue | undefined>(undefined);

export const LocationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<PublicLocations>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetchPublicLocations(controller.signal)
      .then(setLocations)
      .catch((error: unknown) => {
        if (!axios.isCancel(error)) setLocations(EMPTY);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [version]);

  const reload = useCallback(() => setVersion((current) => current + 1), []);

  const value = useMemo<LocationsContextValue>(
    () => ({
      locations,
      activeStates: locations.states.map((state) => state.name),
      getActiveCities: (stateName) =>
        locations.states.find((state) => state.name === stateName)?.cities.map((city) => city.name) ?? [],
      totalRegistered: locations.total,
      loading,
      reload,
    }),
    [locations, loading, reload],
  );

  return <LocationsContext.Provider value={value}>{children}</LocationsContext.Provider>;
};

export const useLocations = (): LocationsContextValue => {
  const context = useContext(LocationsContext);
  if (!context) throw new Error('useLocations must be used within a LocationsProvider');
  return context;
};
