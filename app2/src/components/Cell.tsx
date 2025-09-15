import type { ServerData } from '../types/ServerData';

interface CellProps {
  server: ServerData;
  onClick: (server: ServerData) => void;
}

function Cell({ server, onClick }: CellProps) {
  const handleClick = () => {
    onClick(server);
  };

  return (
    <div
      className="cell"
      onClick={handleClick}
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        cursor: 'pointer',
        background: '#fff',
        transition: 'background 0.2s'
      }}
    >
      <div style={{ fontSize: '12px', fontWeight: 'bold' }}>{server.id}</div>
      <div style={{ fontSize: '14px', marginTop: '5px' }}>
        CPU: {server.cpu.toFixed(1)}%
      </div>
    </div>
  );
}

export default Cell;