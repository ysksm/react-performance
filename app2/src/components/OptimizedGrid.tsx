import { memo } from 'react';
import type { ServerData } from '../types/ServerData';
import OptimizedCell from './OptimizedCell';

interface GridProps {
  servers: ServerData[];
  onCellClick: (server: ServerData) => void;
}

// メモ化されたGridコンポーネント
const OptimizedGrid = memo(function Grid({ servers, onCellClick }: GridProps) {
  return (
    <div
      className="grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 1fr)',
        gap: '10px',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      {servers.map((server) => (
        <OptimizedCell
          key={server.id}
          server={server}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
});

export default OptimizedGrid;