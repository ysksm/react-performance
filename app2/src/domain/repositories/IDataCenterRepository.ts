import { DataCenter } from '../entities/DataCenter';
import { DataCenterId } from '../value-objects';

export interface IDataCenterRepository {
  findAll(): Promise<DataCenter[]>;
  findById(id: DataCenterId): Promise<DataCenter | null>;
  save(dataCenter: DataCenter): Promise<void>;
  delete(id: DataCenterId): Promise<void>;
}