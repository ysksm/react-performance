import { DataCenter } from '../../domain/entities/DataCenter';
import type { IDataCenterRepository } from '../../domain/repositories/IDataCenterRepository';

export interface IGetDataCentersUseCase {
  execute(): Promise<DataCenter[]>;
}

export class GetDataCentersUseCase implements IGetDataCentersUseCase {
  private readonly dataCenterRepository: IDataCenterRepository;

  constructor(dataCenterRepository: IDataCenterRepository) {
    this.dataCenterRepository = dataCenterRepository;
  }

  async execute(): Promise<DataCenter[]> {
    try {
      return await this.dataCenterRepository.findAll();
    } catch (error) {
      console.error('Failed to get data centers:', error);
      throw new Error('Unable to fetch data centers');
    }
  }
}