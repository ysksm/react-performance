# データセンター監視システム アーキテクチャドキュメント

## 概要

このシステムは、データセンター内のラック、サーバー、コンテナを階層的に監視するリアルタイム監視ダッシュボードです。ドメイン駆動設計（DDD）とレイヤードアーキテクチャを採用し、React Performanceの最適化を実現しています。

## システム構成

### 階層構造
```
データセンター (DataCenter)
├── ラック (Rack)
    ├── サーバー (Server)
        ├── コンテナ (Container)
```

### アーキテクチャレイヤー

#### 1. プレゼンテーション層 (Presentation Layer)
- **責務**: UIコンポーネント、ユーザーインタラクション、状態管理
- **場所**: `src/presentation/`, `src/components/`, `src/AppNew.tsx`

#### 2. アプリケーション層 (Application Layer)
- **責務**: ユースケース、ビジネスロジックの調整
- **場所**: `src/application/use-cases/`

#### 3. ドメイン層 (Domain Layer)
- **責務**: ビジネスルール、エンティティ、値オブジェクト
- **場所**: `src/domain/`

#### 4. インフラストラクチャ層 (Infrastructure Layer)
- **責務**: 外部システムとの通信、データ永続化、依存性注入
- **場所**: `src/infrastructure/`

## コンポーネント依存関係図

```mermaid
graph TB
    %% Presentation Layer
    subgraph "Presentation Layer"
        App[AppNew.tsx]
        DC[DataCenterOverview]
        RL[RackListView]
        SG[ServerGridView]
        CM[ContainerManageView]
        NB[NavigationBreadcrumb]
        CI[ConnectionIndicator]
        NT[NotificationToast]
        CD[ConfirmationDialog]
    end

    %% Presentation Hooks
    subgraph "Presentation Hooks"
        UDC[useDataCenters]
        USA[useServerActions]
        UCA[useContainerActions]
    end

    %% Application Layer
    subgraph "Application Layer"
        GDUC[GetDataCentersUseCase]
        MSUC[ManageServerUseCase]
        MCUC[ManageContainerUseCase]
    end

    %% Domain Layer
    subgraph "Domain Layer"
        DCE[DataCenter Entity]
        RE[Rack Entity]
        SE[Server Entity]
        CE[Container Entity]
        VO[Value Objects]
        IDCR[IDataCenterRepository]
        ISR[IServerRepository]
        ICR[IContainerRepository]
    end

    %% Infrastructure Layer
    subgraph "Infrastructure Layer"
        HDCR[HttpDataCenterRepository]
        HSR[HttpServerRepository]
        HCR[HttpContainerRepository]
        DI[DI Container]
        SR[ServiceRegistry]
        DCM[DataCenterMapper]
    end

    %% Utils
    subgraph "Utils"
        DTLC[domainToLegacyConverter]
        DC_COMP[dataComparison]
    end

    %% Dependencies
    App --> DC
    App --> RL
    App --> SG
    App --> CM
    App --> NB
    App --> CI
    App --> NT
    App --> CD
    App --> UDC
    App --> USA
    App --> UCA

    UDC --> GDUC
    USA --> MSUC
    UCA --> MCUC

    UDC --> DTLC
    DTLC --> DCE
    DTLC --> RE
    DTLC --> SE
    DTLC --> CE

    DC --> DC_COMP

    GDUC --> IDCR
    MSUC --> ISR
    MCUC --> ICR

    GDUC --> DI
    MSUC --> DI
    MCUC --> DI

    DI --> SR
    SR --> HDCR
    SR --> HSR
    SR --> HCR

    HDCR --> DCM
    HDCR --> DCE
    HSR --> SE
    HCR --> CE

    IDCR -.-> HDCR
    ISR -.-> HSR
    ICR -.-> HCR

    DCE --> VO
    RE --> VO
    SE --> VO
    CE --> VO
```

## データフローシーケンス図

### データ取得フロー

```mermaid
sequenceDiagram
    participant U as User
    participant App as AppNew
    participant Hook as useDataCenters
    participant UC as GetDataCentersUseCase
    participant DI as DI Container
    participant Repo as HttpDataCenterRepository
    participant API as API Server
    participant Mapper as DataCenterMapper
    participant Conv as domainToLegacyConverter
    participant Comp as DataCenterOverview

    U->>App: アプリケーション起動
    App->>Hook: useDataCenters() 呼び出し

    loop 1秒間隔でポーリング
        Hook->>UC: execute()
        UC->>DI: resolve(TOKENS.DATA_CENTER_REPOSITORY)
        DI->>Repo: インスタンス取得
        UC->>Repo: findAll()
        Repo->>API: GET /api/datacenters
        API-->>Repo: JSON データ
        Repo->>Mapper: mapToDomain(jsonData)
        Mapper-->>Repo: Domain Entities[]
        Repo-->>UC: Domain Entities[]
        UC-->>Hook: Domain Entities[]
        Hook->>Conv: convertDataCentersToLegacy()
        Conv-->>Hook: Legacy Types[]
        Hook->>Hook: setDataCenters(legacyData)
        Hook-->>App: {dataCenters, loading, connectionStatus}
        App->>Comp: <DataCenterOverview dataCenters={dataCenters} />
        Comp->>Comp: React.memo comparison
        Comp-->>U: UI更新 (条件付き)
    end
```

