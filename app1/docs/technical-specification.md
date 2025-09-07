# 技術仕様書 - Reactパフォーマンステストアプリケーション

## 1. システムアーキテクチャ

### 1.1 全体アーキテクチャ
```
┌─────────────────────┐    HTTP/REST    ┌─────────────────────┐
│   React Frontend    │◄──────────────► │  Express Backend    │
│                     │                 │                     │
│ - UI Components     │                 │ - REST API          │
│ - Polling Client    │                 │ - Business Logic    │  
│ - Props Drilling    │                 │ - Data Store        │
└─────────────────────┘                 └─────────────────────┘
```

### 1.2 ドメイン駆動設計 + レイヤードアーキテクチャ

#### フロントエンド層構成
```
表現層 (Presentation Layer)
├── Components/
│   ├── GridRoot.tsx
│   ├── LineComponent.tsx
│   ├── CellComponent.tsx
│   └── OperationPanel.tsx
│
応用層 (Application Layer)  
├── Services/
│   ├── GridService.ts
│   ├── ApiService.ts
│   └── PollingService.ts
│
領域層 (Domain Layer)
├── Entities/
│   ├── LineRoot.ts
│   ├── Line.ts
│   └── Cell.ts
├── ValueObjects/
│   └── CellState.ts
│
基盤層 (Infrastructure Layer)
├── Repositories/
│   └── ApiClient.ts
└── Utils/
    └── HttpClient.ts
```

#### バックエンド層構成
```
表現層 (Presentation Layer)
├── Controllers/
│   └── GridController.ts
│
応用層 (Application Layer)
├── UseCases/
│   ├── UpdateCellUseCase.ts
│   ├── UpdateRowUseCase.ts
│   ├── UpdateColumnUseCase.ts
│   └── UpdateAllUseCase.ts
├── Services/
│   └── GridApplicationService.ts
│
領域層 (Domain Layer)
├── Entities/
│   ├── GridRoot.ts
│   ├── Line.ts
│   └── Cell.ts  
├── ValueObjects/
│   ├── CellState.ts
│   ├── Position.ts
│   └── GridId.ts
├── Repositories/
│   └── IGridRepository.ts
│
基盤層 (Infrastructure Layer)
├── Repositories/
│   └── InMemoryGridRepository.ts
├── DataStore/
│   └── MemoryDataStore.ts
└── WebServer/
    └── ExpressServer.ts
```

## 2. データ構造設計

### 2.1 ドメインモデル

#### TypeScript型定義
```typescript
// 値オブジェクト
type CellState = 'empty' | 'selected' | 'disabled' | 'active';

interface Position {
  readonly row: number;
  readonly col: number;
}

interface GridId {
  readonly value: string;
}

// エンティティ  
interface Cell {
  readonly id: string;
  readonly position: Position;
  state: CellState;
  
  updateState(newState: CellState): Cell;
  equals(other: Cell): boolean;
}

interface Line {
  readonly id: string;
  readonly lineNumber: number;
  readonly cells: readonly Cell[];
  
  updateCell(cellId: string, state: CellState): Line;
  updateAllCells(state: CellState): Line;
  getCell(position: number): Cell | null;
}

interface LineRoot {
  readonly id: GridId;
  readonly line1: Line;
  readonly line2: Line;
  readonly line3: Line;
  // ... line20まで
  readonly line20: Line;
  
  updateCell(position: Position, state: CellState): LineRoot;
  updateRow(rowNumber: number, state: CellState): LineRoot;
  updateColumn(colNumber: number, state: CellState): LineRoot;
  updateAll(state: CellState): LineRoot;
  getLine(lineNumber: number): Line;
  getAllCells(): readonly Cell[];
}
```

### 2.2 データフロー設計

#### 状態更新フロー
```
User Action → Component → Service → UseCase → Repository → DataStore
                ↓
Response ← Component ← Service ← UseCase ← Repository ← DataStore
```

#### ポーリングフロー
```
Timer(1s) → PollingService → ApiClient → Backend API
    ↓
Component Update ← Props Drilling ← GridService ← Response
```

## 3. API設計

### 3.1 REST API エンドポイント

#### 🔄 実際の実装に基づいたAPI仕様

#### POST /api/grids - 新しいグリッド作成
```typescript
// レスポンス
interface CreateGridResponse {
  success: boolean;
  data: {
    id: string;
    Line1: LineData;
    Line2: LineData;
    // ... Line20まで
  };
}
```

#### GET /api/grids/{id} - グリッド取得
```typescript
// レスポンス
interface GetGridResponse {
  success: boolean;
  data: {
    id: string;
    Line1: LineData;
    Line2: LineData;
    // ... Line20まで
  };
}
```

#### GET /api/grids - 全グリッド取得
```typescript
// レスポンス
interface GetAllGridsResponse {
  success: boolean;
  data: GridData[];
}
```

