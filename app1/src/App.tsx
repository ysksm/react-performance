import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

type CellState = 'empty' | 'selected' | 'disabled' | 'active';

interface Cell {
  id: string;
  state: CellState;
  row: number;
  column: number;
}

interface LineData {
  id: string;
  cells: Cell[];
}

interface GridData {
  id: string;
  Line1: LineData;
  Line2: LineData;
  Line3: LineData;
  Line4: LineData;
  Line5: LineData;
  Line6: LineData;
  Line7: LineData;
  Line8: LineData;
  Line9: LineData;
  Line10: LineData;
  Line11: LineData;
  Line12: LineData;
  Line13: LineData;
  Line14: LineData;
  Line15: LineData;
  Line16: LineData;
  Line17: LineData;
  Line18: LineData;
  Line19: LineData;
  Line20: LineData;
}

const API_BASE_URL = 'http://localhost:3001/api';

// セル状態の循環切り替え関数
const getNextCellState = (currentState: CellState): CellState => {
  switch (currentState) {
    case 'empty': return 'selected';
    case 'selected': return 'disabled';
    case 'disabled': return 'active';
    case 'active': return 'empty';
    default: return 'empty';
  }
};

// Cell Component
interface CellProps {
  cell: Cell;
  onCellClick: (row: number, column: number) => void;
}

const CellComponent: React.FC<CellProps> = React.memo(({ cell, onCellClick }) => {
  const handleClick = useCallback(() => {
    onCellClick(cell.row, cell.column);
  }, [cell.row, cell.column, onCellClick]);

  return (
    <button
      className={`cell cell-${cell.state}`}
      onClick={handleClick}
      title={`行${cell.row + 1}, 列${cell.column + 1}: ${cell.state}`}
    >
      {cell.column + 1}
    </button>
  );
});

// Line Component
interface LineProps {
  lineData: LineData;
  lineNumber: number;
  onCellClick: (row: number, column: number) => void;
  onRowUpdate: (row: number) => void;
}

const LineComponent: React.FC<LineProps> = React.memo(({ lineData, lineNumber, onCellClick, onRowUpdate }) => {
  const handleRowUpdate = useCallback(() => {
    onRowUpdate(lineNumber);
  }, [lineNumber, onRowUpdate]);

  return (
    <div className="line-container">
      <div className="line-header">
        <span className="line-label">Line{lineNumber + 1}</span>
        <button className="row-update-btn" onClick={handleRowUpdate}>
          行{lineNumber + 1}一括更新
        </button>
      </div>
      <div className="line-cells">
        {lineData.cells && lineData.cells.length > 0 ? (
          lineData.cells.map((cell, index) => (
            cell ? (
              <CellComponent
                key={cell.id || `cell-${lineNumber}-${index}`}
                cell={cell}
                onCellClick={onCellClick}
              />
            ) : (
              <div key={`empty-cell-${lineNumber}-${index}`} className="cell cell-empty">
                {index + 1}
              </div>
            )
          ))
        ) : (
          <div className="no-cells">セルがありません</div>
        )}
      </div>
    </div>
  );
});

// GridRoot Component
interface GridRootProps {
  gridData: GridData | null;
  onCellClick: (row: number, column: number) => void;
  onRowUpdate: (row: number) => void;
  onColumnUpdate: (column: number) => void;
  onFullUpdate: () => void;
  onReset: () => void;
}