### ユーザーアクション実行フロー

```mermaid
sequenceDiagram
    participant U as User
    participant Comp as ServerGridView
    participant Hook as useServerActions
    participant UC as ManageServerUseCase
    participant Repo as HttpServerRepository
    participant API as API Server
    participant Toast as NotificationToast

    U->>Comp: サーバーアクション実行 (start/stop/restart)
    Comp->>Hook: executeServerAction(serverId, action)
    Hook->>UC: execute(serverId, action)
    UC->>Repo: updateServerStatus(serverId, action)
    Repo->>API: POST /api/servers/{id}/action

    alt 成功
        API-->>Repo: 200 OK
        Repo-->>UC: Success
        UC-->>Hook: Success
        Hook->>Toast: addToast({type: 'success'})
        Toast-->>U: 成功通知表示
    else 失敗
        API-->>Repo: 500 Error
        Repo-->>UC: Error
        UC-->>Hook: Error
        Hook->>Toast: addToast({type: 'error'})
        Toast-->>U: エラー通知表示
    end
```

## ドメイン層クラス図

```mermaid
classDiagram
    %% Value Objects
    class Id {
        +value: string
        +constructor(value: string)
        +equals(other: Id): boolean
    }

    class Name {
        +value: string
        +constructor(value: string)
        +equals(other: Name): boolean
    }

    class Location {
        +value: string
        +constructor(value: string)
        +equals(other: Location): boolean
    }

    class Position {
        +value: number
        +constructor(value: number)
        +equals(other: Position): boolean
    }

    class Cpu {
        +value: number
        +constructor(value: number)
        +equals(other: Cpu): boolean
    }

    class Memory {
        +value: number
        +constructor(value: number)
        +equals(other: Memory): boolean
    }

    class Temperature {
        +value: number
        +constructor(value: number)
        +equals(other: Temperature): boolean
    }

    class Port {
        +value: string
        +constructor(value: string)
        +equals(other: Port): boolean
    }

    class Image {
        +value: string
        +constructor(value: string)
        +equals(other: Image): boolean
    }

    %% Entities
    class DataCenter {
        -_id: Id
        -_name: Name
        -_location: Location
        -_racks: Rack[]
        +constructor(id: Id, name: Name, location: Location, racks: Rack[])
        +get id(): Id
        +get name(): Name
        +get location(): Location
        +get racks(): Rack[]
        +addRack(rack: Rack): void
        +removeRack(rackId: Id): void
        +findRack(rackId: Id): Rack | undefined
    }

    class Rack {
        -_id: Id
        -_name: Name
        -_position: Position
        -_servers: Server[]
        +constructor(id: Id, name: Name, position: Position, servers: Server[])
        +get id(): Id
        +get name(): Name
        +get position(): Position
        +get servers(): Server[]
        +addServer(server: Server): void
        +removeServer(serverId: Id): void
        +findServer(serverId: Id): Server | undefined
    }

    class Server {
        -_id: Id
        -_name: Name
        -_position: Position
        -_cpu: Cpu
        -_memory: Memory
        -_disk: Memory
        -_network: Cpu
        -_temperature: Temperature
        -_status: ServerStatus
        -_errors: string[]
        -_containers: Container[]
        +constructor(...)
        +get id(): Id
        +get name(): Name
        +get position(): Position
        +get cpu(): Cpu
        +get memory(): Memory
        +get disk(): Memory
        +get network(): Cpu
        +get temperature(): Temperature
        +get status(): ServerStatus
        +get errors(): string[]
        +get containers(): Container[]
        +start(): void
        +stop(): void
        +restart(): void
        +addContainer(container: Container): void
        +removeContainer(containerId: Id): void
        +findContainer(containerId: Id): Container | undefined
    }

    class Container {
        -_id: Id
        -_name: Name
        -_image: Image
        -_status: ContainerStatus
        -_cpu: Cpu
        -_memory: Memory
        -_ports: Port[]
        -_createdAt: Date
        +constructor(...)
        +get id(): Id
        +get name(): Name
        +get image(): Image
        +get status(): ContainerStatus
        +get cpu(): Cpu
        +get memory(): Memory
        +get ports(): Port[]
        +get createdAt(): Date
        +start(): void
        +stop(): void
        +pause(): void
        +remove(): void
    }

    %% Enums
    class ServerStatus {
        <<enumeration>>
        RUNNING
        STOPPED
        WARNING
        ERROR
    }

    class ContainerStatus {
        <<enumeration>>
        RUNNING
        STOPPED
        PAUSED
        ERROR
    }

    %% Repository Interfaces
    class IDataCenterRepository {
        <<interface>>
        +findAll(): Promise~DataCenter[]~
        +findById(id: Id): Promise~DataCenter | null~
        +save(dataCenter: DataCenter): Promise~void~
        +delete(id: Id): Promise~void~
    }

    class IServerRepository {
        <<interface>>
        +findById(id: Id): Promise~Server | null~
        +updateStatus(id: Id, status: ServerStatus): Promise~void~
        +save(server: Server): Promise~void~
    }

    class IContainerRepository {
        <<interface>>
        +findById(id: Id): Promise~Container | null~
        +create(serverId: Id, container: Container): Promise~void~
        +updateStatus(id: Id, status: ContainerStatus): Promise~void~
        +delete(id: Id): Promise~void~
    }

    %% Relationships
    DataCenter *-- Rack : contains
    Rack *-- Server : contains
    Server *-- Container : contains

    DataCenter --> Id : uses
    DataCenter --> Name : uses
    DataCenter --> Location : uses

    Rack --> Id : uses
    Rack --> Name : uses
    Rack --> Position : uses

    Server --> Id : uses
    Server --> Name : uses
    Server --> Position : uses
    Server --> Cpu : uses
    Server --> Memory : uses
    Server --> Temperature : uses
    Server --> ServerStatus : uses

    Container --> Id : uses
    Container --> Name : uses
    Container --> Image : uses
    Container --> Cpu : uses
    Container --> Memory : uses
    Container --> Port : uses
    Container --> ContainerStatus : uses
```

