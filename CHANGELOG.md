# Changelog - Sudoku Pro

## [2026-01-22] - Clean Minimal Redesign Session

### Added
- **"Clean Minimal" Theme**: Breath-taking redesign using Teal accents, high-contrast typography, and sharp board lines.
- **Dynamic 3-Column Layout**: Adaptable structure for Laptop (3 cols), iPad (2 cols), and iPhone (Vertical stack).
- **Ghost Numpad**: Numbers disappear when completed 9 times to focus player attention.
- **Single-Page Guarantee**: Implemented `vh`-based scaling to eliminate all scrollbars.
- **Integrated Rules**: "How to Play" text built directly into the sidebar for persistent guidance.

### Changed
- **Level Display**: Refined level labeling from shorthand (E.1) to full Vietnamese labels ("Dễ Màn 1").
- **Numpad Alignment**: Centered the numeric keypad vertically and horizontally within its column.
- **Board Styling**: Fixed grid clipping by adding internal padding to the board container.
- **Action Buttons**: Simplified and standardized button sizes and shadows for a premium feel.

### Fixed
- **Level Progression Bug**: Resolved issue where win states were inherited across stages.
- **Overflow Issues**: Eliminated vertical/horizontal scrolls on short/wide viewports.
- **Grid Border Clipping**: Ensured the 9x9 grid border remains visible even with rounded corners.
