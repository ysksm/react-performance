# 実装計画書 - Reactパフォーマンステストアプリケーション

## 1. 実装フェーズ概要

### 1.1 全体スケジュール
```
フェーズ1: バックエンド基盤構築 (3-4時間)
フェーズ2: フロントエンド基盤構築 (2-3時間)
フェーズ3: 統合・操作機能実装 (2-3時間)
フェーズ4: 最適化・テスト (1-2時間)
---
合計予想時間: 8-12時間
```

### 1.2 開発環境セットアップ
```bash
# バックエンド用パッケージ追加
npm install express cors dotenv
npm install -D @types/express @types/cors @types/node nodemon concurrently

# フロントエンド用パッケージ追加（既存のReact環境に追加）
# 最小限のライブラリで実装
```

## 2. フェーズ1: バックエンド基盤構築

### 2.1 ディレクトリ構造作成
```
server/
├── src/
│   ├── presentation/
│   │   └── controllers/
│   │       └── GridController.ts
│   ├── application/
│   │   ├── usecases/
│   │   │   ├── UpdateCellUseCase.ts
│   │   │   ├── UpdateRowUseCase.ts
│   │   │   ├── UpdateColumnUseCase.ts
│   │   │   └── UpdateAllUseCase.ts
│   │   └── services/
│   │       └── GridApplicationService.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── GridRoot.ts
│   │   │   ├── Line.ts
│   │   │   └── Cell.ts
│   │   ├── valueObjects/
│   │   │   ├── CellState.ts
│   │   │   ├── Position.ts
│   │   │   └── GridId.ts
│   │   └── repositories/
│   │       └── IGridRepository.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── InMemoryGridRepository.ts
│   │   ├── datastore/
│   │   │   └── MemoryDataStore.ts
│   │   └── webserver/
│   │       └── ExpressServer.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

### 2.2 実装順序

#### Step 1: ドメイン層実装
1. **ValueObjects作成**
   - `CellState.ts`: セル状態の値オブジェクト
   - `Position.ts`: 位置情報の値オブジェクト
   - `GridId.ts`: グリッドID の値オブジェクト

2. **Entities作成**
   - `Cell.ts`: セルエンティティとビジネスロジック
   - `Line.ts`: ラインエンティティと操作メソッド
   - `GridRoot.ts`: ルートエンティティと集約操作

3. **Repository インターフェース**
   - `IGridRepository.ts`: データアクセスの抽象化

#### Step 2: 基盤層実装
1. **DataStore実装**
   - `MemoryDataStore.ts`: インメモリデータストア
   - 初期データの生成（20x20グリッド）

2. **Repository実装**
   - `InMemoryGridRepository.ts`: Repository パターン実装

#### Step 3: 応用層実装
1. **UseCase実装**
   - 各操作パターンのUseCaseクラス
   - ビジネスロジックの実装

2. **ApplicationService実装**
   - UseCaseのオーケストレーション

#### Step 4: 表現層実装
1. **Controller実装**
   - REST API エンドポイントの実装
   - リクエスト/レスポンスのハンドリング

2. **Express サーバー設定**
   - CORS設定、ミドルウェア設定
   - ルーティング設定

### 2.3 バックエンド実装詳細

#### 初期データ構造生成
```typescript
// 20x20グリッドの初期化処理
const initializeGrid = (): GridRoot => {
  const lines: Record<string, Line> = {};
  
  for (let row = 1; row <= 20; row++) {
    const cells: Cell[] = [];
    for (let col = 1; col <= 20; col++) {
      cells.push(new Cell({
        id: `cell-${row}-${col}`,
        position: new Position(row, col),
        state: CellState.EMPTY
      }));
    }
    
    lines[`line${row}`] = new Line({
      id: `line-${row}`,
      lineNumber: row,
      cells
    });
  }
  
  return new GridRoot({
    id: new GridId('main-grid'),
    ...lines
  });
};
```

## 3. フェーズ2: フロントエンド基盤構築

### 3.1 ディレクトリ構造拡張
```
src/
├── presentation/
│   └── components/
│       ├── GridRoot.tsx
│       ├── LineComponent.tsx
│       ├── CellComponent.tsx
│       ├── OperationPanel.tsx
│       ├── RowHeader.tsx
│       └── ColumnHeader.tsx
├── application/
│   └── services/
│       ├── GridService.ts
│       ├── ApiService.ts
│       └── PollingService.ts
├── domain/
│   ├── entities/
│   │   ├── LineRoot.ts
│   │   ├── Line.ts
│   │   └── Cell.ts
│   └── valueObjects/
│       ├── CellState.ts
│       └── Position.ts
├── infrastructure/
│   ├── repositories/
│   │   └── ApiClient.ts
│   └── utils/
│       └── HttpClient.ts
├── hooks/
│   ├── useGridOperations.ts
│   ├── usePolling.ts
│   └── useGridState.ts
└── types/
    └── api.ts
