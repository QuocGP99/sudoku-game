
import React, { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  RotateCcw,
  PlusCircle,
  Eye,
  Clock,
  AlertCircle,
  HelpCircle,
  X,
  Lightbulb,
  Sun,
  Moon,
  Pause,
  Play
} from 'lucide-react';
import { createSudokuGame, checkWin, SudokuBoard, Difficulty } from './sudokuLogic';

const App: React.FC = () => {
  // Game State
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [stage, setStage] = useState(1);
  const [board, setBoard] = useState<SudokuBoard>([]);
  const [initialBoard, setInitialBoard] = useState<SudokuBoard>([]);
  const [solution, setSolution] = useState<SudokuBoard>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [errorCell, setErrorCell] = useState<{ r: number, c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(3);
  const [timer, setTimer] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sudoku_dark_mode') === 'true';
    }
    return false;
  });
  const [isWin, setIsWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lastCorrectCell, setLastCorrectCell] = useState<{ r: number, c: number } | null>(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('sudoku_user_name') || '');
  const [leaderboard, setLeaderboard] = useState<{ name: string, score: number, time: number, difficulty: string, date: string }[]>(() => {
    const saved = localStorage.getItem('sudoku_leaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isNamingUser, setIsNamingUser] = useState(false);

  const getNumberCounts = () => {
    const counts = new Array(10).fill(0);
    board.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val !== null && val === solution[r][c]) {
          counts[val]++;
        }
      });
    });
    return counts;
  };

  const numberCounts = getNumberCounts();

  const getCompletedGroups = () => {
    const completed = {
      rows: new Array(9).fill(false),
      cols: new Array(9).fill(false),
      boxes: new Array(9).fill(false)
    };

    if (!board.length || !solution.length) return completed;

    // Check Rows
    for (let r = 0; r < 9; r++) {
      let isRowDone = true;
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === null || board[r][c] !== solution[r][c]) {
          isRowDone = false;
          break;
        }
      }
      completed.rows[r] = isRowDone;
    }

    // Check Cols
    for (let c = 0; c < 9; c++) {
      let isColDone = true;
      for (let r = 0; r < 9; r++) {
        if (board[r][c] === null || board[r][c] !== solution[r][c]) {
          isColDone = false;
          break;
        }
      }
      completed.cols[c] = isColDone;
    }

    // Check Boxes
    for (let b = 0; b < 9; b++) {
      let isBoxDone = true;
      const startRow = Math.floor(b / 3) * 3;
      const startCol = (b % 3) * 3;
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          if (board[r][c] === null || board[r][c] !== solution[r][c]) {
            isBoxDone = false;
            break;
          }
        }
        if (!isBoxDone) break;
      }
      completed.boxes[b] = isBoxDone;
    }

    return completed;
  };

  const completedGroups = getCompletedGroups();


  const getMaxStages = (diff: Difficulty) => {
    if (diff === 'Easy') return 1;
    if (diff === 'Medium') return 2;
    return 3; // Hard
  };

  // Initialize Game
  const startNewGame = useCallback((preserveScore = false) => {
    const { gameBoard, solution: solved } = createSudokuGame(difficulty);
    setBoard(gameBoard);
    setInitialBoard(JSON.parse(JSON.stringify(gameBoard)));
    setSolution(solved);
    setMistakes(0);
    setHints(3);
    setTimer(0);
    if (!preserveScore) setScore(0);
    setIsGameActive(true);
    setIsWin(false);
    setIsGameOver(false);
    setIsPaused(false);
    setSelectedCell(null);
  }, [difficulty]); // Re-run when difficulty changes

  useEffect(() => {
    startNewGame(stage > 1 || (difficulty !== 'Easy' && stage === 1));
    // Check for first visit
    const hasVisited = localStorage.getItem('sudoku_has_visited');
    if (!hasVisited) {
      setShowHelp(true);
      localStorage.setItem('sudoku_has_visited', 'true');
    }
  }, [difficulty, stage]);

  useEffect(() => {
    localStorage.setItem('sudoku_user_name', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('sudoku_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  const addToLeaderboard = useCallback((finalScore: number, finalTime: number) => {
    const newEntry = {
      name: userName || 'Người chơi ẩn danh',
      score: finalScore,
      time: finalTime,
      difficulty: difficulty,
      date: new Date().toLocaleDateString('vi-VN')
    };
    setLeaderboard(prev => {
      const next = [...prev, newEntry]
        .sort((a, b) => b.score - a.score || a.time - b.time) // Higher score, then lower time
        .slice(0, 10);
      return next;
    });
  }, [userName, difficulty]);

  useEffect(() => {
    localStorage.setItem('sudoku_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Clear error cell after delay
  useEffect(() => {
    if (errorCell) {
      const timer = setTimeout(() => setErrorCell(null), 500);
      return () => clearTimeout(timer);
    }
  }, [errorCell]);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isGameActive && !isWin && !isGameOver && !isPaused) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive, isWin, isGameOver, isPaused]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCellClick = (r: number, c: number) => {
    if (isGameOver || isWin) return;
    setSelectedCell({ r, c });
  };

  const handleInput = useCallback((num: number) => {
    if (!selectedCell || isGameOver || isWin) return;
    const { r, c } = selectedCell;

    if (initialBoard[r][c] !== null) return;
    if (board[r][c] === num) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (num !== solution[r][c]) {
      setMistakes(prev => {
        const next = prev + 1;
        if (next >= 3) setIsGameOver(true);
        return next;
      });
      setErrorCell({ r, c });
      setScore(s => Math.max(0, s - 50));

      // Auto-remove wrong number after delay
      setTimeout(() => {
        setBoard(currentBoard => {
          const nextBoard = currentBoard.map(row => [...row]);
          // Only remove if it's still the wrong number (user hasn't changed it)
          if (nextBoard[r][c] === num) {
            nextBoard[r][c] = null;
          }
          return nextBoard;
        });
      }, 500);
    } else {
      // Correct Move
      const diffPoints = difficulty === 'Easy' ? 50 : difficulty === 'Medium' ? 100 : 150;
      setScore(s => s + diffPoints);
      setLastCorrectCell({ r, c });
      setTimeout(() => setLastCorrectCell(null), 500);

      if (checkWin(newBoard, solution)) {
        setIsWin(true);
        const finalScore = score + 500;
        setScore(finalScore); // Stage Bonus
        setIsGameActive(false);
        addToLeaderboard(finalScore, timer);
      }
    }
  }, [selectedCell, board, solution, initialBoard, isGameOver, isWin, difficulty, score, addToLeaderboard]);

  const handleHint = useCallback(() => {
    if (hints <= 0 || isGameOver || isWin) return;

    let targetR = -1;
    let targetC = -1;

    // Use selected cell if valid empty/wrong
    if (selectedCell) {
      const { r, c } = selectedCell;
      if (board[r][c] !== solution[r][c]) {
        targetR = r;
        targetC = c;
      }
    }

    // If no valid selected cell, find random empty/wrong one
    if (targetR === -1) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c] !== solution[r][c]) {
            targetR = r;
            targetC = c;
            break;
          }
        }
        if (targetR !== -1) break;
      }
    }

    if (targetR !== -1) {
      const newBoard = board.map(row => [...row]);
      newBoard[targetR][targetC] = solution[targetR][targetC];
      setBoard(newBoard);
      setHints(h => h - 1);
      const newScore = Math.max(0, score - 100);
      setScore(newScore); // Hint penalty

      // Clear error on that cell if any
      if (errorCell?.r === targetR && errorCell?.c === targetC) {
        setErrorCell(null);
      }

      if (checkWin(newBoard, solution)) {
        setIsWin(true);
        const finalScore = newScore + 500;
        setScore(finalScore);
        setIsGameActive(false);
        addToLeaderboard(finalScore, timer);
      }
    }
  }, [hints, board, solution, selectedCell, isGameOver, isWin, errorCell, score, addToLeaderboard]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') {
        handleInput(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell && initialBoard[selectedCell.r][selectedCell.c] === null) {
          const newBoard = board.map(row => [...row]);
          newBoard[selectedCell.r][selectedCell.c] = null;
          setBoard(newBoard);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput, selectedCell, board, initialBoard]);

  const getCellClasses = (r: number, c: number) => {
    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
    const isInitial = initialBoard[r][c] !== null;
    const value = board[r][c];
    const selectedValue = selectedCell ? board[selectedCell.r][selectedCell.c] : null;
    const isSameNumber = value !== null && value === selectedValue;
    const isError = errorCell?.r === r && errorCell?.c === c;
    const isCorrectAnim = lastCorrectCell?.r === r && lastCorrectCell?.c === c;

    const boxIdx = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    const isGroupCompleted = completedGroups.rows[r] || completedGroups.cols[c] || completedGroups.boxes[boxIdx];

    let isInvalid = !isInitial && value !== null && value !== solution[r][c];

    // Core classes for layout and styling
    let classes = "relative flex items-center justify-center text-2xl sm:text-3xl font-medium cursor-pointer transition-all duration-150 select-none aspect-square ";

    // Backgrounds
    if (isError) classes += "bg-red-500 text-white z-20 scale-105 shadow-xl rounded-sm transition-transform duration-200 ";
    else if (isCorrectAnim) classes += "bg-green-500 text-white z-20 scale-110 shadow-xl rounded-sm transition-transform duration-200 ";
    else if (isSelected) classes += "bg-blue-500 text-white z-10 scale-105 shadow-lg rounded-sm ";
    else if (isSameNumber) classes += isDarkMode ? "bg-blue-900/50 " : "bg-blue-100 ";
    else if (isGroupCompleted) classes += isDarkMode ? "bg-amber-900/30 text-amber-200 " : "bg-amber-50 text-amber-700 ";
    else classes += isDarkMode ? "bg-slate-800 hover:bg-slate-700 " : "bg-white hover:bg-slate-50 ";

    // Text colors
    if (!isSelected && !isError) {
      if (isInitial) classes += isDarkMode ? "text-slate-100 font-bold " : "text-slate-900 font-bold ";
      else if (isInvalid) classes += "text-red-500 bg-red-50 ";
      else classes += isDarkMode ? "text-blue-400 " : "text-blue-600 ";
    }

    // Grid Borders Logic (Bolder for 3x3 blocks)
    classes += isDarkMode ? "border-slate-700 border-[0.5px] " : "border-slate-200 border-[0.5px] ";
    if (c % 3 === 0) classes += isDarkMode ? "border-l-2 border-l-slate-950 " : "border-l-2 border-l-slate-800 ";
    if (c === 8) classes += isDarkMode ? "border-r-2 border-r-slate-950 " : "border-r-2 border-r-slate-800 ";
    if (r % 3 === 0) classes += isDarkMode ? "border-t-2 border-t-slate-950 " : "border-t-2 border-t-slate-800 ";
    if (r === 8) classes += isDarkMode ? "border-b-2 border-b-slate-950 " : "border-b-2 border-b-slate-800 ";

    return classes;
  };

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col items-center justify-center transition-colors duration-500 px-2 sm:px-6 py-4 ${isDarkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-white text-slate-800'}`}>

      {/* Top Header Controls */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg border transition-all active:scale-95 ${isDarkMode
            ? 'bg-slate-900 border-slate-700 text-yellow-400 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
        >
          {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
          <span className="text-xs sm:text-sm font-bold">{isDarkMode ? 'Tối' : 'Sáng'}</span>
        </button>
        <button
          onClick={() => setShowLeaderboard(true)}
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl shadow-lg border transition-all active:scale-95 ${isDarkMode
            ? 'bg-slate-900 border-slate-700 text-yellow-500 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-yellow-600 hover:bg-slate-50'
            }`}
        >
          <Trophy size={18} />
          <span className="text-xs sm:text-sm font-bold">Xếp hạng</span>
        </button>
      </div>

      <div className="w-full h-full max-w-[1400px] flex flex-col lg:grid lg:grid-cols-[250px_1fr_280px] gap-4 lg:gap-8 items-center justify-center px-2 overflow-hidden">

        {/* Column 1: Profile & Primary Actions & Rules (Desktop/Tablet) */}
        <div className="hidden lg:flex flex-col justify-center gap-4 w-full h-full py-2 overflow-hidden">
          {/* Profile Section */}
          <div className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <span className={`text-[10px] uppercase font-bold tracking-widest block mb-2 ${isDarkMode ? 'text-teal-500' : 'text-teal-600'}`}>Người chơi</span>
            <div className="flex items-center justify-between gap-3">
              <span className={`font-bold truncate text-xl ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                {userName || 'Vô danh'}
              </span>
              <button
                onClick={() => setIsNamingUser(true)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Sửa
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => startNewGame()}
              className="flex items-center justify-center gap-3 py-3 bg-teal-600 text-white font-black rounded-2xl shadow-sm hover:bg-teal-700 transition-all active:scale-95"
            >
              <PlusCircle size={18} /> Game Mới
            </button>
            <button
              onClick={() => setBoard(JSON.parse(JSON.stringify(initialBoard)))}
              className={`flex items-center justify-center gap-3 py-3 border-2 font-black rounded-2xl transition-all active:scale-95
                ${isDarkMode
                  ? 'bg-transparent text-slate-300 border-slate-700 hover:bg-slate-800'
                  : 'bg-transparent text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <RotateCcw size={18} /> Làm lại
            </button>
            <button
              onClick={handleHint}
              disabled={hints <= 0}
              className={`flex items-center justify-center gap-3 py-3 rounded-2xl transition-all active:scale-95 border-2
                ${hints > 0
                  ? isDarkMode ? 'bg-teal-900/20 text-teal-400 border-teal-900/40 hover:bg-teal-900/30' : 'bg-teal-50 text-teal-700 border-teal-100 hover:bg-teal-100'
                  : isDarkMode ? 'bg-slate-900 text-slate-700 border-slate-800 cursor-not-allowed' : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'}`}
            >
              <Lightbulb size={20} className={hints > 0 ? "fill-teal-400 text-teal-500" : ""} />
              <span className="font-black">Gợi ý ({hints})</span>
            </button>
          </div>

          {/* Integrated Rules: More prominent */}
          <div className={`p-4 rounded-3xl border-2 border-slate-100/10 ${isDarkMode ? 'bg-slate-900/40 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
              <HelpCircle size={12} /> Luật Chơi
            </h3>
            <ul className="text-[10px] space-y-2 font-medium">
              <li className="flex gap-2 items-start"><span className="text-teal-500">•</span> Điền 1-9 vào ô trống.</li>
              <li className="flex gap-2 items-start"><span className="text-teal-500">•</span> Không trùng hàng, cột, khối.</li>
              <li className="flex gap-2 items-start"><span className="text-teal-500">•</span> Tối đa 3 lỗi sai.</li>
            </ul>
          </div>
        </div>

        {/* Column 2: Stats & Game Board */}
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 py-2">
          {/* Stats Bar */}
          <div className={`w-full grid grid-cols-4 gap-4 p-4 rounded-3xl transition-all border ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`flex flex-col items-center justify-center border-r ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-black tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Score</span>
              <span className={`font-black text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>{score}</span>
            </div>
            <div className={`flex flex-col items-center justify-center border-r ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-black tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Level</span>
              <span className={`font-black text-xs sm:text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                {difficulty === 'Easy' ? 'Dễ' : difficulty === 'Medium' ? 'Trung bình' : 'Khó'}
                <span className="text-[10px] opacity-60 ml-1">Màn {stage}</span>
              </span>
            </div>
            <div className={`flex flex-col items-center justify-center border-r ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="flex items-center gap-1">
                <span className={`text-[10px] uppercase font-black tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Time</span>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className={`p-0.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-200 text-slate-400'}`}
                >
                  {isPaused ? <Play size={10} /> : <Pause size={10} />}
                </button>
              </div>
              <span className={`font-mono font-black text-sm ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatTime(timer)}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className={`text-[10px] uppercase font-black tracking-tighter ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Mistakes</span>
              <span className={`font-black text-sm ${mistakes > 0 ? 'text-red-500' : isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{mistakes}/3</span>
            </div>
          </div>

          {/* Game Board Container - Fixed Clipping and Grid Alignment */}
          <div className={`relative aspect-square w-full max-w-[min(85vw,65vh)] shadow-xl rounded-xl p-[4px] transition-all border ${isDarkMode ? 'bg-[#1E293B] border-slate-800' : 'bg-slate-200 border-slate-300'}`}>
            <div className={`grid grid-cols-9 w-full h-full rounded-lg overflow-hidden border-2 ${isDarkMode ? 'border-slate-900 bg-[#0F172A]' : 'border-slate-800 bg-white'} ${isPaused ? 'blur-2xl grayscale opacity-40' : ''}`}>
              {board.map((row, rIdx) =>
                row.map((val, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={getCellClasses(rIdx, cIdx)}
                    onClick={() => !isPaused && handleCellClick(rIdx, cIdx)}
                  >
                    {val || ''}
                  </div>
                ))
              )}
            </div>

            {/* Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-30 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 active:scale-95 transition-all"
                >
                  <Play size={24} /> Tiếp tục
                </button>
              </div>
            )}

            {/* Overlays (Win/Game Over) */}
            {(isWin || isGameOver) && (
              <div className="absolute inset-0 z-20 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className={`${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} rounded-3xl p-8 shadow-2xl text-center max-w-xs w-full space-y-4`}>
                  {isWin ? (
                    <div className="space-y-2">
                      <div className={`w-16 h-16 ${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Trophy className={`w-8 h-8 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      </div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Chúc mừng hoàn thành!</h2>
                      <div className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm space-y-1`}>
                        <p>Bạn đã vượt qua <strong>{difficulty} - Màn {stage}</strong>!</p>
                        {!userName && (
                          <p className="text-yellow-500 font-bold py-1">Hãy đặt tên để lưu kỷ lục nhé!</p>
                        )}
                        <p className="pt-2 font-medium">Bạn có muốn tiếp tục với {
                          stage < getMaxStages(difficulty)
                            ? `Màn ${stage + 1} của cấp độ ${difficulty}`
                            : difficulty === 'Easy' ? 'Cấp độ Trung Bình' : difficulty === 'Medium' ? 'Cấp độ Khó' : 'Thử thách mới'
                        } không?</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className={`w-16 h-16 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
                      </div>
                      <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Kết thúc!</h2>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Bạn đã mắc quá 3 lỗi sai.</p>
                    </div>
                  )}
                  {isWin ? (
                    <button
                      onClick={() => {
                        if (!userName.trim()) {
                          setIsNamingUser(true);
                          return;
                        }
                        const max = getMaxStages(difficulty);
                        if (stage < max) {
                          setStage(s => s + 1);
                        } else {
                          if (difficulty === 'Easy') {
                            setDifficulty('Medium');
                            setStage(1);
                          } else if (difficulty === 'Medium') {
                            setDifficulty('Hard');
                            setStage(1);
                          } else {
                            setDifficulty('Easy');
                            setStage(1);
                          }
                        }
                      }}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
                    >
                      Xác nhận chơi tiếp
                    </button>
                  ) : (
                    <button
                      onClick={startNewGame}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
                    >
                      Chơi lại
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Title & Numpad */}
        <div className="w-full lg:w-[280px] flex flex-col justify-center items-center lg:items-start gap-4 h-full py-2">
          <header className="space-y-1 w-full">
            <h1 className={`text-4xl font-black tracking-tighter text-center lg:text-left ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              SUDOKU<span className="text-teal-500">.</span>
            </h1>

            {/* Mobile-only profile & actions (visible below md) */}
            <div className="lg:hidden flex flex-col gap-3 max-w-sm mx-auto w-full">
              <div className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${isDarkMode ? 'bg-[#1E293B] border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <span className={`font-black truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                  {userName || 'Vô danh'}
                </span>
                <button onClick={() => setIsNamingUser(true)} className="text-teal-600 font-black text-xs uppercase tracking-widest">Sửa</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startNewGame()} className="flex-1 py-3 bg-teal-600 text-white text-xs font-black rounded-xl uppercase">Game Mới</button>
                <button onClick={() => setBoard(JSON.parse(JSON.stringify(initialBoard)))} className={`flex-1 py-3 border-2 text-xs font-black rounded-xl uppercase ${isDarkMode ? 'bg-[#1E293B] text-slate-300 border-slate-700' : 'bg-white text-slate-600 border-slate-100'}`}>Làm lại</button>
              </div>
            </div>
          </header>

          {/* Numpad: Perfectly Centered */}
          <div className="w-full max-w-[280px] grid grid-cols-3 gap-3 sm:gap-4 mx-auto lg:mx-0">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isCompleted = numberCounts[num] === 9;
              return (
                <button
                  key={num}
                  onClick={() => handleInput(num)}
                  disabled={isCompleted}
                  className={`aspect-square flex items-center justify-center border-2 rounded-[1.5rem] text-3xl font-black transition-all active:scale-90
                    ${isCompleted
                      ? 'opacity-0 pointer-events-none'
                      : isDarkMode
                        ? 'bg-[#1E293B] border-slate-700 text-white hover:border-teal-500 hover:bg-slate-800 shadow-lg shadow-black/20'
                        : 'bg-white border-slate-200 text-slate-800 hover:border-teal-400 hover:bg-teal-50 shadow-sm shadow-slate-200'
                    }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* Mobile Rules */}
          <div className="md:hidden mt-6 text-[10px] font-black uppercase tracking-widest text-center opacity-30">
            Rules: No Duplicates • 3 Mistakes Max
          </div>
        </div>
      </div>

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl max-w-sm w-full relative`}>
            <button
              onClick={() => setShowHelp(false)}
              className={`absolute right-4 top-4 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <X size={24} />
            </button>

            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'} mb-4`}>Cách Chơi</h2>

            <div className={`space-y-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-sm`}>
              <section>
                <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-1`}>Luật Cơ Bản</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Điền số <strong>1-9</strong> vào các ô trống.</li>
                  <li>Mỗi hàng, mỗi cột, và mỗi khối 3x3 phải có đủ các số từ 1-9 mà <strong>không trùng lặp</strong>.</li>
                </ul>
              </section>

              <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} my-2`} />

              <section>
                <h3 className={`font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-1`}>Chế Độ Chiến Dịch</h3>
                <div className="space-y-2">
                  <div className={`flex justify-between items-center ${isDarkMode ? 'bg-green-900/20 border-green-900/40' : 'bg-green-50 border-green-100'} p-2 rounded-lg border`}>
                    <span className={`font-bold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Dễ</span>
                    <span className={isDarkMode ? 'text-green-500' : 'text-green-600'}>1 Màn</span>
                  </div>
                  <div className={`flex justify-between items-center ${isDarkMode ? 'bg-yellow-900/20 border-yellow-900/40' : 'bg-yellow-50 border-yellow-100'} p-2 rounded-lg border`}>
                    <span className={`font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Trung Bình</span>
                    <span className={isDarkMode ? 'text-yellow-500' : 'text-yellow-600'}>2 Màn</span>
                  </div>
                  <div className={`flex justify-between items-center ${isDarkMode ? 'bg-red-900/20 border-red-900/40' : 'bg-red-50 border-red-100'} p-2 rounded-lg border`}>
                    <span className={`font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'}`}>Khó</span>
                    <span className={isDarkMode ? 'text-red-500' : 'text-red-600'}>3 Màn</span>
                  </div>
                </div>
              </section>

              <button
                onClick={() => setShowHelp(false)}
                className={`w-full py-3 mt-4 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'} text-white font-bold rounded-xl transition-transform active:scale-95`}
              >
                Đã Hiểu
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} rounded-3xl p-6 shadow-2xl max-w-sm w-full relative`}>
            <button
              onClick={() => setShowLeaderboard(false)}
              className={`absolute right-4 top-4 ${isDarkMode ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-yellow-100 text-yellow-600'}`}>
                <Trophy size={24} />
              </div>
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Bảng Xếp Hạng</h2>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-600' : idx === 2 ? 'bg-amber-600 text-white' : isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{entry.name}</p>
                      <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {entry.difficulty} • {entry.date} • <span className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>{formatTime(entry.time)}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{entry.score}</p>
                      <p className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>PTS</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`py-12 text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Chưa có kỷ lục nào. Hãy trở thành người đầu tiên!
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLeaderboard(false)}
              className={`w-full py-4 mt-6 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'} text-white font-bold rounded-2xl transition-transform active:scale-95`}
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* User Name Modal */}
      {isNamingUser && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'} rounded-3xl p-8 shadow-2xl max-w-sm w-full space-y-6`}>
            <div className="text-center space-y-2">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Biệt Danh Của Bạn</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tên này sẽ hiển thị trên bảng xếp hạng</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Nhập tên của bạn..."
                maxLength={15}
                className={`w-full p-4 rounded-2xl border outline-none font-bold transition-all text-center text-lg ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-400'}`}
                autoFocus
              />
              <button
                onClick={() => {
                  if (userName.trim()) setIsNamingUser(false);
                }}
                disabled={!userName.trim()}
                className={`w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
