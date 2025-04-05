import React, { useState, useEffect, useRef } from 'react';
import './DiceRoller.css';

// Helper function to render dice dots
const renderDots = (count: number) => {
  return Array(count).fill(null).map((_, i) => (
    <div key={i} className="dot"></div>
  ));
};

const DiceRoller: React.FC = () => {
  // State for dice values, number of dice, and roll count
  const [diceValues, setDiceValues] = useState<number[]>([1, 1]);
  const [useTwoDice, setUseTwoDice] = useState<boolean>(true);
  const [rollCount, setRollCount] = useState<number>(0);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [diceStyles, setDiceStyles] = useState<React.CSSProperties[]>([{}, {}]);
  
  // Sound effect reference
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize audio element
  useEffect(() => {
    // Create audio element for dice sound
    audioRef.current = new Audio(`${process.env.PUBLIC_URL}/sounds/dice-sound.mp3`);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Define transforms for each dice value to show correct face up
  const diceTransforms = [
    'rotateX(0deg) rotateY(0deg)', // 1 up
    'rotateY(-90deg)', // 2 up
    'rotateX(-90deg)', // 3 up
    'rotateX(90deg)', // 4 up
    'rotateY(90deg)', // 5 up
    'rotateX(180deg)' // 6 up
  ];

  // Generate random animation for a die
  const generateRandomAnimation = (index: number): React.CSSProperties => {
    // Generate random rotation values for animation - reduce complexity
    const randomX = Math.floor(Math.random() * 3 + 1) * 360; // 1-3 full rotations on X axis
    const randomY = Math.floor(Math.random() * 3 + 1) * 360; // 1-3 full rotations on Y axis
    const randomZ = Math.floor(Math.random() * 2) * 180;     // 0-1 half rotations on Z axis
    
    // Lower max bounce height for better performance
    const maxBounce = 40 + Math.floor(Math.random() * 20); // Between 40-60px max height
    
    // Generate a unique animation name
    const animationName = `roll3d-${index}-${Date.now()}`;
    
    // Simplify the keyframes with fewer steps for better performance
    const keyframes = `
      @keyframes ${animationName} {
        0% {
          transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(5px);
        }
        33% {
          transform: rotateX(${randomX * 0.33}deg) rotateY(${randomY * 0.33}deg) rotateZ(${randomZ * 0.33}deg) translateZ(${maxBounce}px);
        }
        66% {
          transform: rotateX(${randomX * 0.66}deg) rotateY(${randomY * 0.66}deg) rotateZ(${randomZ * 0.66}deg) translateZ(${maxBounce * 0.5}px);
        }
        100% {
          transform: rotateX(${randomX}deg) rotateY(${randomY}deg) rotateZ(${randomZ}deg) translateZ(0px);
        }
      }
    `;
    
    // Add the keyframes to the document
    const styleSheet = document.createElement('style');
    styleSheet.id = `dice-animation-${index}`;
    styleSheet.textContent = keyframes;
    
    // Remove any previous animation style for this die
    const oldStyle = document.getElementById(`dice-animation-${index}`);
    if (oldStyle) {
      oldStyle.remove();
    }
    
    document.head.appendChild(styleSheet);
    
    // Return the animation style with reduced duration for smoother animation
    return {
      animation: `${animationName} 0.75s cubic-bezier(0.2, 0.3, 0.3, 1) forwards`,
      willChange: 'transform'
    };
  };

  // Function to roll the dice
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setRollCount(prevCount => prevCount + 1);
    
    // Generate random dice values
    const newDiceValues = useTwoDice 
      ? [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
      : [Math.floor(Math.random() * 6) + 1, 1];
    
    // Generate random animations for each die
    const newDiceStyles = [
      generateRandomAnimation(0),
      generateRandomAnimation(1)
    ];
    
    setDiceStyles(newDiceStyles);
    
    // Play dice rolling sound
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error('Error playing sound:', e));
    }
    
    // Set dice values after animation completes
    setTimeout(() => {
      setDiceValues(newDiceValues);
      setIsRolling(false);
    }, 750);
  };

  // Add event listener for space key to roll dice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isRolling) {
        rollDice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRolling]);

  // Toggle between one and two dice
  const toggleDiceCount = () => {
    if (isRolling) return;
    setUseTwoDice(prev => !prev);
  };

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(prev => !prev);
  };

  // Calculate total of dice values
  const total = diceValues.slice(0, useTwoDice ? 2 : 1).reduce((acc, val) => acc + val, 0);

  // Render a 3D dice with proper transform
  const renderDice = (value: number, index: number) => {
    const style = isRolling 
      ? diceStyles[index]
      : { transform: diceTransforms[value - 1] };
    
    return (
      <div 
        key={index} 
        className={`dice die-${index + 1} ${isRolling ? 'rolling' : ''}`} 
        style={style} 
        onClick={!isRolling ? rollDice : undefined}
      >
        <div className="dice-face face-1">
          {renderDots(1)}
        </div>
        <div className="dice-face face-2">
          {renderDots(2)}
        </div>
        <div className="dice-face face-3">
          {renderDots(3)}
        </div>
        <div className="dice-face face-4">
          {renderDots(4)}
        </div>
        <div className="dice-face face-5">
          {renderDots(5)}
        </div>
        <div className="dice-face face-6">
          {renderDots(6)}
        </div>
      </div>
    );
  };

  return (
    <div className="dice-roller">
      <h1>3D Dice Roller</h1>
      
      <div className="dice-container">
        <div className="table-highlight"></div>
        {renderDice(diceValues[0], 0)}
        {useTwoDice && renderDice(diceValues[1], 1)}
      </div>
      
      <p className="result">You rolled a {total}!</p>
      
      <div className="controls">
        <button className="roll-button" onClick={rollDice} disabled={isRolling}>
          Roll {useTwoDice ? 'Dice' : 'Die'}
        </button>
        
        <div className="options">
          <label className="toggle-container">
            <input 
              type="checkbox" 
              checked={useTwoDice} 
              onChange={toggleDiceCount}
              disabled={isRolling}
            />
            <span className="toggle-label">Two Dice</span>
          </label>
          
          <label className="toggle-container">
            <input 
              type="checkbox" 
              checked={soundEnabled} 
              onChange={toggleSound}
            />
            <span className="toggle-label">Sound {soundEnabled ? 'On' : 'Off'}</span>
          </label>
        </div>
      </div>
      
      <p className="roll-count">Total rolls: {rollCount}</p>
      <p className="tip">(Press spacebar to roll or click the dice)</p>
    </div>
  );
};

export default DiceRoller; 