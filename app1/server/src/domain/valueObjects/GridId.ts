import { randomUUID } from 'crypto';

/**
 * グリッドIDを表す値オブジェクト
 */
export class GridId {
  private static readonly UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  constructor(private readonly _value: string) {
    if (!GridId.isValid(_value)) {
      throw new Error(`Invalid GridId format: ${_value}`);
    }
  }

  public static generate(): GridId {
    return new GridId(randomUUID());
  }

  public static fromString(value: string): GridId {
    return new GridId(value);
  }

  public static isValid(value: string): boolean {
    return typeof value === 'string' && GridId.UUID_PATTERN.test(value);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: GridId): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
