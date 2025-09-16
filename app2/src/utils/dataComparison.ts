import type { DataCenter, Rack, Server, Container } from '../types/ServerData';

export function isEqual<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!isEqual((a as any)[key], (b as any)[key])) return false;
  }

  return true;
}

export function containerEquals(a: Container, b: Container): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.image === b.image &&
    a.status === b.status &&
    a.cpu === b.cpu &&
    a.memory === b.memory &&
    a.createdAt === b.createdAt &&
    JSON.stringify(a.ports) === JSON.stringify(b.ports)
  );
}

export function serverEquals(a: Server, b: Server): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.position === b.position &&
    a.status === b.status &&
    a.cpu === b.cpu &&
    a.memory === b.memory &&
    a.disk === b.disk &&
    a.network === b.network &&
    a.temperature === b.temperature &&
    JSON.stringify(a.errors) === JSON.stringify(b.errors) &&
    a.containers.length === b.containers.length &&
    a.containers.every((container, index) =>
      containerEquals(container, b.containers[index])
    )
  );
}

export function rackEquals(a: Rack, b: Rack): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.position === b.position &&
    a.servers.length === b.servers.length &&
    a.servers.every((server, index) =>
      serverEquals(server, b.servers[index])
    )
  );
}

export function dataCenterEquals(a: DataCenter, b: DataCenter): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.location === b.location &&
    a.racks.length === b.racks.length &&
    a.racks.every((rack, index) =>
      rackEquals(rack, b.racks[index])
    )
  );
}

export function dataCentersArrayEquals(a: DataCenter[], b: DataCenter[]): boolean {
  return (
    a.length === b.length &&
    a.every((dc, index) => dataCenterEquals(dc, b[index]))
  );
}

export function shallowContainerEquals(a: Container, b: Container): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.status === b.status &&
    a.cpu === b.cpu &&
    a.memory === b.memory
  );
}

export function shallowServerEquals(a: Server, b: Server): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.status === b.status &&
    a.cpu === b.cpu &&
    a.memory === b.memory &&
    a.disk === b.disk &&
    a.temperature === b.temperature &&
    a.containers.length === b.containers.length
  );
}

export function createMemoComparator<T>(
  isEqual: (a: T, b: T) => boolean
) {
  return (prevProps: { [K in keyof T]: T[K] }, nextProps: { [K in keyof T]: T[K] }): boolean => {
    const prevKeys = Object.keys(prevProps) as (keyof T)[];
    const nextKeys = Object.keys(nextProps) as (keyof T)[];

    if (prevKeys.length !== nextKeys.length) return false;

    for (const key of prevKeys) {
      if (!nextKeys.includes(key)) return false;

      if (key === 'dataCenter' || key === 'dataCenters') {
        if (Array.isArray(prevProps[key]) && Array.isArray(nextProps[key])) {
          if (!dataCentersArrayEquals(prevProps[key] as any, nextProps[key] as any)) {
            return false;
          }
        } else if (prevProps[key] && nextProps[key]) {
          if (!dataCenterEquals(prevProps[key] as any, nextProps[key] as any)) {
            return false;
          }
        } else if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      } else if (key === 'rack') {
        if (prevProps[key] && nextProps[key]) {
          if (!rackEquals(prevProps[key] as any, nextProps[key] as any)) {
            return false;
          }
        } else if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      } else if (key === 'server') {
        if (prevProps[key] && nextProps[key]) {
          if (!serverEquals(prevProps[key] as any, nextProps[key] as any)) {
            return false;
          }
        } else if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      } else if (key === 'container') {
        if (prevProps[key] && nextProps[key]) {
          if (!containerEquals(prevProps[key] as any, nextProps[key] as any)) {
            return false;
          }
        } else if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      } else {
        if (prevProps[key] !== nextProps[key]) {
          return false;
        }
      }
    }

    return true;
  };
}