#### PUT /api/grids/{id}/cells - セル更新
```typescript
// リクエスト
interface UpdateCellRequest {
  row: number;
  column: number;
  state: CellState;
}

// レスポンス
interface UpdateCellResponse {
  success: boolean;
  data: GridData; // 更新されたグリッド全体
}
```

#### PUT /api/grids/{id}/rows/{row} - 行一括更新
```typescript
// リクエスト
interface UpdateRowRequest {
  state: CellState;
}

// レスポンス
interface UpdateRowResponse {
  success: boolean;
  data: GridData; // 更新されたグリッド全体
}
```

#### PUT /api/grids/{id}/columns/{column} - 列一括更新
```typescript
// リクエスト
interface UpdateColumnRequest {
  state: CellState;
}

// レスポンス
interface UpdateRowResponse {
  success: boolean;
  updatedCells: Array<{
    id: string;
    position: { row: number; col: number };
    state: CellState;
  }>;
  timestamp: string;
}
```

// レスポンス
interface UpdateColumnResponse {
  success: boolean;
  data: GridData; // 更新されたグリッド全体
}
```

#### PUT /api/grids/{id}/all - 全セル一括更新
```typescript
// リクエスト
interface UpdateAllRequest {
  state: CellState;
}

// レスポンス
interface UpdateAllResponse {
  success: boolean;
  data: GridData; // 更新されたグリッド全体
}
```

#### POST /api/grids/{id}/reset - グリッドリセット
```typescript
// レスポンス
interface ResetGridResponse {
  success: boolean;
  data: GridData; // リセットされたグリッド
}
```

#### DELETE /api/grids/{id} - グリッド削除
```typescript
// レスポンス
interface DeleteGridResponse {
  success: boolean;
  message: string;
}
```

## 4. コンポーネント設計

### 4.1 Reactコンポーネント階層
```
App
├── GridRoot
│   ├── OperationPanel
│   │   ├── GlobalOperations
│   │   ├── RowOperations  
│   │   └── ColumnOperations
│   │
│   ├── GridHeader
│   │   └── ColumnHeader (x20)
│   │
│   └── GridBody
│       └── LineComponent (x20)
│           ├── RowHeader
│           └── CellComponent (x20)
```

### 4.2 プロップス設計

#### GridRoot Props
```typescript
interface GridRootProps {
  lineRoot: LineRoot;
  onCellUpdate: (position: Position, state: CellState) => void;
  onRowUpdate: (rowNumber: number, state: CellState) => void;
  onColumnUpdate: (colNumber: number, state: CellState) => void;
  onAllUpdate: (state: CellState) => void;
  isLoading: boolean;
  error?: string;
}
```

#### LineComponent Props
```typescript
interface LineComponentProps {
  line: Line;
  onCellUpdate: (cellId: string, state: CellState) => void;
  onRowUpdate: (state: CellState) => void;
  isLoading: boolean;
}
```

#### CellComponent Props
```typescript
interface CellComponentProps {
  cell: Cell;
  onUpdate: (state: CellState) => void;
  disabled?: boolean;
}
```

## 5. 依存性逆転の実装

### 5.1 Repository パターン
```typescript
// ドメイン層（抽象）
interface IGridRepository {
  findById(id: GridId): Promise<LineRoot | null>;
  save(lineRoot: LineRoot): Promise<void>;
  updateCell(gridId: GridId, position: Position, state: CellState): Promise<Cell>;
  updateRow(gridId: GridId, rowNumber: number, state: CellState): Promise<Cell[]>;
  updateColumn(gridId: GridId, colNumber: number, state: CellState): Promise<Cell[]>;
  updateAll(gridId: GridId, state: CellState): Promise<Cell[]>;
}

// 基盤層（実装）
class InMemoryGridRepository implements IGridRepository {
  // 実装詳細
}

class ApiGridRepository implements IGridRepository {
  // HTTP通信実装
}
```

### 5.2 サービス層の依存性注入
```typescript
class GridApplicationService {
  constructor(
    private readonly gridRepository: IGridRepository,
    private readonly eventPublisher?: IEventPublisher
  ) {}
  
  async updateCell(
    gridId: GridId, 
    position: Position, 
    state: CellState
  ): Promise<Cell> {
    // 業務ロジック実装
    const updatedCell = await this.gridRepository.updateCell(gridId, position, state);
    this.eventPublisher?.publish(new CellUpdatedEvent(updatedCell));
    return updatedCell;
  }
}
```

## 6. パフォーマンス最適化

### 6.1 React最適化戦略
```typescript
// メモ化によるレンダリング最適化
const CellComponent = memo(({ cell, onUpdate, disabled }: CellComponentProps) => {
  const handleClick = useCallback(() => {
    const nextState = getNextState(cell.state);
    onUpdate(nextState);
  }, [cell.state, onUpdate]);
  
  return (
    <div 
      className={`cell cell--${cell.state}`}
      onClick={disabled ? undefined : handleClick}
    >
      {cell.state}
    </div>
  );
});

