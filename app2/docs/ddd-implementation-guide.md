# DDD実装ガイド

## 概要

本システムのドメイン駆動設計（Domain-Driven Design）の実装方針と具体的な実装パターンについて説明します。

## ドメイン層の設計思想

### 1. ビジネスルールの中心化

ドメイン層がビジネスロジックの唯一の真実として機能し、技術的詳細から独立しています。

```typescript
// ✅ 良い例: ドメインエンティティ内のビジネスルール
class Server {
  start(): void {
    if (this._status === ServerStatus.ERROR) {
      throw new DomainError('エラー状態のサーバーは起動できません');
    }
    this._status = ServerStatus.RUNNING;
  }
}

// ❌ 悪い例: UIコンポーネント内のビジネスルール
const ServerComponent = () => {
  const handleStart = () => {
    if (server.status === 'error') {
      alert('エラー状態のサーバーは起動できません');
      return;
    }
    // サーバー起動処理
  };
}
```

### 2. 値オブジェクトによる型安全性

プリミティブ型の代わりに値オブジェクトを使用し、ドメインの意味を明確にします。

```typescript
// 値オブジェクトの実装例
export class Id {
  private readonly _value: string;

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('IDは空文字にできません');
    }
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  equals(other: Id): boolean {
    return this._value === other._value;
  }
}

export class Cpu {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new Error('CPU使用率は0-100の範囲で指定してください');
    }
    this._value = value;
  }

  get value(): number {
    return this._value;
  }

  isHigh(): boolean {
    return this._value > 80;
  }

  equals(other: Cpu): boolean {
    return this._value === other._value;
  }
}
```

## エンティティの実装パターン

### 1. 不変性とカプセル化

```typescript
export class DataCenter {
  private readonly _id: Id;
  private readonly _name: Name;
  private readonly _location: Location;
  private readonly _racks: Rack[];

  constructor(id: Id, name: Name, location: Location, racks: Rack[] = []) {
    this._id = id;
    this._name = name;
    this._location = location;
    this._racks = [...racks]; // 防御的コピー
  }

  // ゲッターのみ提供（不変性保証）
  get id(): Id { return this._id; }
  get name(): Name { return this._name; }
  get location(): Location { return this._location; }
  get racks(): readonly Rack[] { return [...this._racks]; }

  // ビジネスルールを含むメソッド
  addRack(rack: Rack): DataCenter {
    if (this.findRack(rack.id)) {
      throw new DomainError('既に存在するラックIDです');
    }

    const newRacks = [...this._racks, rack];
    return new DataCenter(this._id, this._name, this._location, newRacks);
  }

  removeRack(rackId: Id): DataCenter {
    const rackIndex = this._racks.findIndex(rack => rack.id.equals(rackId));
    if (rackIndex === -1) {
      throw new DomainError('指定されたラックが見つかりません');
    }

    const newRacks = this._racks.filter((_, index) => index !== rackIndex);
    return new DataCenter(this._id, this._name, this._location, newRacks);
  }

  findRack(rackId: Id): Rack | undefined {
    return this._racks.find(rack => rack.id.equals(rackId));
  }

  // ドメインサービス的な計算ロジック
  getTotalServerCount(): number {
    return this._racks.reduce((sum, rack) => sum + rack.servers.length, 0);
  }

  getErrorServerCount(): number {
    return this._racks.reduce((sum, rack) =>
      sum + rack.servers.filter(server =>
        server.status === ServerStatus.ERROR || server.errors.length > 0
      ).length, 0
    );
  }
}
```

### 2. 集約ルートの責務

```typescript
// Server は Container の集約ルート
export class Server {
  private _containers: Container[];

  // 集約内の一貫性を保証
  addContainer(container: Container): void {
    if (this._status !== ServerStatus.RUNNING) {
      throw new DomainError('実行中でないサーバーにはコンテナを追加できません');
    }

    if (this._containers.length >= 10) {
      throw new DomainError('サーバーあたりのコンテナ数上限は10です');
    }

    this._containers.push(container);
  }

  removeContainer(containerId: Id): void {
    const containerIndex = this._containers.findIndex(c => c.id.equals(containerId));
    if (containerIndex === -1) {
      throw new DomainError('指定されたコンテナが見つかりません');
    }

    // ビジネスルール: 実行中のコンテナは削除不可
    const container = this._containers[containerIndex];
    if (container.status === ContainerStatus.RUNNING) {
      throw new DomainError('実行中のコンテナは削除できません');
    }

    this._containers.splice(containerIndex, 1);
  }

  // サーバー停止時は全コンテナも停止
  stop(): void {
    this._containers.forEach(container => {
      if (container.status === ContainerStatus.RUNNING) {
        container.stop();
      }
    });
    this._status = ServerStatus.STOPPED;
  }
}
```

## リポジトリパターンの実装

### 1. インターフェース定義

