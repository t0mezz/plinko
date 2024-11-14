import React, { useEffect, useState } from 'react';
import useBallMovement from '../../hooks/useBallMovement';
import './Ball.css';

const Ball = ({ ball, multipliers, onMultiplierHit, removeBall }) => {
  const position = useBallMovement(ball.x, ball.y, multipliers);
  const [hitMultiplier, setHitMultiplier] = useState(false);

  useEffect(() => {
    let hit = false;
    multipliers.forEach((mult) => {
      const withinX = position.x > mult.x && position.x < mult.x + 60; // Multiplier width
      const withinY = position.y > mult.y && position.y < mult.y + 60; // Multiplier height

      if (withinX && withinY && !hitMultiplier) {
        console.log('Hit multiplier:', mult.multiplier);
        setHitMultiplier(true);
        onMultiplierHit(mult.multiplier, mult.id);
        console.log("Multiplier id:", mult.id);
        hit = true;
      }
    });

    if (hit) return;

    // Remove ball if it goes out of the screen
    if (position.y > window.innerHeight) {
      removeBall(ball.id);
    }
  }, [position, multipliers, onMultiplierHit, hitMultiplier, removeBall, ball.id]);

  return (
    <div
      className="ball"
      style={{
        left: position.x,
        top: position.y,
        opacity: hitMultiplier ? 0.5 : 1,
      }}
    />
  );
};

export default Ball;