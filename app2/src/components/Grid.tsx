import type { ServerData } from '../types/ServerData';
import Cell from './Cell';

interface GridProps {
  servers: ServerData[];
  onCellClick: (server: ServerData) => void;
}

function Grid({ servers, onCellClick }: GridProps) {
  return (
    <div
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
        <Cell
          key={server.id}
          server={server}
          onClick={onCellClick}
        />
      ))}
    </div>
  );
}

export default Grid;