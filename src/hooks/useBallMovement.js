import { useEffect, useState, useRef } from 'react';

const useBallMovement = (initialX, initialY) => {
  const initialVelocityX = (Math.random() - 0.5) * 1; // From -0.5 to 0.5

  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [velocity, setVelocity] = useState({ x: initialVelocityX, y: 0 });
  const acceleration = { x: 0, y: 0.98 / 2 }; // Gravity

  const positionRef = useRef(position);
  const velocityRef = useRef(velocity);
  const pegs = generateCenteredPyramidPegs(10, 375, 70);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    velocityRef.current = velocity;
  }, [velocity]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update velocity with acceleration
      setVelocity((prevVel) => {
        const newVel = {
          x: prevVel.x + acceleration.x,
          y: prevVel.y + acceleration.y,
        };
        velocityRef.current = newVel;
        return newVel;
      });

      // Update position with velocity
      setPosition((prevPos) => {
        const newPos = {
          x: prevPos.x + velocityRef.current.x,
          y: prevPos.y + velocityRef.current.y,
        };
        positionRef.current = newPos;
        return newPos;
      });

      // Detect collision with pegs
      pegs.forEach((peg) => {
        const dx = positionRef.current.x - peg.x;
        const dy = positionRef.current.y - peg.y;
        const distance = Math.hypot(dx, dy);
        const minDistance = 15; // Ball radius + peg radius

        if (distance < minDistance) {
          const normalX = dx / distance;
          const normalY = dy / distance;

          const relVelX = velocityRef.current.x;
          const relVelY = velocityRef.current.y;

          const speed = relVelX * normalX + relVelY * normalY;

          // Reflect velocity
          const newVelX = velocityRef.current.x - 2 * speed * normalX;
          const newVelY = velocityRef.current.y - 2 * speed * normalY;

          // Apply damping factor
          setVelocity({
            x: newVelX * 0.2,
            y: newVelY * 0.2,
          });
          velocityRef.current = {
            x: newVelX * 0.2,
            y: newVelY * 0.2,
          };

          // Adjust position to prevent sticking
          setPosition({
            x: positionRef.current.x + normalX * (minDistance - distance + 0.5),
            y: positionRef.current.y + normalY * (minDistance - distance + 0.5),
          });
          positionRef.current = {
            x: positionRef.current.x + normalX * (minDistance - distance + 0.5),
            y: positionRef.current.y + normalY * (minDistance - distance + 0.5),
          };
        }
      });

      // Check for wall collisions
      if (positionRef.current.x < 10 || positionRef.current.x > 740) {
        setVelocity((prevVel) => {
          const newVel = {
            x: -prevVel.x * 0.8,
            y: prevVel.y,
          };
          velocityRef.current = newVel;
          return newVel;
        });
        setPosition((prevPos) => {
          const newPos = {
            x: positionRef.current.x < 10 ? 10 : 740,
            y: prevPos.y,
          };
          positionRef.current = newPos;
          return newPos;
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, []); // Run once when mounted

  return position;
};

const generateCenteredPyramidPegs = (rows, centerX, startY) => {
  const pegs = [];
  const spacingX = 45;
  const spacingY = 60;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= row; col++) {
      pegs.push({
        x: centerX + (col - row / 2) * spacingX,
        y: startY + row * spacingY,
      });
    }
  }

  return pegs;
};

export default useBallMovement;