## React パフォーマンス最適化

### React.memo最適化戦略

1. **構造的比較**: IDやname等の不変プロパティのみを比較
2. **動的値の除外**: CPU、メモリ、温度等の変動値は比較対象外
3. **配列長チェック**: 要素数の変化のみを検知
4. **関数参照比較**: コールバック関数の参照等価性をチェック

### メモ化の実装

```typescript
const areEqual = (prevProps: DataCenterOverviewProps, nextProps: DataCenterOverviewProps) => {
  // 構造的プロパティのみを比較し、動的な数値は無視
  // これにより、データが更新されても構造が同じなら効率的な再描画を実現
}
```

## 依存性注入とサービス管理

### DIコンテナ構成

```typescript
// ServiceRegistry.ts
export const TOKENS = {
  DATA_CENTER_REPOSITORY: Symbol('DataCenterRepository'),
  SERVER_REPOSITORY: Symbol('ServerRepository'),
  CONTAINER_REPOSITORY: Symbol('ContainerRepository'),
  GET_DATA_CENTERS_USE_CASE: Symbol('GetDataCentersUseCase'),
  MANAGE_SERVER_USE_CASE: Symbol('ManageServerUseCase'),
  MANAGE_CONTAINER_USE_CASE: Symbol('ManageContainerUseCase')
};
```

### 依存性逆転の原則

- アプリケーション層とドメイン層は、インフラストラクチャ層に依存しない
- インターフェースを通じた抽象化により、テスタビリティとモジュール性を確保
- DIコンテナによる実行時の依存性解決

## リアルタイム更新メカニズム

### ポーリング戦略
- **間隔**: 1秒
- **接続状態管理**: online/offline/reconnecting
- **確率的状態変更**: 0.998の確率で正常状態を維持

### データ変換フロー
1. **Domain Entities**: ビジネスロジックを含む型安全なエンティティ
2. **Legacy Types**: 既存UIコンポーネントとの互換性を保つ型
3. **Converter**: ドメインエンティティから既存型への変換を担当

## エラーハンドリング

### 多層防御
1. **API層**: HTTPエラーのキャッチとラップ
2. **Repository層**: ドメイン例外への変換
3. **UseCase層**: ビジネスルールの検証
4. **Presentation層**: ユーザーフレンドリーなエラー表示

### 通知システム
- **Toast通知**: 成功/エラーメッセージの表示
- **確認ダイアログ**: 危険な操作の確認
- **接続インジケーター**: リアルタイム接続状態の表示

## まとめ

このアーキテクチャは以下の原則に基づいて設計されています：

1. **関心の分離**: 各層が明確な責務を持つ
2. **依存性逆転**: 抽象に依存し、具象に依存しない
3. **テスタビリティ**: 依存性注入により単体テストが容易
4. **保守性**: ドメインロジックが技術的詳細から分離
5. **パフォーマンス**: React最適化によりスムーズなUI更新

これにより、スケーラブルで保守可能な、高性能なリアルタイム監視システムを実現しています。