const GridRoot: React.FC<GridRootProps> = React.memo(({ 
  gridData, 
  onCellClick, 
  onRowUpdate, 
  onColumnUpdate, 
  onFullUpdate,
  onReset 
}) => {
  if (!gridData) {
    return <div className="loading">グリッドを読み込み中...</div>;
  }

  const lines = [
    gridData.Line1, gridData.Line2, gridData.Line3, gridData.Line4, gridData.Line5,
    gridData.Line6, gridData.Line7, gridData.Line8, gridData.Line9, gridData.Line10,
    gridData.Line11, gridData.Line12, gridData.Line13, gridData.Line14, gridData.Line15,
    gridData.Line16, gridData.Line17, gridData.Line18, gridData.Line19, gridData.Line20
  ];

  return (
    <div className="grid-root">
      <div className="grid-controls">
        <button className="control-btn full-update" onClick={onFullUpdate}>
          全面更新
        </button>
        <button className="control-btn reset" onClick={onReset}>
          リセット
        </button>
        <div className="column-controls">
          {Array.from({ length: 20 }, (_, i) => (
            <button
              key={i}
              className="column-update-btn"
              onClick={() => onColumnUpdate(i)}
              title={`列${i + 1}一括更新`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
      <div className="grid-lines">
        {lines.map((lineData, index) => (
          lineData ? (
            <LineComponent
              key={lineData.id || `line-${index}`}
              lineData={lineData}
              lineNumber={index}
              onCellClick={onCellClick}
              onRowUpdate={onRowUpdate}
            />
          ) : (
            <div key={`empty-line-${index}`} className="line-container">
              <div className="line-header">
                <span className="line-label">Line{index + 1}</span>
                <span className="no-data">データなし</span>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
});

// URL パラメータを取得するヘルパー関数
const getGridIdFromUrl = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('gridId');
};

// URL パラメータを更新するヘルパー関数
const updateGridIdInUrl = (gridId: string) => {
  const url = new URL(window.location.href);
  url.searchParams.set('gridId', gridId);
  window.history.replaceState({}, '', url.toString());
};

// Main App Component
function App() {
  const [gridData, setGridData] = useState<GridData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableGrids, setAvailableGrids] = useState<GridData[]>([]);
  const [showGridSelector, setShowGridSelector] = useState<boolean>(false);
  const [customGridId, setCustomGridId] = useState<string>('');

  // グリッド作成
  const createGrid = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/grids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setGridData(result.data);
        updateGridIdInUrl(result.data.id);
        setError(null);
      } else {
        throw new Error(result.error || 'グリッド作成に失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('グリッド作成エラー:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // グリッド取得
  const fetchGrid = useCallback(async (gridId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/grids/${gridId}`);
      if (response.status === 404) {
        // サーバー再起動でデータが失われた場合、新しいグリッドを作成
        console.log('グリッドが見つかりません。新しいグリッドを作成します...');
        await createGrid();
        return;
      }
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setGridData(result.data);
        updateGridIdInUrl(result.data.id);
        setError(null);
      } else {
        throw new Error(result.error || 'グリッド取得に失敗しました');
      }
    } catch (err) {
      // 404エラー以外のネットワークエラーの場合
      if (err instanceof Error && err.message.includes('404')) {
        console.log('グリッドが見つかりません。新しいグリッドを作成します...');
        await createGrid();
        return;
      }
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('グリッド取得エラー:', err);
    }
  }, [createGrid]);

  // 全グリッド取得
  const fetchAllGrids = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/grids`);
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setAvailableGrids(result.data);
      } else {
        throw new Error(result.error || 'グリッド一覧取得に失敗しました');
      }
    } catch (err) {
      console.error('グリッド一覧取得エラー:', err);
    }
  }, []);

  // 指定したグリッドIDを読み込む
  const loadSpecificGrid = useCallback(async (gridId: string) => {
    if (!gridId.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fetchGrid(gridId.trim());
    } catch (err) {
      setError(`グリッドID "${gridId}" が見つかりません`);
    } finally {
      setLoading(false);
    }
  }, [fetchGrid]);

  // セルクリック処理
  const handleCellClick = useCallback(async (row: number, column: number) => {
    if (!gridData) return;
    
    try {
      // 現在のセル状態を取得
      const lines = [
        gridData.Line1, gridData.Line2, gridData.Line3, gridData.Line4, gridData.Line5,
        gridData.Line6, gridData.Line7, gridData.Line8, gridData.Line9, gridData.Line10,
        gridData.Line11, gridData.Line12, gridData.Line13, gridData.Line14, gridData.Line15,
        gridData.Line16, gridData.Line17, gridData.Line18, gridData.Line19, gridData.Line20
      ];
      
      const currentLine = lines[row];
      if (!currentLine || !currentLine.cells || !currentLine.cells[column]) {
        throw new Error('セルが見つかりません');
      }
      
      const currentCell = currentLine.cells[column];
      const nextState = getNextCellState(currentCell.state);
      
      const response = await fetch(`${API_BASE_URL}/grids/${gridData.id}/cells`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, column, state: nextState })
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'セル更新に失敗しました');
      }
      
      // APIレスポンスからグリッドデータを更新
      if (result.data) {
        setGridData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('セル更新エラー:', err);
    }
  }, [gridData]);

  // 行一括更新
  const handleRowUpdate = useCallback(async (row: number) => {
    if (!gridData) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/grids/${gridData.id}/rows/${row}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'selected' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '行更新に失敗しました');
      }
      
      // APIレスポンスからグリッドデータを更新
      if (result.data) {
        setGridData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('行更新エラー:', err);
    }
  }, [gridData]);

  // 列一括更新
  const handleColumnUpdate = useCallback(async (column: number) => {
    if (!gridData) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/grids/${gridData.id}/columns/${column}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'active' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '列更新に失敗しました');
      }
      
      // APIレスポンスからグリッドデータを更新
      if (result.data) {
        setGridData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('列更新エラー:', err);
    }
  }, [gridData]);

  // 全面更新
  const handleFullUpdate = useCallback(async () => {
    if (!gridData) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/grids/${gridData.id}/all`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'disabled' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '全面更新に失敗しました');
      }
      
      // APIレスポンスからグリッドデータを更新
      if (result.data) {
        setGridData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('全面更新エラー:', err);
    }
  }, [gridData]);

  // リセット
  const handleReset = useCallback(async () => {
    if (!gridData) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/grids/${gridData.id}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTPエラー: ${response.status}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'リセットに失敗しました');
      }
      
      // APIレスポンスからグリッドデータを更新
      if (result.data) {
        setGridData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('リセットエラー:', err);
    }
  }, [gridData]);

  // 1秒間隔でのポーリング
  useEffect(() => {
    if (!gridData) return;

    const interval = setInterval(() => {
      fetchGrid(gridData.id);
    }, 1000);

    return () => clearInterval(interval);
  }, [gridData, fetchGrid]);

  // 初回読み込み（URL パラメータ対応）
  useEffect(() => {
    const urlGridId = getGridIdFromUrl();
    if (urlGridId) {
      // URL にグリッドIDが指定されている場合、そのグリッドを読み込む
      loadSpecificGrid(urlGridId);
    } else {
      // URL にグリッドIDがない場合、新しいグリッドを作成
      createGrid();
    }
    
    // 利用可能なグリッド一覧を取得
    fetchAllGrids();
  }, [createGrid, loadSpecificGrid, fetchAllGrids]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>React パフォーマンステスト - 20x20グリッド</h1>
        <div className="grid-controls-header">
          <button 
            className="control-btn"
            onClick={() => setShowGridSelector(!showGridSelector)}
          >
            {showGridSelector ? 'グリッド選択を閉じる' : 'グリッドを選択'}
          </button>
          <button 
            className="control-btn"
            onClick={createGrid}
            disabled={loading}
          >
            新しいグリッドを作成
          </button>
        </div>
        
        {showGridSelector && (
          <div className="grid-selector">
            <div className="custom-grid-input">
              <input
                type="text"
                placeholder="グリッドIDを入力..."
                value={customGridId}
                onChange={(e) => setCustomGridId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    loadSpecificGrid(customGridId);
                    setCustomGridId('');
                  }
                }}
              />
              <button 
                onClick={() => {
                  loadSpecificGrid(customGridId);
                  setCustomGridId('');
                }}
                disabled={!customGridId.trim() || loading}
              >
                読み込み
              </button>
            </div>
            
            <div className="available-grids">
              <h3>利用可能なグリッド ({availableGrids.length}個)</h3>
              <button onClick={fetchAllGrids} className="refresh-btn">
                🔄 更新
              </button>
              <div className="grids-list">
                {availableGrids.map((grid) => (
                  <div 
                    key={grid.id} 
                    className={`grid-item ${gridData?.id === grid.id ? 'current' : ''}`}
                    onClick={() => {
                      loadSpecificGrid(grid.id);
                      setShowGridSelector(false);
                    }}
                  >
                    <div className="grid-id">ID: {grid.id}</div>
                    <div className="grid-preview">
                      {grid.Line1 && grid.Line1.cells && (
                        <span>
                          セル状態: {grid.Line1.cells.filter(c => c.state !== 'empty').length}/400 変更済み
                        </span>
                      )}
                    </div>
                    {gridData?.id === grid.id && <span className="current-label">現在表示中</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="status-bar">
          {loading && <span className="status loading">読み込み中...</span>}
          {error && <span className="status error">エラー: {error}</span>}
          {gridData && (
            <div className="status success">
              <span>グリッドID: {gridData.id}</span>
              <button 
                className="copy-url-btn"
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?gridId=${gridData.id}`;
                  navigator.clipboard.writeText(url);
                  alert('URLをクリップボードにコピーしました');
                }}
                title="このグリッドのURLをコピー"
              >
                📋 URLコピー
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="app-main">
        <GridRoot
          gridData={gridData}
          onCellClick={handleCellClick}
          onRowUpdate={handleRowUpdate}
          onColumnUpdate={handleColumnUpdate}
          onFullUpdate={handleFullUpdate}
          onReset={handleReset}
        />
      </main>
    </div>
  );
}

export default App;
