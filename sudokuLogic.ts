
export type SudokuBoard = (number | null)[][];

export const BOARD_SIZE = 9;
export const BOX_SIZE = 3;

export const isValid = (board: SudokuBoard, row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[row][x] === num) return false;
  }

  // Check column
  for (let x = 0; x < BOARD_SIZE; x++) {
    if (board[x][col] === num) return false;
  }

  // Check 3x3 box
  const startRow = row - (row % BOX_SIZE);
  const startCol = col - (col % BOX_SIZE);
  for (let i = 0; i < BOX_SIZE; i++) {
    for (let j = 0; j < BOX_SIZE; j++) {
      if (board[i + startRow][j + startCol] === num) return false;
    }
  }

  return true;
};

export const solveSudoku = (board: SudokuBoard): boolean => {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= BOARD_SIZE; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
};

export const generateFullBoard = (): SudokuBoard => {
  const board: SudokuBoard = Array.from({ length: 9 }, () => Array(9).fill(null));

  const fillBoard = (b: SudokuBoard): boolean => {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (b[row][col] === null) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(b, row, col, num)) {
              b[row][col] = num;
              if (fillBoard(b)) return true;
              b[row][col] = null;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillBoard(board);
  return board;
};

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export const createSudokuGame = (difficulty: Difficulty) => {
  const fullBoard = generateFullBoard();
  const gameBoard: SudokuBoard = fullBoard.map(row => [...row]);

  let cellsToRemove = 30; // Default Easy
  if (difficulty === 'Medium') cellsToRemove = 40;
  if (difficulty === 'Hard') cellsToRemove = 50;

  let removed = 0;
  while (removed < cellsToRemove) {
    const r = Math.floor(Math.random() * 9);
    const c = Math.floor(Math.random() * 9);
    if (gameBoard[r][c] !== null) {
      gameBoard[r][c] = null;
      removed++;
    }
  }

  return { gameBoard, solution: fullBoard };
};

export const checkWin = (board: SudokuBoard, solution: SudokuBoard): boolean => {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
};
