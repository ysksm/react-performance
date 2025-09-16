import { Rack } from './Rack';
import { DataCenterId, DataCenterName, Location } from '../value-objects';

export class DataCenter {
  private readonly _id: DataCenterId;
  private readonly _name: DataCenterName;
  private readonly _location: Location;
  private readonly _racks: Rack[];

  constructor(
    id: DataCenterId,
    name: DataCenterName,
    location: Location,
    racks: Rack[]
  ) {
    this._id = id;
    this._name = name;
    this._location = location;
    this._racks = racks;
  }

  get id(): DataCenterId {
    return this._id;
  }

  get name(): DataCenterName {
    return this._name;
  }

  get location(): Location {
    return this._location;
  }

  get racks(): Rack[] {
    return [...this._racks];
  }

  getTotalServers(): number {
    return this._racks.reduce((total, rack) => total + rack.getServerCount(), 0);
  }

  getTotalContainers(): number {
    return this._racks.reduce((total, rack) => total + rack.getTotalContainers(), 0);
  }

  getHealthStatus(): 'healthy' | 'warning' | 'error' {
    const errorRacks = this._racks.filter(rack => rack.getHealthStatus() === 'error');
    const warningRacks = this._racks.filter(rack => rack.getHealthStatus() === 'warning');

    if (errorRacks.length > 0) return 'error';
    if (warningRacks.length > 0) return 'warning';
    return 'healthy';
  }

  getRackById(rackId: string): Rack | undefined {
    return this._racks.find(rack => rack.id.value === rackId);
  }

  equals(other: DataCenter): boolean {
    return this._id.equals(other._id);
  }
}