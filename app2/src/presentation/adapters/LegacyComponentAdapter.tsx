import { DataCenter as DomainDataCenter } from '../../domain/entities/DataCenter';
import { Rack as DomainRack } from '../../domain/entities/Rack';
import { Server as DomainServer } from '../../domain/entities/Server';
import { Container as DomainContainer } from '../../domain/entities/Container';
import {
  DataCenterId,
  DataCenterName,
  Location,
  RackId,
  RackName,
  Position,
  ServerId,
  ServerName,
  Percentage,
  Temperature,
  ContainerId,
  ContainerName,
  ContainerImage,
  Port
} from '../../domain/value-objects';

// Legacy types for existing components
export interface LegacyDataCenter {
  id: string;
  name: string;
  location: string;
  racks: LegacyRack[];
}

export interface LegacyRack {
  id: string;
  name: string;
  position: number;
  servers: LegacyServer[];
}

export interface LegacyServer {
  id: string;
  name: string;
  position: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  status: 'running' | 'stopped' | 'maintenance' | 'error' | 'warning';
  errors: string[];
  containers: LegacyContainer[];
}

export interface LegacyContainer {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'paused' | 'error';
  cpu: number;
  memory: number;
  ports: string[];
  createdAt: string;
}

export class LegacyComponentAdapter {
  static toDomainDataCenter(legacy: LegacyDataCenter): DomainDataCenter {
    const racks = legacy.racks.map(rack => this.toDomainRack(rack));

    return new DomainDataCenter(
      new DataCenterId(legacy.id),
      new DataCenterName(legacy.name),
      new Location(legacy.location),
      racks
    );
  }

  static toDomainRack(legacy: LegacyRack): DomainRack {
    const servers = legacy.servers.map(server => this.toDomainServer(server));

    return new DomainRack(
      new RackId(legacy.id),
      new RackName(legacy.name),
      new Position(legacy.position),
      servers
    );
  }

  static toDomainServer(legacy: LegacyServer): DomainServer {
    const containers = legacy.containers.map(container => this.toDomainContainer(container));

    return new DomainServer(
      new ServerId(legacy.id),
      new ServerName(legacy.name),
      new Position(legacy.position),
      new Percentage(legacy.cpu),
      new Percentage(legacy.memory),
      new Percentage(legacy.disk),
      new Percentage(legacy.network),
      new Temperature(legacy.temperature),
      legacy.status,
      legacy.errors,
      containers
    );
  }

  static toDomainContainer(legacy: LegacyContainer): DomainContainer {
    const ports = legacy.ports.map(port => new Port(port));

    return new DomainContainer(
      new ContainerId(legacy.id),
      new ContainerName(legacy.name),
      new ContainerImage(legacy.image),
      legacy.status,
      new Percentage(legacy.cpu),
      new Percentage(legacy.memory),
      ports,
      new Date(legacy.createdAt)
    );
  }

  static toLegacyDataCenter(domain: DomainDataCenter): LegacyDataCenter {
    return {
      id: domain.id.value,
      name: domain.name.value,
      location: domain.location.value,
      racks: domain.racks.map(rack => this.toLegacyRack(rack))
    };
  }

  static toLegacyRack(domain: DomainRack): LegacyRack {
    return {
      id: domain.id.value,
      name: domain.name.value,
      position: domain.position.value,
      servers: domain.servers.map(server => this.toLegacyServer(server))
    };
  }

  static toLegacyServer(domain: DomainServer): LegacyServer {
    return {
      id: domain.id.value,
      name: domain.name.value,
      position: domain.position.value,
      cpu: domain.cpu.value,
      memory: domain.memory.value,
      disk: domain.disk.value,
      network: domain.network.value,
      temperature: domain.temperature.value,
      status: domain.status,
      errors: domain.errors,
      containers: domain.containers.map(container => this.toLegacyContainer(container))
    };
  }

  static toLegacyContainer(domain: DomainContainer): LegacyContainer {
    return {
      id: domain.id.value,
      name: domain.name.value,
      image: domain.image.value,
      status: domain.status,
      cpu: domain.cpu.value,
      memory: domain.memory.value,
      ports: domain.ports.map(port => port.value),
      createdAt: domain.createdAt.toISOString()
    };
  }
}