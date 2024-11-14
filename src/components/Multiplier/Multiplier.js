import React, { useState, useEffect, forwardRef } from 'react';
import './Multiplier.css';

const Multiplier = forwardRef(({ multiplier, x, y, onHit, id }, ref) => {
  const [hit, setHit] = useState(false);

  useEffect(() => {
    if (hit) {
      const timeout = setTimeout(() => setHit(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [hit]);

  const handleHit = () => {
    setHit(true);
    onHit();
  };

  return (
    <div
      ref={ref}
      className={`multiplier ${hit ? 'hit' : ''}`}
      style={{ left: x, top: y }}
      onClick={handleHit}
    >
      x{multiplier}
    </div>
  );
});

export default Multiplier;