```typescript
// ドメイン層のリポジトリインターフェース
export interface IDataCenterRepository {
  findAll(): Promise<DataCenter[]>;
  findById(id: Id): Promise<DataCenter | null>;
  save(dataCenter: DataCenter): Promise<void>;
  delete(id: Id): Promise<void>;
}

export interface IServerRepository {
  findById(id: Id): Promise<Server | null>;
  updateStatus(id: Id, status: ServerStatus): Promise<void>;
  save(server: Server): Promise<void>;
}
```

### 2. インフラストラクチャ層での実装

```typescript
// インフラストラクチャ層のHTTP実装
export class HttpDataCenterRepository implements IDataCenterRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly mapper: DataCenterMapper
  ) {}

  async findAll(): Promise<DataCenter[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/datacenters`);
      if (!response.ok) {
        throw new InfrastructureError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();
      return this.mapper.mapToDomain(jsonData);
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError(`データセンター取得に失敗しました: ${error}`);
    }
  }

  async findById(id: Id): Promise<DataCenter | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/datacenters/${id.value}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new InfrastructureError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const jsonData = await response.json();
      return this.mapper.mapToDomain([jsonData])[0];
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError(`データセンター取得に失敗しました: ${error}`);
    }
  }

  async save(dataCenter: DataCenter): Promise<void> {
    try {
      const jsonData = this.mapper.mapToInfrastructure(dataCenter);
      const response = await fetch(`${this.baseUrl}/api/datacenters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        throw new InfrastructureError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error instanceof InfrastructureError) {
        throw error;
      }
      throw new InfrastructureError(`データセンター保存に失敗しました: ${error}`);
    }
  }
}
```

## ユースケースの実装パターン

### 1. 単一責任原則

```typescript
// 各ユースケースは単一の責務を持つ
export class GetDataCentersUseCase implements IGetDataCentersUseCase {
  constructor(
    private readonly repository: IDataCenterRepository
  ) {}

  async execute(): Promise<DataCenter[]> {
    try {
      const dataCenters = await this.repository.findAll();

      // ビジネスルール: アクティブなデータセンターのみ返す
      return dataCenters.filter(dc => this.isActive(dc));
    } catch (error) {
      if (error instanceof DomainError || error instanceof InfrastructureError) {
        throw error;
      }
      throw new ApplicationError(`データセンター取得に失敗しました: ${error}`);
    }
  }

  private isActive(dataCenter: DataCenter): boolean {
    // ビジネスルール: 1つ以上のラックがあるデータセンターはアクティブ
    return dataCenter.racks.length > 0;
  }
}

export class ManageServerUseCase implements IManageServerUseCase {
  constructor(
    private readonly repository: IServerRepository
  ) {}

  async execute(serverId: string, action: ServerAction): Promise<void> {
    try {
      const id = new Id(serverId);
      const server = await this.repository.findById(id);

      if (!server) {
        throw new DomainError('指定されたサーバーが見つかりません');
      }

      // ドメインオブジェクトにビジネスロジックを委譲
      switch (action) {
        case 'start':
          server.start();
          break;
        case 'stop':
          server.stop();
          break;
        case 'restart':
          server.restart();
          break;
        default:
          throw new DomainError('不正なアクションです');
      }

      await this.repository.save(server);
    } catch (error) {
      if (error instanceof DomainError || error instanceof InfrastructureError) {
        throw error;
      }
      throw new ApplicationError(`サーバー操作に失敗しました: ${error}`);
    }
  }
}
```

## 依存性注入の実装

### 1. DIコンテナの設計

```typescript
// トークン定義
export const TOKENS = {
  // Repositories
  DATA_CENTER_REPOSITORY: Symbol('DataCenterRepository'),
  SERVER_REPOSITORY: Symbol('ServerRepository'),
  CONTAINER_REPOSITORY: Symbol('ContainerRepository'),

  // Use Cases
  GET_DATA_CENTERS_USE_CASE: Symbol('GetDataCentersUseCase'),
  MANAGE_SERVER_USE_CASE: Symbol('ManageServerUseCase'),
  MANAGE_CONTAINER_USE_CASE: Symbol('ManageContainerUseCase'),

  // Infrastructure
  DATA_CENTER_MAPPER: Symbol('DataCenterMapper'),
  HTTP_CLIENT: Symbol('HttpClient')
} as const;

// サービス登録
export class ServiceRegistry {
  static configure(container: Container): void {
    // Infrastructure
    container.register(TOKENS.DATA_CENTER_MAPPER, () => new DataCenterMapper());
    container.register(TOKENS.HTTP_CLIENT, () => new HttpClient());

    // Repositories
    container.register(TOKENS.DATA_CENTER_REPOSITORY, (c) =>
      new HttpDataCenterRepository(
        'http://localhost:3001',
        c.resolve(TOKENS.DATA_CENTER_MAPPER)
      )
    );

    container.register(TOKENS.SERVER_REPOSITORY, (c) =>
      new HttpServerRepository('http://localhost:3001')
    );

    // Use Cases
    container.register(TOKENS.GET_DATA_CENTERS_USE_CASE, (c) =>
      new GetDataCentersUseCase(
        c.resolve(TOKENS.DATA_CENTER_REPOSITORY)
      )
    );

    container.register(TOKENS.MANAGE_SERVER_USE_CASE, (c) =>
      new ManageServerUseCase(
        c.resolve(TOKENS.SERVER_REPOSITORY)
      )
    );
  }
}
```

### 2. React Hooksでの利用

```typescript
// プレゼンテーション層でのDI利用
export function useDataCenters(): UseDataCentersResult {
  const [dataCenters, setDataCenters] = useState<LegacyDataCenter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // DIコンテナからユースケースを取得
  const getDataCentersUseCase = container.resolve<IGetDataCentersUseCase>(
    TOKENS.GET_DATA_CENTERS_USE_CASE
  );

  const fetchDataCenters = useCallback(async () => {
    try {
      setLoading(true);
      const domainResult = await getDataCentersUseCase.execute();
      const legacyResult = convertDataCentersToLegacy(domainResult);
      setDataCenters(legacyResult);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [getDataCentersUseCase]);

  useEffect(() => {
    fetchDataCenters();
    const interval = setInterval(fetchDataCenters, 1000);
    return () => clearInterval(interval);
  }, [fetchDataCenters]);

  return { dataCenters, loading, error, refetch: fetchDataCenters };
}
```

## エラーハンドリング戦略

### 1. ドメインエラーの階層化

```typescript
// ベースエラークラス
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    if (cause) {
      this.stack += `\nCaused by: ${cause.stack}`;
    }
  }
}

// 具体的なエラークラス
export class ServerNotFoundError extends DomainError {
  readonly code = 'SERVER_NOT_FOUND';

  constructor(serverId: string) {
    super(`Server with ID ${serverId} not found`);
  }
}

export class InvalidServerStateError extends DomainError {
  readonly code = 'INVALID_SERVER_STATE';

  constructor(currentState: string, operation: string) {
    super(`Cannot perform ${operation} on server in ${currentState} state`);
  }
}

// アプリケーション層エラー
export class ApplicationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ApplicationError';
  }
}

// インフラストラクチャ層エラー
export class InfrastructureError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'InfrastructureError';
  }
}
```

### 2. エラー境界での処理

```typescript
// React Error Boundaryでのエラーハンドリング
export class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // エラーの種類に応じた処理
    if (error instanceof DomainError) {
      // ドメインエラー: ユーザーに分かりやすいメッセージを表示
      this.notifyUser(`操作できませんでした: ${error.message}`);
    } else if (error instanceof InfrastructureError) {
      // インフラエラー: 接続問題として処理
      this.notifyUser('接続に問題があります。しばらく待ってから再試行してください。');
    } else {
      // 予期しないエラー: 一般的なエラーメッセージ
      this.notifyUser('予期しないエラーが発生しました。');
    }
  }

  private notifyUser(message: string) {
    // トースト通知などでユーザーに通知
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

## テスト戦略

### 1. ドメインエンティティのテスト

```typescript
describe('Server', () => {
  describe('start', () => {
    it('正常状態のサーバーを起動できる', () => {
      const server = new Server(
        new Id('server-1'),
        new Name('Test Server'),
        new Position(1),
        new Cpu(50),
        new Memory(4096),
        new Memory(500),
        new Cpu(10),
        new Temperature(45),
        ServerStatus.STOPPED,
        [],
        []
      );

      server.start();

      expect(server.status).toBe(ServerStatus.RUNNING);
    });

    it('エラー状態のサーバーは起動できない', () => {
      const server = new Server(
        new Id('server-1'),
        new Name('Test Server'),
        new Position(1),
        new Cpu(50),
        new Memory(4096),
        new Memory(500),
        new Cpu(10),
        new Temperature(45),
        ServerStatus.ERROR,
        [],
        []
      );

      expect(() => server.start()).toThrow('エラー状態のサーバーは起動できません');
    });
  });
});
```

### 2. ユースケースのテスト

```typescript
describe('GetDataCentersUseCase', () => {
  let useCase: GetDataCentersUseCase;
  let mockRepository: jest.Mocked<IDataCenterRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn()
    };
    useCase = new GetDataCentersUseCase(mockRepository);
  });

  it('アクティブなデータセンターのみを返す', async () => {
    const dataCenters = [
      createDataCenterWithRacks(1), // アクティブ
      createDataCenterWithRacks(0)  // 非アクティブ
    ];
    mockRepository.findAll.mockResolvedValue(dataCenters);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].racks.length).toBeGreaterThan(0);
  });

  it('リポジトリエラーをアプリケーションエラーとして再スロー', async () => {
    mockRepository.findAll.mockRejectedValue(new InfrastructureError('Network error'));

    await expect(useCase.execute()).rejects.toThrow(ApplicationError);
  });
});
```

## まとめ

このDDD実装により以下を実現：

1. **ビジネスロジックの中心化**: ドメイン層がビジネスルールの唯一の真実
2. **技術的関心事の分離**: 各層が明確な責務を持つ
3. **テスタビリティ**: 依存性注入により単体テスト容易
4. **保守性**: ビジネスルールの変更が技術的詳細に影響しない
5. **拡張性**: 新しい機能追加時の影響範囲を限定

DDDの原則に従うことで、長期的に保守可能で変更に強いシステムを構築できます。