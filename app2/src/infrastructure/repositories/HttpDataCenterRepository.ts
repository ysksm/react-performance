import { DataCenter } from '../../domain/entities/DataCenter';
import { DataCenterId } from '../../domain/value-objects';
import type { IDataCenterRepository } from '../../domain/repositories/IDataCenterRepository';
import { DataCenterMapper } from '../mappers/DataCenterMapper';

export class HttpDataCenterRepository implements IDataCenterRepository {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async findAll(): Promise<DataCenter[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/datacenters`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      return DataCenterMapper.toDomainArray(apiData);
    } catch (error) {
      console.error('Error fetching data centers:', error);
      throw new Error('Failed to fetch data centers from API');
    }
  }

  async findById(id: DataCenterId): Promise<DataCenter | null> {
    const dataCenters = await this.findAll();
    return dataCenters.find(dc => dc.id.equals(id)) || null;
  }

  async save(_dataCenter: DataCenter): Promise<void> {
    // TODO: Implement save operation
    console.log('Save operation called for datacenter:', _dataCenter.id.value);
    throw new Error('Save operation not implemented for HTTP repository');
  }

  async delete(_id: DataCenterId): Promise<void> {
    // TODO: Implement delete operation
    console.log('Delete operation called for datacenter:', _id.value);
    throw new Error('Delete operation not implemented for HTTP repository');
  }
}