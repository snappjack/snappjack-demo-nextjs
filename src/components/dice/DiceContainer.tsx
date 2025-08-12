'use client';

import Die from './Die';

interface DiceContainerProps {
  diceValues: (number | null)[];
  keptDice: boolean[];
  isRolling: boolean;
  rollingIndices: number[];
  onDieClick: (index: number) => void;
}

export default function DiceContainer({ 
  diceValues, 
  keptDice, 
  isRolling, 
  rollingIndices,
  onDieClick 
}: DiceContainerProps) {
  return (
    <div className="flex justify-center gap-5 my-8 flex-wrap">
      {diceValues.map((value, index) => (
        <Die
          key={index}
          value={value}
          isKept={keptDice[index]}
          isRolling={isRolling && rollingIndices.includes(index)}
          index={index}
          onClick={onDieClick}
        />
      ))}
    </div>
  );
}