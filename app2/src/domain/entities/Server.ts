import { Container } from './Container';
import { ServerId, ServerName, Position, Percentage, Temperature } from '../value-objects';

export type ServerStatus = 'running' | 'stopped' | 'maintenance' | 'error' | 'warning';

export class Server {
  private readonly _id: ServerId;
  private readonly _name: ServerName;
  private readonly _position: Position;
  private readonly _cpu: Percentage;
  private readonly _memory: Percentage;
  private readonly _disk: Percentage;
  private readonly _network: Percentage;
  private readonly _temperature: Temperature;
  private readonly _status: ServerStatus;
  private readonly _errors: string[];
  private readonly _containers: Container[];

  constructor(
    id: ServerId,
    name: ServerName,
    position: Position,
    cpu: Percentage,
    memory: Percentage,
    disk: Percentage,
    network: Percentage,
    temperature: Temperature,
    status: ServerStatus,
    errors: string[],
    containers: Container[]
  ) {
    this._id = id;
    this._name = name;
    this._position = position;
    this._cpu = cpu;
    this._memory = memory;
    this._disk = disk;
    this._network = network;
    this._temperature = temperature;
    this._status = status;
    this._errors = errors;
    this._containers = containers;
  }

  get id(): ServerId {
    return this._id;
  }

  get name(): ServerName {
    return this._name;
  }

  get position(): Position {
    return this._position;
  }

  get cpu(): Percentage {
    return this._cpu;
  }

  get memory(): Percentage {
    return this._memory;
  }

  get disk(): Percentage {
    return this._disk;
  }

  get network(): Percentage {
    return this._network;
  }

  get temperature(): Temperature {
    return this._temperature;
  }

  get status(): ServerStatus {
    return this._status;
  }

  get errors(): string[] {
    return [...this._errors];
  }

  get containers(): Container[] {
    return [...this._containers];
  }

  getContainerCount(): number {
    return this._containers.length;
  }

  getRunningContainers(): Container[] {
    return this._containers.filter(container => container.isRunning());
  }

  isRunning(): boolean {
    return this._status === 'running';
  }

  hasErrors(): boolean {
    return this._errors.length > 0 || this._status === 'error';
  }

  hasWarnings(): boolean {
    return this._status === 'warning' ||
           this._cpu.value > 80 ||
           this._memory.value > 80 ||
           this._temperature.value > 75;
  }

  getHealthStatus(): 'healthy' | 'warning' | 'error' {
    if (this.hasErrors()) return 'error';
    if (this.hasWarnings()) return 'warning';
    return 'healthy';
  }

  getContainerById(containerId: string): Container | undefined {
    return this._containers.find(container => container.id.value === containerId);
  }

  equals(other: Server): boolean {
    return this._id.equals(other._id);
  }
}