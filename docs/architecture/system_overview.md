# System Architecture - Sudoku Pro

## 1. UI Architecture
The application follows a **"Clean Minimal"** design philosophy with a focus on **Single-Page responsivity**.

### Layout Strategy (3-Column Grid)
- **Constraint**: Strict `h-screen` and `overflow-hidden` to prevent window scrolling.
- **Scaling**: The game board uses `max-w-[min(85vw,65vh)]` to remain a perfect square that fits with the viewport height regardless of aspect ratio.
- **Columns**:
    - **Left (250px)**: Profile, Primary Actions (New Game, Reset, Hint), and Quick Rules.
    - **Center (Fluid)**: Stats Bar and the Sudoku Board.
    - **Right (280px)**: Branding and the 3x3 Ghost Numpad.

## 2. Dynamic Styling System
- **Framework**: Tailwind CSS.
- **Theme**: Light/Dark mode stored in `localStorage`.
- **Primary Accent**: Teal (`#0D9488`).
- **Numpad Logic**: Numbers that reach a count of 9 (correctly placed) are given `opacity-0 pointer-events-none` to declutter the UI.

## 3. Storage Layer
- **Leaderboard**: LocalStorage key `sudoku_leaderboard`.
- **User Preference**: `sudoku_user_name`, `sudoku_dark_mode`, `sudoku_has_visited`.
