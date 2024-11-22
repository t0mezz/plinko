// src/components/PlinkoGame/PlinkoGame.js

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Peg from '../Peg/Peg';
import Multiplier from '../Multiplier/Multiplier';
import './PlinkoGame.css';
import '../Ball/Ball.css';

// Load sounds for each multiplier
const multiplierSounds = {
  0.1: new Audio('/sounds/multiplier-0.1x.mp3'),
  0.5: new Audio('/sounds/multiplier-0.5x.mp3'),
  1: new Audio('/sounds/multiplier-1x.mp3'),
  2: new Audio('/sounds/multiplier-2x.mp3'),
  4: new Audio('/sounds/multiplier-4x.mp3'),
  8: new Audio('/sounds/multiplier-8x.mp3'),
};

// Handle sound loading errors
Object.keys(multiplierSounds).forEach((key) => {
  multiplierSounds[key].addEventListener('error', () => {
    console.warn(`Sound file for multiplier ${key}x failed to load.`);
    multiplierSounds[key] = null;
  });
});

const PlinkoGame = () => {
  const [balls, setBalls] = useState([]);
  const [budget, setBudget] = useState(1000);
  const [ballPrice, setBallPrice] = useState(10);
  const multiplierRefs = useRef([]);

  // Generate pegs and multipliers
  const pegs = useMemo(() => generateCenteredPyramidPegs(10, 375, 70), []);
  const multipliers = useMemo(
    () => [
      { multiplier: 8, x: 114, y: 650, id: 0 },
      { multiplier: 4, x: 164, y: 650, id: 1 },
      { multiplier: 2, x: 214, y: 650, id: 2 },
      { multiplier: 1, x: 264, y: 650, id: 3 },
      { multiplier: 0.5, x: 314, y: 650, id: 4 },
      { multiplier: 0.1, x: 364, y: 650, id: 5 },
      { multiplier: 0.5, x: 414, y: 650, id: 6 },
      { multiplier: 1, x: 464, y: 650, id: 7 },
      { multiplier: 2, x: 514, y: 650, id: 8 },
      { multiplier: 4, x: 564, y: 650, id: 9 },
      { multiplier: 8, x: 614, y: 650, id: 10 },
    ],
    []
  );

  // Refs to keep track of changing values
  const ballPriceRef = useRef(ballPrice);
  const budgetRef = useRef(budget);

  useEffect(() => {
    ballPriceRef.current = ballPrice;
  }, [ballPrice]);

  useEffect(() => {
    budgetRef.current = budget;
  }, [budget]);

  const animationRef = useRef();

  useEffect(() => {
    const update = () => {
      setBalls((prevBalls) =>
        prevBalls
          .map((ball) => {
            // Update velocity with gravity
            const newVelocity = {
              x: ball.velocity.x,
              y: ball.velocity.y + 0.1, // Further reduced gravity for gentler bounce
            };

            let newPosition = {
              x: ball.position.x + newVelocity.x,
              y: ball.position.y + newVelocity.y,
            };

            let hitMultiplier = false;

            // Detect collision with pegs
            pegs.forEach((peg) => {
              const dx = newPosition.x - peg.x;
              const dy = newPosition.y - peg.y;
              const distance = Math.hypot(dx, dy);
              const minDistance = 15;

              if (distance < minDistance) {
                const normalX = dx / distance;
                const normalY = dy / distance;
                const speed =
                  newVelocity.x * normalX + newVelocity.y * normalY;

                // Reflect velocity
                newVelocity.x -= 2 * speed * normalX;
                newVelocity.y -= 2 * speed * normalY;

                // Apply less damping for gentler bounce
                newVelocity.x *= 0.4;
                newVelocity.y *= 0.4;

                // Adjust position
                newPosition.x += normalX * (minDistance - distance + 0.5);
                newPosition.y += normalY * (minDistance - distance + 0.5);
              }
            });

            // Check for wall collisions
            if (newPosition.x < 10 || newPosition.x > 740) {
              newVelocity.x = -newVelocity.x * 0.4; // Further reduced damping
              newPosition.x = newPosition.x < 10 ? 10 : 740;
            }

            // Check for multiplier collisions
            multipliers.forEach((mult, index) => {
              const withinX =
                newPosition.x > mult.x && newPosition.x < mult.x + 45;
              const withinY =
                newPosition.y > mult.y && newPosition.y < mult.y + 45;

              if (withinX && withinY && !ball.hitMultiplier) {
                // Play the corresponding sound if available
                if (multiplierSounds[mult.multiplier]) {
                  try {
                    multiplierSounds[mult.multiplier].currentTime = 0;
                    multiplierSounds[mult.multiplier].play();
                  } catch (error) {
                    console.warn(
                      `Failed to play sound for multiplier ${mult.multiplier}x.`
                    );
                  }
                }

                // Update budget
                setBudget((prev) => prev + ballPriceRef.current * mult.multiplier);
                console.log("Ballprice: " + ballPriceRef.current + " | multiplier: " + mult.multiplier)

                // Add animation class
                const multiplierElement = multiplierRefs.current[index];
                if (multiplierElement) {
                  multiplierElement.classList.add('multiplier-hit');
                  setTimeout(() => {
                    multiplierElement.classList.remove('multiplier-hit');
                  }, 500);
                }

                ball.hitMultiplier = true;
              }
            });

            if (hitMultiplier || newPosition.y > 900) {
              // Remove the ball
              return null;
            } else {
              return {
                ...ball,
                position: newPosition,
                velocity: newVelocity,
              };
            }
          })
          .filter(Boolean) // Remove balls that have hit a multiplier or gone off-screen
      );

      animationRef.current = requestAnimationFrame(update);
    };

    animationRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationRef.current);
  }, [pegs, multipliers]);

  const addBall = () => {
    if (budgetRef.current < ballPriceRef.current) {
      return;
    }
    setBudget((prev) => prev - ballPriceRef.current);
    const newBall = {
      id: Date.now(),
      position: { x: 375 + (Math.random() - 0.5) * 30, y: 70 },
      velocity: { x: (Math.random() - 0.5) * 1.2, y: 0 },
      multiplierFlag: false,
    };
    setBalls((prevBalls) => [...prevBalls, newBall]);
  };

  useEffect(() => {
    const handleKeyUp = (event) => {
      if (event.code === 'Space') {
        addBall();
      }
    };

    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="game-container">
      <div className="user-interface">
        <h2>Budget: ${budget.toFixed(2)}</h2>
        <label>
          Price per ball:
          <input
            type="number"
            value={ballPrice}
            onChange={(e) => setBallPrice(Number(e.target.value))}
          />
        </label>
        <button onClick={addBall}>Drop Ball</button>
      </div>
      <div className="game-board">
        <div className="pegs">
          {pegs.map((peg, index) => (
            <Peg key={index} x={peg.x} y={peg.y} />
          ))}
        </div>

        <div className="multipliers">
          {multipliers.map((mult, i) => (
            <Multiplier
              key={i}
              ref={(el) => (multiplierRefs.current[i] = el)}
              multiplier={mult.multiplier}
              x={mult.x}
              y={mult.y}
              id={mult.id}
              onHit={() => {}}
            />
          ))}
        </div>

        {balls.map((ball) => (
          <div
            key={ball.id}
            className="ball"
            style={{
              left: `${ball.position.x}px`,
              top: `${ball.position.y}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Function to generate centered pyramid of pegs
const generateCenteredPyramidPegs = (rows, centerX, startY) => {
  const pegs = [];
  const spacingX = 55;
  const spacingY = 60;

  for (let row = 2; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      pegs.push({
        x: centerX + (col - row / 2) * spacingX,
        y: startY + row * spacingY,
      });
    }
  }

  return pegs;
};

export default PlinkoGame;