// 行コンポーネントの最適化
const LineComponent = memo(({ line, onCellUpdate, onRowUpdate, isLoading }: LineComponentProps) => {
  // セル更新の最適化
  const handleCellUpdate = useCallback((cellId: string, state: CellState) => {
    onCellUpdate(cellId, state);
  }, [onCellUpdate]);
  
  return (
    <div className="line">
      <RowHeader onUpdate={onRowUpdate} disabled={isLoading} />
      {line.cells.map(cell => (
        <CellComponent 
          key={cell.id}
          cell={cell}
          onUpdate={(state) => handleCellUpdate(cell.id, state)}
          disabled={isLoading}
        />
      ))}
    </div>
  );
});
```

### 6.2 バックエンド最適化
```typescript
// DataStore の効率的な更新
class OptimizedMemoryDataStore {
  private grid: Map<string, LineRoot> = new Map();
  private changeLog: ChangeEvent[] = [];
  
  updateCell(gridId: string, position: Position, state: CellState): Cell {
    // 差分更新の実装
    const lineKey = `line${position.row}`;
    const updatedGrid = this.grid.get(gridId)!.updateCell(position, state);
    this.grid.set(gridId, updatedGrid);
    
    // 変更ログ記録
    this.changeLog.push({
      type: 'cell_update',
      gridId,
      position,
      state,
      timestamp: new Date()
    });
    
    return updatedGrid.getLine(position.row).getCell(position.col)!;
  }
}
```

## 7. エラーハンドリング

### 7.1 フロントエンド エラー戦略
```typescript
interface ErrorState {
  hasError: boolean;
  message?: string;
  retry?: () => void;
}

const useGridOperations = () => {
  const [error, setError] = useState<ErrorState>({ hasError: false });
  
  const handleCellUpdate = async (position: Position, state: CellState) => {
    try {
      await gridService.updateCell(position, state);
    } catch (err) {
      setError({
        hasError: true,
        message: 'セルの更新に失敗しました',
        retry: () => handleCellUpdate(position, state)
      });
    }
  };
  
  return { handleCellUpdate, error, clearError: () => setError({ hasError: false }) };
};
```

### 7.2 バックエンド エラー戦略
```typescript
class ErrorHandler {
  static handle(error: Error, req: Request, res: Response, next: NextFunction) {
    if (error instanceof DomainError) {
      return res.status(400).json({
        success: false,
        error: {
          type: 'domain_error',
          message: error.message,
          code: error.code
        }
      });
    }
    
    if (error instanceof ValidationError) {
      return res.status(422).json({
        success: false,
        error: {
          type: 'validation_error',
          message: error.message,
          details: error.details
        }
      });
    }
    
    // 予期しないエラー
    console.error('Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: {
        type: 'internal_error',
        message: '内部エラーが発生しました'
      }
    });
  }
}
```

## 8. テスト戦略

### 8.1 フロントエンドテスト
```typescript
// コンポーネントテスト
describe('CellComponent', () => {
  it('セルクリック時に状態が更新される', () => {
    const onUpdate = jest.fn();
    const cell = createMockCell({ state: 'empty' });
    
    render(<CellComponent cell={cell} onUpdate={onUpdate} />);
    
    fireEvent.click(screen.getByRole('cell'));
    
    expect(onUpdate).toHaveBeenCalledWith('selected');
  });
});

// サービステスト  
describe('GridService', () => {
  it('セル更新APIを正しく呼び出す', async () => {
    const mockApiClient = createMockApiClient();
    const gridService = new GridService(mockApiClient);
    
    await gridService.updateCell({ row: 1, col: 1 }, 'selected');
    
    expect(mockApiClient.put).toHaveBeenCalledWith('/api/grid/cell', {
      position: { row: 1, col: 1 },
      state: 'selected'
    });
  });
});
```

### 8.2 バックエンドテスト
```typescript
// ドメインテスト
describe('LineRoot', () => {
  it('セル更新時に新しいインスタンスを返す', () => {
    const lineRoot = createLineRoot();
    const updatedLineRoot = lineRoot.updateCell({ row: 1, col: 1 }, 'selected');
    
    expect(updatedLineRoot).not.toBe(lineRoot);
    expect(updatedLineRoot.line1.cells[0].state).toBe('selected');
  });
});

// UseCaseテスト
describe('UpdateCellUseCase', () => {
  it('セル更新処理を正しく実行する', async () => {
    const mockRepository = createMockRepository();
    const useCase = new UpdateCellUseCase(mockRepository);
    
    await useCase.execute({
      gridId: 'test-grid',
      position: { row: 1, col: 1 },
      state: 'selected'
    });
    
    expect(mockRepository.updateCell).toHaveBeenCalled();
  });
});
