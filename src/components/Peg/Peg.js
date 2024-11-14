import React from 'react';
import './Peg.css';

const Peg = ({ x, y }) => {
  return <div className="peg" style={{ left: x, top: y }}></div>;
};

export default Peg;
