import { memo } from 'react';
import type { ServerData } from '../../types/ServerData';

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
  const getBorderColor = (cpu: number, hasErrors: boolean) => {
    if (hasErrors) return '#ff0000'; // エラーがある場合は赤
    if (cpu > 80) return '#ff4444';
    if (cpu > 60) return '#ffaa00';
    return '#ddd';
  };

  // エラー状態に基づく境界線スタイル
  const getBorderStyle = (hasErrors: boolean) => {
    return hasErrors ? '3px solid' : '2px solid';
  };

  const hasErrors = server.errors.length > 0;

  return (
    <div
      className="cell"
      onClick={handleClick}
      style={{
        border: `${getBorderStyle(hasErrors)} ${getBorderColor(server.cpu, hasErrors)}`,
        padding: '10px',
        cursor: 'pointer',
        background: getBackgroundColor(server.cpu),
        transition: 'all 0.3s ease',
        position: 'relative',
        borderRadius: '8px',
        boxShadow: hasErrors ? '0 0 10px rgba(255, 0, 0, 0.3)' : 'none'
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