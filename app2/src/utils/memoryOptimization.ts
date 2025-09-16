import { useEffect, useRef, useCallback } from 'react';

export function useMemoryCleanup(dependencies: any[]) {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, dependencies);

  return addCleanup;
}

export function usePreviousValue<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

export function useObjectPool<T>(
  createObject: () => T,
  resetObject: (obj: T) => void,
  maxSize: number = 10
) {
  const pool = useRef<T[]>([]);

  const getObject = useCallback((): T => {
    if (pool.current.length > 0) {
      const obj = pool.current.pop()!;
      resetObject(obj);
      return obj;
    }
    return createObject();
  }, [createObject, resetObject]);

  const returnObject = useCallback((obj: T) => {
    if (pool.current.length < maxSize) {
      pool.current.push(obj);
    }
  }, [maxSize]);

  useEffect(() => {
    return () => {
      pool.current = [];
    };
  }, []);

  return { getObject, returnObject };
}

export function useLazyInitializer<T>(initializer: () => T): T {
  const [value] = useState(initializer);
  return value;
}

export function useVirtualizedData<T>(
  data: T[],
  windowSize: number,
  currentIndex: number
): { visibleData: T[]; startIndex: number; endIndex: number } {
  return useMemo(() => {
    const buffer = Math.floor(windowSize / 2);
    const startIndex = Math.max(0, currentIndex - buffer);
    const endIndex = Math.min(data.length, startIndex + windowSize);
    const visibleData = data.slice(startIndex, endIndex);

    return {
      visibleData,
      startIndex,
      endIndex
    };
  }, [data, windowSize, currentIndex]);
}

export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

export function useWeakRefCache<K extends object, V>() {
  const cache = useRef(new WeakMap<K, V>());

  const get = useCallback((key: K): V | undefined => {
    return cache.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cache.current.set(key, value);
  }, []);

  const has = useCallback((key: K): boolean => {
    return cache.current.has(key);
  }, []);

  const clear = useCallback((): void => {
    cache.current = new WeakMap<K, V>();
  }, []);

  return { get, set, has, clear };
}

// Fix missing import
import { useState, useMemo } from 'react';

export function useOptimizedState<T>(
  initialValue: T,
  shouldUpdate?: (prev: T, next: T) => boolean
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(initialValue);

  const optimizedSetState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prevState => {
      const nextState = typeof value === 'function' ? (value as (prev: T) => T)(prevState) : value;

      if (shouldUpdate) {
        return shouldUpdate(prevState, nextState) ? nextState : prevState;
      }

      return nextState;
    });
  }, [shouldUpdate]);

  return [state, optimizedSetState];
}

export function useShallowMemo<T>(
  factory: () => T,
  deps: React.DependencyList
): T {
  const ref = useRef<{ deps: React.DependencyList; value: T }>();

  if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
    ref.current = {
      deps: [...deps],
      value: factory()
    };
  }

  return ref.current.value;
}

function shallowEqual(a: React.DependencyList, b: React.DependencyList): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}