```

### 3.2 実装順序

#### Step 1: ドメイン層（フロントエンド）
1. **型定義とValueObjects**
   - バックエンドと同じ型定義を共有
   - API 通信用の型定義

#### Step 2: 基盤層（フロントエンド）
1. **HTTP Client実装**
   - fetch ベースのHTTPクライアント
   - エラーハンドリング、リトライ機構

2. **API Client実装**
   - REST API への通信ラッパー
   - 型安全なAPIコール

#### Step 3: 応用層（フロントエンド）
1. **サービス層実装**
   - `GridService`: グリッド操作の抽象化
   - `PollingService`: 定期的なデータ取得
   - `ApiService`: API 通信の統合

2. **カスタムフック実装**
   - `useGridState`: グリッド状態管理
   - `useGridOperations`: 操作ハンドラ
   - `usePolling`: ポーリング機能

#### Step 4: 表現層（フロントエンド）
1. **基本コンポーネント実装**
   - `CellComponent`: 個別セルの描画・操作
   - `LineComponent`: 行の描画・操作
   - `GridRoot`: グリッド全体の統合

2. **操作パネル実装**
   - `OperationPanel`: 一括操作UI
   - `RowHeader`: 行ヘッダー
   - `ColumnHeader`: 列ヘッダー

### 3.3 フロントエンド実装詳細

#### Props Drilling パターン実装
```typescript
// App.tsx - 最上位状態管理
const App = () => {
  const {
    lineRoot,
    isLoading,
    error,
    updateCell,
    updateRow,
    updateColumn,
    updateAll
  } = useGridOperations();

  return (
    <div className="app">
      <GridRoot
        lineRoot={lineRoot}
        onCellUpdate={updateCell}
        onRowUpdate={updateRow}
        onColumnUpdate={updateColumn}
        onAllUpdate={updateAll}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

// GridRoot.tsx - Props の中継
const GridRoot = ({
  lineRoot,
  onCellUpdate,
  onRowUpdate,
  onColumnUpdate,
  onAllUpdate,
  isLoading,
  error
}: GridRootProps) => {
  return (
    <div className="grid-root">
      <OperationPanel
        onRowUpdate={onRowUpdate}
        onColumnUpdate={onColumnUpdate}
        onAllUpdate={onAllUpdate}
        disabled={isLoading}
      />
      
      <div className="grid-container">
        {Object.entries(lineRoot).map(([lineKey, line]) => {
          if (lineKey === 'id') return null;
          
          return (
            <LineComponent
              key={line.id}
              line={line}
              onCellUpdate={(cellId, state) => {
                const cell = line.cells.find(c => c.id === cellId);
                if (cell) {
                  onCellUpdate(cell.position, state);
                }
              }}
              onRowUpdate={(state) => onRowUpdate(line.lineNumber, state)}
              isLoading={isLoading}
            />
          );
        })}
      </div>
    </div>
  );
};
```

#### ポーリング機能実装
```typescript
// usePolling.ts
const usePolling = (fetchFn: () => Promise<void>, interval: number = 1000) => {
  const [isPolling, setIsPolling] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isPolling) {
      intervalRef.current = setInterval(async () => {
        try {
          await fetchFn();
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchFn, interval, isPolling]);

  return { isPolling, setIsPolling };
};
```

## 4. フェーズ3: 統合・操作機能実装

### 4.1 API統合テスト
1. **エンドポイント疎通確認**
   - 各操作APIの動作確認
   - レスポンス形式の検証

2. **エラーハンドリング統合**
   - ネットワークエラー対応
   - サーバーエラー対応
   - ユーザーフィードバック

### 4.2 操作機能統合
1. **個別セル操作**
   - クリック → 状態更新 → API送信 → UI反映

2. **一括操作実装**
   - 行一括操作の動作確認
   - 列一括操作の動作確認
   - 全面一括操作の動作確認

3. **リアルタイム同期**
   - ポーリングによるデータ同期
   - 複数操作の競合処理

### 4.3 統合確認項目
```typescript
// 統合テストシナリオ
const integrationTests = [
  {
    name: 'セル個別更新',
    steps: [
      '任意のセルをクリック',
      'UI状態が即座に更新される',
      'サーバーに更新リクエストが送信される',
      'ポーリングで更新が確認される'
    ]
  },
  {
    name: '行一括更新',
    steps: [
      '行ヘッダーボタンをクリック',
      '行全体の状態が更新される',
      'サーバーに一括更新リクエストが送信される',
      '他のクライアントでも反映される'
    ]
  },
  {
    name: 'エラー処理',
    steps: [
      'サーバーを停止',
      'セル更新を試行',
      'エラーメッセージが表示される',
      'リトライ機能が動作する'
    ]
  }
];
```

## 5. フェーズ4: 最適化・テスト

### 5.1 パフォーマンス最適化

#### React最適化
1. **メモ化実装**
   ```typescript
   // CellComponent の最適化
   const CellComponent = memo(({ cell, onUpdate, disabled }: CellComponentProps) => {
     // 実装
   });
   
   // LineComponent の最適化
   const LineComponent = memo(({ line, onCellUpdate, onRowUpdate, isLoading }: LineComponentProps) => {
     // 実装
   });
   ```

2. **コールバック最適化**
   ```typescript
   // useCallback による関数メモ化
   const handleCellUpdate = useCallback((position: Position, state: CellState) => {
     gridService.updateCell(position, state);
   }, [gridService]);
   ```

3. **レンダリング最適化**
   - 不要な再レンダリングの削除
   - 仮想化の検討（必要に応じて）

#### バックエンド最適化
1. **データアクセス最適化**
   - 差分更新の実装
   - メモリ使用量の監視

2. **API レスポンス最適化**
   - 必要最小限のデータ転送
   - キャッシュ機構の検討

### 5.2 テスト実装

#### フロントエンドテスト
1. **コンポーネントテスト**
   - React Testing Library を使用
   - 各コンポーネントの単体テスト

2. **統合テスト**
   - API モックを使用した統合テスト
   - ユーザーシナリオテスト

#### バックエンドテスト
1. **単体テスト**
   - Domain層のテスト
   - UseCase層のテスト

2. **API テスト**
   - エンドポイントテスト
   - エラーケーステスト

### 5.3 パフォーマンステスト

#### 測定項目
```typescript
const performanceMetrics = {
  rendering: {
    target: '60FPS maintenance',
    measurement: 'Chrome DevTools Performance'
  },
  memory: {
    target: 'Under 100MB',
    measurement: 'Chrome DevTools Memory'
  },
  api: {
    target: 'Under 100ms response',
    measurement: 'Network panel timing'
  },
  polling: {
    target: 'Under 10% CPU usage',
    measurement: 'Task Manager monitoring'
  }
};
```

#### 負荷テスト
1. **大量操作テスト**
   - 連続セル更新（100回/秒）
   - 一括操作の繰り返し
   - メモリリーク検出

2. **同期テスト**
   - 複数タブでの同時操作
   - ポーリング競合状態のテスト

## 6. デプロイ・動作確認

### 6.1 開発環境セットアップ
```json
// package.json に追加するスクリプト
{
  "scripts": {
    "dev": "concurrently \"npm run server:dev\" \"npm run client:dev\"",
    "server:dev": "cd server && npm run dev",
    "client:dev": "vite",
    "build": "npm run build:server && npm run build:client",
    "build:server": "cd server && npm run build",
    "build:client": "npm run build"
  }
}
```

### 6.2 動作確認項目
- [ ] 20×20グリッドの正常表示
- [ ] セル個別操作の動作確認  
- [ ] 行一括操作の動作確認
- [ ] 列一括操作の動作確認
- [ ] 全面一括操作の動作確認
- [ ] 1秒ポーリングの動作確認
- [ ] エラーハンドリングの動作確認
- [ ] パフォーマンス要求の達成確認

## 7. 完了基準

### 7.1 機能要求達成
- [x] DDD + レイヤードアーキテクチャの実装
- [ ] 依存性逆転原則の適用
- [ ] Props drilling による状態管理
- [ ] 全操作パターンの実装
- [ ] リアルタイム同期の実装

### 7.2 品質要求達成
- [ ] TypeScript エラーゼロ
- [ ] ESLint 警告ゼロ
- [ ] パフォーマンス目標の達成
- [ ] テストカバレッジ80%以上

### 7.3 ドキュメント整備
- [x] 要求仕様書の完成
- [x] 技術仕様書の完成
- [x] 実装計画書の完成
- [ ] API仕様書の作成
- [ ] 運用マニュアルの作成

## 8. リスクとその対策

### 8.1 技術的リスク
1. **パフォーマンス問題**
   - リスク: 400セルのレンダリング遅延
   - 対策: React.memo、useCallback の徹底適用

2. **メモリリーク**
   - リスク: ポーリング処理による蓄積
   - 対策: useEffect cleanup の確実な実装

3. **Props drilling の複雑化**
   - リスク: 深いコンポーネント階層での型管理
   - 対策: 型定義の徹底、中間コンポーネントの最適化

### 8.2 実装リスク
1. **Backend-Frontend 間の型不整合**
   - リスク: API仕様の相違による実行時エラー
   - 対策: 共通型定義ファイルの作成、統合テストの徹底

2. **DDD実装の複雑性**
   - リスク: 過度な抽象化による開発効率低下
   - 対策: 最小限のDDD適用、段階的な実装

### 8.3 スケジュールリスク
1. **見積もり超過**
   - リスク: 技術的課題による開発遅延
   - 対策: MVP（最小限の動作版）の先行完成

この実装計画に基づいて、段階的に開発を進めることで、要求された高性能なReactグリッドアプリケーションを構築します。
