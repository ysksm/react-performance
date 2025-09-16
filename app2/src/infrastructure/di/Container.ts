type Constructor<T = object> = new (...args: unknown[]) => T;
type Factory<T> = () => T;
type ServiceDefinition<T> = Constructor<T> | Factory<T>;

interface ServiceRegistry {
  [key: string]: {
    definition: ServiceDefinition<unknown>;
    instance?: unknown;
    singleton: boolean;
  };
}

export class Container {
  private services: ServiceRegistry = {};

  register<T>(
    token: string,
    definition: ServiceDefinition<T>,
    singleton: boolean = true
  ): void {
    this.services[token] = {
      definition,
      singleton,
    };
  }

  registerSingleton<T>(token: string, definition: ServiceDefinition<T>): void {
    this.register(token, definition, true);
  }

  registerTransient<T>(token: string, definition: ServiceDefinition<T>): void {
    this.register(token, definition, false);
  }

  resolve<T>(token: string): T {
    const service = this.services[token];

    if (!service) {
      throw new Error(`Service ${token} not found`);
    }

    if (service.singleton && service.instance) {
      return service.instance as T;
    }

    const instance = this.createInstance(service.definition);

    if (service.singleton) {
      service.instance = instance;
    }

    return instance as T;
  }

  private createInstance<T>(definition: ServiceDefinition<T>): T {
    if (this.isConstructor(definition)) {
      return new definition();
    } else {
      return definition();
    }
  }

  private isConstructor<T>(definition: ServiceDefinition<T>): definition is Constructor<T> {
    return definition.prototype !== undefined;
  }

  clear(): void {
    this.services = {};
  }
}

export const container = new Container();