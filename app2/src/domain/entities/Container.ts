import { ContainerId, ContainerName, ContainerImage, Percentage, Port } from '../value-objects';

export type ContainerStatus = 'running' | 'stopped' | 'paused' | 'error';

export class Container {
  private readonly _id: ContainerId;
  private readonly _name: ContainerName;
  private readonly _image: ContainerImage;
  private readonly _status: ContainerStatus;
  private readonly _cpu: Percentage;
  private readonly _memory: Percentage;
  private readonly _ports: Port[];
  private readonly _createdAt: Date;

  constructor(
    id: ContainerId,
    name: ContainerName,
    image: ContainerImage,
    status: ContainerStatus,
    cpu: Percentage,
    memory: Percentage,
    ports: Port[],
    createdAt: Date
  ) {
    this._id = id;
    this._name = name;
    this._image = image;
    this._status = status;
    this._cpu = cpu;
    this._memory = memory;
    this._ports = ports;
    this._createdAt = createdAt;
  }

  get id(): ContainerId {
    return this._id;
  }

  get name(): ContainerName {
    return this._name;
  }

  get image(): ContainerImage {
    return this._image;
  }

  get status(): ContainerStatus {
    return this._status;
  }

  get cpu(): Percentage {
    return this._cpu;
  }

  get memory(): Percentage {
    return this._memory;
  }

  get ports(): Port[] {
    return [...this._ports];
  }

  get createdAt(): Date {
    return new Date(this._createdAt);
  }

  isRunning(): boolean {
    return this._status === 'running';
  }

  isStopped(): boolean {
    return this._status === 'stopped';
  }

  isPaused(): boolean {
    return this._status === 'paused';
  }

  hasError(): boolean {
    return this._status === 'error';
  }

  getUptime(): number {
    if (!this.isRunning()) return 0;
    return Date.now() - this._createdAt.getTime();
  }

  getUptimeFormatted(): string {
    const uptime = this.getUptime();
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  equals(other: Container): boolean {
    return this._id.equals(other._id);
  }
}