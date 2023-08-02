import React, { useState } from 'react';
import './App.css';

function App() {
  const emptyBoard = Array(8).fill(Array(8).fill('.'));
  const colors = ['P', 'B', 'Y', 'R', 'G', '.'];

  const colorPoints = {
    'P': 2,
    'B': 3,
    'Y': 4,
    'R': 5,
    'G': 6,
  };

  const [board, setBoard] = useState(emptyBoard);
  const [selectedCells, setSelectedCells] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [goalCells, setGoalCells] = useState([]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const isBoardFull = () => {
    for (let row of board) {
      if (row.includes('.') || row.includes('*')) {
        return false;
      }
    }
    return true;
  };

  const handleClick = (i, j) => {
    const cellIndex = selectedCells.findIndex(cell => cell.i === i && cell.j === j);

    if (cellIndex !== -1) {
      const newSelectedCells = [...selectedCells];
      newSelectedCells.splice(cellIndex, 1);
      setSelectedCells(newSelectedCells);
    } else {
      setSelectedCells([...selectedCells, { i, j }]);
    }
  };

  const startGame = () => {
    // Create an 8x8 board filled with '.'
    let newBoard = Array(8).fill().map(() => Array(8).fill('.'));

    // Fill in goal cells.
    for (let i = 2; i <= 5; i++) {
      newBoard[i][0] = newBoard[i][1] = newBoard[i][6] = newBoard[i][7] = '*';
      setGoalCells(oldCells => [...oldCells, { i, j: 0 }, { i, j: 1 }, { i, j: 6 }, { i, j: 7 }]);
    }

    // Fill in 5 random color cells. 
    let count = 0;
    while (count < 5) {
      const i = Math.floor(Math.random() * 8);
      const j = Math.floor(Math.random() * 8);
      newBoard[i][j] = colors[Math.floor(Math.random() * (colors.length - 1))];
      count++;
    }

    setBoard(newBoard);
    setGameStarted(true);
  };

  const handleSwap = () => {

    // If the board is full and the player does a swap, end the game.
    if (isBoardFull()) {
      setIsGameOver(true);
    }

    if (selectedCells.length !== 2) {
      alert("You must select exactly two cells to swap.");
      return;
    }

    const [cell1, cell2] = selectedCells;
    const cell1Value = board[cell1.i][cell1.j];
    const cell2Value = board[cell2.i][cell2.j];

    // Only swap colored cells
    if (cell1Value === '.' || cell2Value === '.' || cell1Value === '*' || cell2Value === '*') {
      alert("You can only swap colored cells.");
      return;
    }

    // Perform the swap
    const newBoard = [...board];
    newBoard[cell1.i][cell1.j] = cell2Value;
    newBoard[cell2.i][cell2.j] = cell1Value;

    // Color 5 random uncolored squares
    let count = 0;
    while (count < 5) {
      if (isBoardFull()) break;
      const i = Math.floor(Math.random() * 8);
      const j = Math.floor(Math.random() * 8);
      if (newBoard[i][j] === '.' || newBoard[i][j] === '*') {
        newBoard[i][j] = colors[Math.floor(Math.random() * colors.length)];
        count++;
      }
    }

    // Update the board and clear the selected cells
    setBoard(newBoard);
    setSelectedCells([]);

  };

  const getSet = (i, j, color, visited) => {
    // Array to store the connected cells
    let set = [];

    // Array of directions for the DFS (up, right, down, left)
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    // Create a key for the cell to check if it has been visited
    const key = `${i}-${j}`;

    // Check if the cell is in bounds, has the same color, and hasn't been visited
    if (
      i >= 0 &&
      i < 8 &&
      j >= 0 &&
      j < 8 &&
      !visited.includes(key) &&
      (board[i][j] === color || board[i][j] === color.toUpperCase())
    ) {
      // Add the cell to the set and mark it as visited
      set.push({ i, j });
      visited.push(key);

      // Continue the DFS in all directions
      for (let direction of directions) {
        const [di, dj] = direction;
        set = set.concat(getSet(i + di, j + dj, color, visited));
      }
    }

    return set;
  };

  const handleScore = () => {
    if (selectedCells.length !== 1) {
      alert("You must select exactly one cell to score.");
      return;
    }

    const [cell] = selectedCells;
    const color = board[cell.i][cell.j];

    // The getSet function should find all connected cells of the same color
    const set = getSet(cell.i, cell.j, color, []);

    // Check if the size of the set is less than 5
    if (set.length < 5) {
      alert("The set must contain at least 5 cells.");
      return;
    }

    // Perform the scoring operation
    const newBoard = [...board];
    for (const { i, j } of set) {
      newBoard[i][j] = '.';
    }

    const colorValue = colorPoints[color];
    const pointsEarned = colorValue * set.length;
    setScore(score => score + pointsEarned);

    // Update the board and clear the selected cells
    setBoard(newBoard);
    setSelectedCells([]);
  };

  return (
    <div className="App">
      <div className="board">
        {board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className={`cell ${cell !== '.' ? cell.toLowerCase() : ''} ${selectedCells.some(c => c.i === i && c.j === j) ? 'selected' : ''}`}
              onClick={() => handleClick(i, j)}
            >
              {goalCells.some(g => g.i === i && g.j === j) ? '*' : ''} {/* Render asterisk if the cell is a goal cell */}
            </div>
          ))
        )}
      </div>
      {!gameStarted && <button onClick={startGame}>Start</button>}
      <button onClick={handleSwap} disabled={isGameOver} className="action-button">Swap</button>
      <button onClick={handleScore} className="action-button">Score</button>
      <div>Score: {score}</div>
      {isGameOver ? <h2>Game Over! Your final score is {score}.</h2> : null}
    </div>
  );
}

export default App;