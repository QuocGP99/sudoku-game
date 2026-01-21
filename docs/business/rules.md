# Business Rules - Sudoku Pro

## 1. Campaign Mode (Level Progression)
The game follows a sequential progression based on difficulty:

| Difficulty | Stages per Level | Logic |
|------------|------------------|-------|
| **Easy** | 1 Stage | Win 1 game to advance or loop. |
| **Medium** | 2 Stages | Win 2 games to advance to Hard. |
| **Hard** | 3 Stages | Win 3 games to complete or reset. |

- **Score Persistence**: Score and timer are preserved when advancing through stages within the same level attempt.
- **Win Bonus**: +500 points for completing a stage.

## 2. Gameplay Mechanics
- **Mistakes**: Limit of 3 mistakes per game. Exceeding this results in Game Over.
- **Hints**: Limit of 3 hints per game. Penalty of -100 points per hint.
- **Scoring**:
    - **Easy**: +50 pts per correct move.
    - **Medium**: +100 pts per correct move.
    - **Hard**: +150 pts per correct move.
    - **Mistake Penalty**: -50 pts.

## 3. UI Interactions
- **Ghost Numpad**: Numbers are removed from the keypad once 9 instances are correctly placed on the board.
- **Highlighting**: Rows, columns, and 3x3 boxes are highlighted with a distinct color once fully and correctly solved.
