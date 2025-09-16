import { DataCenter } from '../../domain/entities/DataCenter';
import { Rack } from '../../domain/entities/Rack';
import { Server } from '../../domain/entities/Server';
import type { ServerStatus } from '../../domain/entities/Server';
import { Container } from '../../domain/entities/Container';
import type { ContainerStatus } from '../../domain/entities/Container';
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

interface ApiDataCenter {
  id: string;
  name: string;
  location: string;
  racks: ApiRack[];
}

interface ApiRack {
  id: string;
  name: string;
  position: number;
  servers: ApiServer[];
}

interface ApiServer {
  id: string;
  name: string;
  position: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  temperature: number;
  status: ServerStatus;
  errors: string[];
  containers: ApiContainer[];
}

interface ApiContainer {
  id: string;
  name: string;
  image: string;
  status: ContainerStatus;
  cpu: number;
  memory: number;
  ports: string[];
  createdAt: string;
}

export class DataCenterMapper {
  static toDomain(apiData: ApiDataCenter): DataCenter {
    const racks = apiData.racks.map(rackData => this.mapRack(rackData));

    return new DataCenter(
      new DataCenterId(apiData.id),
      new DataCenterName(apiData.name),
      new Location(apiData.location),
      racks
    );
  }

  static toDomainArray(apiDataArray: ApiDataCenter[]): DataCenter[] {
    return apiDataArray.map(apiData => this.toDomain(apiData));
  }

  private static mapRack(rackData: ApiRack): Rack {
    const servers = rackData.servers.map(serverData => this.mapServer(serverData));

    return new Rack(
      new RackId(rackData.id),
      new RackName(rackData.name),
      new Position(rackData.position),
      servers
    );
  }

  private static mapServer(serverData: ApiServer): Server {
    const containers = serverData.containers.map(containerData => this.mapContainer(containerData));

    return new Server(
      new ServerId(serverData.id),
      new ServerName(serverData.name),
      new Position(serverData.position),
      new Percentage(serverData.cpu),
      new Percentage(serverData.memory),
      new Percentage(serverData.disk),
      new Percentage(serverData.network),
      new Temperature(serverData.temperature),
      serverData.status,
      serverData.errors,
      containers
    );
  }

  private static mapContainer(containerData: ApiContainer): Container {
    const ports = containerData.ports.map(port => new Port(port));

    return new Container(
      new ContainerId(containerData.id),
      new ContainerName(containerData.name),
      new ContainerImage(containerData.image),
      containerData.status,
      new Percentage(containerData.cpu),
      new Percentage(containerData.memory),
      ports,
      new Date(containerData.createdAt)
    );
  }
}