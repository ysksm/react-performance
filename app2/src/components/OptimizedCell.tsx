import { memo } from 'react';
import type { ServerData } from '../types/ServerData';

interface CellProps {
  server: ServerData;
  onClick: (server: ServerData) => void;
}

// メモ化されたCellコンポーネント
const OptimizedCell = memo(function Cell({ server, onClick }: CellProps) {
  const handleClick = () => {
    onClick(server);
  };

  // CPU使用率に基づく背景色の計算
  const getBackgroundColor = (cpu: number) => {
    if (cpu > 80) return 'rgba(255, 68, 68, 0.1)';
    if (cpu > 60) return 'rgba(255, 170, 0, 0.1)';
    return '#fff';
  };

  // CPU使用率に基づく境界線の色
  const getBorderColor = (cpu: number) => {
    if (cpu > 80) return '#ff4444';
    if (cpu > 60) return '#ffaa00';
    return '#ccc';
  };

  return (
    <div
      className="cell"
      onClick={handleClick}
      style={{
        border: `2px solid ${getBorderColor(server.cpu)}`,
        padding: '10px',
        cursor: 'pointer',
        background: getBackgroundColor(server.cpu),
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{server.id}</div>
      <div style={{ fontSize: '14px', marginTop: '5px' }}>
        CPU: {server.cpu.toFixed(1)}%
      </div>
      {server.errors.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: '#ff4444',
          animation: 'pulse 2s infinite'
        }} />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数: サーバーデータが同じなら再レンダリングしない
  return (
    prevProps.server.id === nextProps.server.id &&
    prevProps.server.cpu === nextProps.server.cpu &&
    prevProps.server.memory === nextProps.server.memory &&
    prevProps.server.disk === nextProps.server.disk &&
    prevProps.server.errors.length === nextProps.server.errors.length &&
    prevProps.onClick === nextProps.onClick
  );
});

export default OptimizedCell;