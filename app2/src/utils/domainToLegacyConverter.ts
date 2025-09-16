// Converter utility to transform domain entities to legacy interface types
import { DataCenter as DomainDataCenter } from '../domain/entities/DataCenter';
import { Rack as DomainRack } from '../domain/entities/Rack';
import { Server as DomainServer } from '../domain/entities/Server';
import { Container as DomainContainer } from '../domain/entities/Container';
import type {
  DataCenter as LegacyDataCenter,
  Rack as LegacyRack,
  Server as LegacyServer,
  Container as LegacyContainer
} from '../types/ServerData';

/**
 * Converts a domain Container entity to legacy Container interface
 */
export function convertContainerToLegacy(domainContainer: DomainContainer): LegacyContainer {
  return {
    id: domainContainer.id.value,
    name: domainContainer.name.value,
    image: domainContainer.image.value,
    status: domainContainer.status,
    cpu: domainContainer.cpu.value,
    memory: domainContainer.memory.value,
    ports: domainContainer.ports.map(port => port.value),
    createdAt: domainContainer.createdAt.toISOString(),
  };
}

/**
 * Converts a domain Server entity to legacy Server interface
 */
export function convertServerToLegacy(domainServer: DomainServer): LegacyServer {
  // Map domain server status to legacy status - 'stopped' maps to 'maintenance'
  const legacyStatus = domainServer.status === 'stopped' ? 'maintenance' : domainServer.status;

  return {
    id: domainServer.id.value,
    name: domainServer.name.value,
    position: domainServer.position.value,
    cpu: domainServer.cpu.value,
    memory: domainServer.memory.value,
    disk: domainServer.disk.value,
    network: domainServer.network.value,
    temperature: domainServer.temperature.value,
    errors: domainServer.errors,
    status: legacyStatus as 'running' | 'warning' | 'error' | 'maintenance',
    containers: domainServer.containers.map(convertContainerToLegacy),
  };
}

/**
 * Converts a domain Rack entity to legacy Rack interface
 */
export function convertRackToLegacy(domainRack: DomainRack): LegacyRack {
  return {
    id: domainRack.id.value,
    name: domainRack.name.value,
    position: domainRack.position.value,
    servers: domainRack.servers.map(convertServerToLegacy),
  };
}

/**
 * Converts a domain DataCenter entity to legacy DataCenter interface
 */
export function convertDataCenterToLegacy(domainDataCenter: DomainDataCenter): LegacyDataCenter {
  return {
    id: domainDataCenter.id.value,
    name: domainDataCenter.name.value,
    location: domainDataCenter.location.value,
    racks: domainDataCenter.racks.map(convertRackToLegacy),
  };
}

/**
 * Converts an array of domain DataCenter entities to legacy DataCenter interfaces
 */
export function convertDataCentersToLegacy(domainDataCenters: DomainDataCenter[]): LegacyDataCenter[] {
  return domainDataCenters.map(convertDataCenterToLegacy);
}