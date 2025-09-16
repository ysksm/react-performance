import { useMemo } from 'react';
import type { DataCenter, Rack, Server, Container, ViewMode } from '../types/ServerData';

export interface FilteredData {
  dataCenters: DataCenter[];
  totalRacks: number;
  totalServers: number;
  totalContainers: number;
  activeErrors: number;
  activeWarnings: number;
}

export function useFilteredDataByMode(
  dataCenters: DataCenter[],
  viewMode: ViewMode,
  selectedDataCenter?: DataCenter | null,
  selectedRack?: Rack | null
): FilteredData {
  return useMemo(() => {
    if (dataCenters.length === 0) {
      return {
        dataCenters: [],
        totalRacks: 0,
        totalServers: 0,
        totalContainers: 0,
        activeErrors: 0,
        activeWarnings: 0
      };
    }

    switch (viewMode) {
      case 'overview': {
        // Full dataset needed for overview
        const totalRacks = dataCenters.reduce((sum, dc) => sum + dc.racks.length, 0);
        const totalServers = dataCenters.reduce(
          (sum, dc) => sum + dc.racks.reduce((rackSum, rack) => rackSum + rack.servers.length, 0),
          0
        );
        const totalContainers = dataCenters.reduce(
          (sum, dc) =>
            sum +
            dc.racks.reduce(
              (rackSum, rack) =>
                rackSum + rack.servers.reduce((serverSum, server) => serverSum + server.containers.length, 0),
              0
            ),
          0
        );
        const activeErrors = dataCenters.reduce(
          (sum, dc) =>
            sum +
            dc.racks.reduce(
              (rackSum, rack) =>
                rackSum + rack.servers.filter(server => server.status === 'error' || server.errors.length > 0).length,
              0
            ),
          0
        );
        const activeWarnings = dataCenters.reduce(
          (sum, dc) =>
            sum +
            dc.racks.reduce(
              (rackSum, rack) => rackSum + rack.servers.filter(server => server.status === 'warning').length,
              0
            ),
          0
        );

        return {
          dataCenters,
          totalRacks,
          totalServers,
          totalContainers,
          activeErrors,
          activeWarnings
        };
      }

      case 'racks': {
        if (!selectedDataCenter) {
          return {
            dataCenters: [],
            totalRacks: 0,
            totalServers: 0,
            totalContainers: 0,
            activeErrors: 0,
            activeWarnings: 0
          };
        }

        // Only the selected datacenter with detailed rack data
        const totalServers = selectedDataCenter.racks.reduce((sum, rack) => sum + rack.servers.length, 0);
        const totalContainers = selectedDataCenter.racks.reduce(
          (sum, rack) => sum + rack.servers.reduce((serverSum, server) => serverSum + server.containers.length, 0),
          0
        );
        const activeErrors = selectedDataCenter.racks.reduce(
          (sum, rack) => sum + rack.servers.filter(server => server.status === 'error' || server.errors.length > 0).length,
          0
        );
        const activeWarnings = selectedDataCenter.racks.reduce(
          (sum, rack) => sum + rack.servers.filter(server => server.status === 'warning').length,
          0
        );

        return {
          dataCenters: [selectedDataCenter],
          totalRacks: selectedDataCenter.racks.length,
          totalServers,
          totalContainers,
          activeErrors,
          activeWarnings
        };
      }

      case 'servers': {
        if (!selectedDataCenter || !selectedRack) {
          return {
            dataCenters: [],
            totalRacks: 0,
            totalServers: 0,
            totalContainers: 0,
            activeErrors: 0,
            activeWarnings: 0
          };
        }

        // Only the selected rack with detailed server data
        const totalContainers = selectedRack.servers.reduce((sum, server) => sum + server.containers.length, 0);
        const activeErrors = selectedRack.servers.filter(server => server.status === 'error' || server.errors.length > 0).length;
        const activeWarnings = selectedRack.servers.filter(server => server.status === 'warning').length;

        const filteredDataCenter = {
          ...selectedDataCenter,
          racks: [selectedRack]
        };

        return {
          dataCenters: [filteredDataCenter],
          totalRacks: 1,
          totalServers: selectedRack.servers.length,
          totalContainers,
          activeErrors,
          activeWarnings
        };
      }

      case 'containers': {
        if (!selectedDataCenter || !selectedRack) {
          return {
            dataCenters: [],
            totalRacks: 0,
            totalServers: 0,
            totalContainers: 0,
            activeErrors: 0,
            activeWarnings: 0
          };
        }

        // Minimal data structure for containers view
        const filteredDataCenter = {
          ...selectedDataCenter,
          racks: [selectedRack]
        };

        const totalContainers = selectedRack.servers.reduce((sum, server) => sum + server.containers.length, 0);
        const activeErrors = selectedRack.servers.reduce(
          (sum, server) => sum + server.containers.filter(container => container.status === 'error').length,
          0
        );

        return {
          dataCenters: [filteredDataCenter],
          totalRacks: 1,
          totalServers: selectedRack.servers.length,
          totalContainers,
          activeErrors,
          activeWarnings: 0 // Containers don't have warning status in our model
        };
      }

      default:
        return {
          dataCenters,
          totalRacks: 0,
          totalServers: 0,
          totalContainers: 0,
          activeErrors: 0,
          activeWarnings: 0
        };
    }
  }, [dataCenters, viewMode, selectedDataCenter, selectedRack]);
}

export function useServersByStatus(servers: Server[]) {
  return useMemo(() => {
    const running = servers.filter(server => server.status === 'running');
    const stopped = servers.filter(server => server.status === 'maintenance');
    const maintenance = servers.filter(server => server.status === 'maintenance');
    const error = servers.filter(server => server.status === 'error' || server.errors.length > 0);
    const warning = servers.filter(server => server.status === 'warning');

    return {
      running,
      stopped,
      maintenance,
      error,
      warning,
      total: servers.length
    };
  }, [servers]);
}

export function useContainersByStatus(containers: Container[]) {
  return useMemo(() => {
    const running = containers.filter(container => container.status === 'running');
    const stopped = containers.filter(container => container.status === 'stopped');
    const paused = containers.filter(container => container.status === 'paused');
    const error = containers.filter(container => container.status === 'error');

    return {
      running,
      stopped,
      paused,
      error,
      total: containers.length
    };
  }, [containers]);
}

export function useResourceMetrics(entities: (Server | Container)[]) {
  return useMemo(() => {
    if (entities.length === 0) {
      return {
        avgCpu: 0,
        avgMemory: 0,
        maxCpu: 0,
        maxMemory: 0,
        minCpu: 0,
        minMemory: 0
      };
    }

    const cpuValues = entities.map(entity => entity.cpu);
    const memoryValues = entities.map(entity => entity.memory);

    const avgCpu = cpuValues.reduce((sum, cpu) => sum + cpu, 0) / cpuValues.length;
    const avgMemory = memoryValues.reduce((sum, memory) => sum + memory, 0) / memoryValues.length;

    return {
      avgCpu: Math.round(avgCpu * 10) / 10,
      avgMemory: Math.round(avgMemory * 10) / 10,
      maxCpu: Math.max(...cpuValues),
      maxMemory: Math.max(...memoryValues),
      minCpu: Math.min(...cpuValues),
      minMemory: Math.min(...memoryValues)
    };
  }, [entities]);
}