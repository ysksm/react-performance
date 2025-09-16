export abstract class ValueObject<T> {
  protected readonly _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  equals(other: ValueObject<T>): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return String(this._value);
  }
}

export class DataCenterId extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DataCenter ID cannot be empty');
    }
    super(value.trim());
  }
}

export class DataCenterName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DataCenter name cannot be empty');
    }
    super(value.trim());
  }
}

export class Location extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Location cannot be empty');
    }
    super(value.trim());
  }
}

export class RackId extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Rack ID cannot be empty');
    }
    super(value.trim());
  }
}

export class RackName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Rack name cannot be empty');
    }
    super(value.trim());
  }
}

export class Position extends ValueObject<number> {
  constructor(value: number) {
    if (value < 0) {
      throw new Error('Position cannot be negative');
    }
    super(value);
  }
}

export class ServerId extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Server ID cannot be empty');
    }
    super(value.trim());
  }
}

export class ServerName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Server name cannot be empty');
    }
    super(value.trim());
  }
}

export class Percentage extends ValueObject<number> {
  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error('Percentage must be between 0 and 100');
    }
    super(value);
  }
}

export class Temperature extends ValueObject<number> {
  constructor(value: number) {
    if (value < -273.15) {
      throw new Error('Temperature cannot be below absolute zero');
    }
    super(value);
  }
}

export class ContainerId extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Container ID cannot be empty');
    }
    super(value.trim());
  }
}

export class ContainerName extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Container name cannot be empty');
    }
    super(value.trim());
  }
}

export class ContainerImage extends ValueObject<string> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Container image cannot be empty');
    }
    super(value.trim());
  }
}

export class Port extends ValueObject<string> {
  constructor(value: string) {
    const portRegex = /^\d+:\d+$/;
    if (!portRegex.test(value)) {
      throw new Error('Port must be in format "host:container" (e.g., "8080:80")');
    }
    super(value);
  }
}