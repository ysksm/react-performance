function SkeletonGrid() {
  const skeletonCells = Array.from({ length: 100 }, (_, index) => (
    <div
      key={index}
      className="skeleton"
      style={{
        height: '80px',
        borderRadius: '8px',
        padding: '10px'
      }}
    >
      <div style={{ height: '14px', backgroundColor: 'transparent', marginBottom: '8px' }}></div>
      <div style={{ height: '16px', backgroundColor: 'transparent' }}></div>
    </div>
  ));

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
      {skeletonCells}
    </div>
  );
}

export default SkeletonGrid;