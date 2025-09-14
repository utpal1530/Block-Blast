const BOARD_SIZE = 9;
const BLOCK_SIZE = 32;
const SHAPE_GRID_SIZE = 5;

const boardElement = document.getElementById('board');
const blastsContainer = document.getElementById('blasts-container');
const scoreValueElement = document.getElementById('score-value');
const highScoreValueElement = document.getElementById('high-score-value');

let board = [];
let blasts = [];
let currentScore = 0;
let highScore = 0;
let selectedBlastIndex = null;

// Define blasts as 2D arrays (5x5 grid) with 1 for block, 0 for empty
const BLASTS = [
  // Single block
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  // Horizontal 2-block
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  // Vertical 2-block
  [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  // Horizontal 3-block
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,1,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],
  // Vertical 3-block
  [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  // L shape
  [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,0,0,0]
  ],
  // Square 2x2
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,0,0],
    [0,1,1,0,0],
    [0,0,0,0,0]
  ],
  // T shape
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,1,1,1,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ],
  // Plus shape
  [
    [0,0,0,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
    [0,0,1,0,0],
    [0,0,0,0,0]
  ]
];

// Initialize board with random blocks
function initBoard() {
  board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    let row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      row.push(Math.random() < 0.3 ? 1 : 0);
    }
    board.push(row);
  }
}

// Render the board blocks
function renderBoard() {
  boardElement.innerHTML = '';
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const block = document.createElement('div');
      block.classList.add('block');
      if (board[r][c] === 0) {
        block.classList.add('empty');
      }
      boardElement.appendChild(block);
    }
  }
}

// Generate 3 random blasts for the player to place
function generateBlasts() {
  blasts = [];
  for (let i = 0; i < 3; i++) {
    const blastIndex = Math.floor(Math.random() * BLASTS.length);
    blasts.push({
      matrix: BLASTS[blastIndex],
      id: blastIndex
    });
  }
}

// Render blasts below the board
function renderBlasts() {
  blastsContainer.innerHTML = '';
  blasts.forEach((blast, index) => {
    const blastDiv = document.createElement('div');
    blastDiv.classList.add('blast');
    blastDiv.draggable = true;
    blastDiv.dataset.index = index;

    for (let r = 0; r < SHAPE_GRID_SIZE; r++) {
      for (let c = 0; c < SHAPE_GRID_SIZE; c++) {
        const block = document.createElement('div');
        block.classList.add('block');
        if (blast.matrix[r][c] === 0) {
          block.classList.add('empty');
        }
        blastDiv.appendChild(block);
      }
    }

    blastDiv.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', index);
    });

    blastsContainer.appendChild(blastDiv);
  });
}

// Check if blast can be placed at board position (row, col)
function canPlaceBlast(blastMatrix, row, col) {
  for (let r = 0; r < SHAPE_GRID_SIZE; r++) {
    for (let c = 0; c < SHAPE_GRID_SIZE; c++) {
      if (blastMatrix[r][c] === 1) {
        const boardRow = row + r;
        const boardCol = col + c;
        if (
          boardRow < 0 || boardRow >= BOARD_SIZE ||
          boardCol < 0 || boardCol >= BOARD_SIZE ||
          board[boardRow][boardCol] === 1
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

// Place blast on board at position (row, col)
function placeBlast(blastMatrix, row, col) {
  for (let r = 0; r < SHAPE_GRID_SIZE; r++) {
    for (let c = 0; c < SHAPE_GRID_SIZE; c++) {
      if (blastMatrix[r][c] === 1) {
        board[row + r][col + c] = 1;
      }
    }
  }
}

// Clear full rows and columns, return number of cleared lines
function clearFullLines() {
  let linesCleared = 0;

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (board[r].every(cell => cell === 1)) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        board[r][c] = 0;
      }
      linesCleared++;
    }
  }

  // Check columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    let fullCol = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === 0) {
        fullCol = false;
        break;
      }
    }
    if (fullCol) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        board[r][c] = 0;
      }
      linesCleared++;
    }
  }

  return linesCleared;
}

// Update score display
function updateScore(points) {
  currentScore += points;
  scoreValueElement.textContent = currentScore;
  if (currentScore > highScore) {
    highScore = currentScore;
    highScoreValueElement.textContent = highScore;
  }
}

// Check if any blast can be placed on the board
function canPlaceAnyBlast() {
  for (let blast of blasts) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceBlast(blast.matrix, r, c)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Handle drag and drop to place blast freely (allow partial placement)
boardElement.addEventListener('dragover', (e) => {
  e.preventDefault(); // Allow drop
});

boardElement.addEventListener('drop', (e) => {
  e.preventDefault();

  const index = e.dataTransfer.getData('text/plain');
  if (index === '') return;

  const rect = boardElement.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const col = Math.floor(x / (BLOCK_SIZE + 2)); // 2 is gap
  const row = Math.floor(y / (BLOCK_SIZE + 2));

  // Center the blast on the drop position (blast is 5x5, center at (2,2))
  const blastRow = row - 2;
  const blastCol = col - 2;

  const blast = blasts[index];

  let placed = false;
  if (canPlaceBlast(blast.matrix, blastRow, blastCol)) {
    placeBlast(blast.matrix, blastRow, blastCol);
    placed = true;
  }

  if (placed) {
    blasts.splice(index, 1);
    generateNewBlast();
    const cleared = clearFullLines();
    updateScore(cleared * 50);
    renderBoard();

    if (!canPlaceAnyBlast()) {
      alert('Game Over! Your score: ' + currentScore);
      resetGame();
    }
  } else {
    // Instead of alert, return the blast back to the blasts array (no removal)
    // No change needed here because we only remove blast on successful placement
  }

  renderBlasts();
});

// Generate a new blast to fill blasts array to 3
function generateNewBlast() {
  if (blasts.length < 3) {
    const blastIndex = Math.floor(Math.random() * BLASTS.length);
    blasts.push({
      matrix: BLASTS[blastIndex],
      id: blastIndex
    });
  }
}

// Reset game
function resetGame() {
  currentScore = 0;
  updateScore(0);
  initBoard();
  generateBlasts();
  renderBoard();
  renderBlasts();
  selectedBlastIndex = null;
}

// Initialize game
resetGame();
