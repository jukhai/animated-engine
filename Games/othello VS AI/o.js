const boardSize = 8;
const game = document.getElementById('game');
const status = document.getElementById('status');
const difficultySelect = document.getElementById('difficulty');
let board = [];
let currentPlayer = 'black';

const placeSound = document.getElementById('place-sound');
const gameoverSound = document.getElementById('gameover-sound');
const youWin = document.getElementById('you-win');
const youFail = document.getElementById('you-fail');
function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {}); // Prevent play() error if interrupted
}

function createBoard() {
  board = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
  board[3][3] = 'white';
  board[4][4] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  renderBoard();
  updateStatus();
}

function renderBoard() {
  game.innerHTML = '';
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (board[y][x]) {
        const disk = document.createElement('div');
        disk.className = `disk ${board[y][x]}`;
        cell.appendChild(disk);
      }
      if (currentPlayer === 'black' && isValidMove(x, y, currentPlayer)) {
        cell.classList.add('valid');
        cell.addEventListener('click', () => makeMove(x, y));
      }
      game.appendChild(cell);
    }
  }
}

function inBounds(x, y) {
  return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function isValidMove(x, y, color, b = board) {
  if (b[y][x]) return false;
  const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]];
  for (let [dx, dy] of directions) {
    let cx = x + dx, cy = y + dy;
    let seenOpponent = false;
    while (inBounds(cx, cy) && b[cy][cx] && b[cy][cx] !== color) {
      seenOpponent = true;
      cx += dx;
      cy += dy;
    }
    if (seenOpponent && inBounds(cx, cy) && b[cy][cx] === color) return true;
  }
  return false;
}

function getValidMoves(color, b = board) {
  let moves = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (isValidMove(x, y, color, b)) moves.push({x, y});
    }
  }
  return moves;
}

function makeMove(x, y) {
  if (!isValidMove(x, y, currentPlayer)) return;
  placeDisk(board, x, y, currentPlayer);
  playSound(placeSound);
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';

  if (!hasAnyValidMove(currentPlayer)) {
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    if (!hasAnyValidMove(currentPlayer)) {
      endGame();
      return;
    }
  }

  renderBoard();
  updateStatus();

  if (currentPlayer === 'white') setTimeout(aiMove, 300);
}

function placeDisk(b, x, y, color) {
  b[y][x] = color;
  const directions = [[1,0], [-1,0], [0,1], [0,-1], [1,1], [-1,-1], [1,-1], [-1,1]];
  for (let [dx, dy] of directions) {
    let cx = x + dx, cy = y + dy;
    const toFlip = [];
    while (inBounds(cx, cy) && b[cy][cx] && b[cy][cx] !== color) {
      toFlip.push([cx, cy]);
      cx += dx;
      cy += dy;
    }
    if (toFlip.length && inBounds(cx, cy) && b[cy][cx] === color) {
      for (let [fx, fy] of toFlip) b[fy][fx] = color;
    }
  }
}

function hasAnyValidMove(color) {
  return getValidMoves(color).length > 0;
}

function countDisks(b = board) {
  let black = 0, white = 0;
  for (let row of b) {
    for (let cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    }
  }
  return { black, white };
}

function updateStatus() {
  const { black, white } = countDisks();
  status.innerText = `Black (You): ${black} | White (AI): ${white} | Turn: ${currentPlayer}`;
}

function endGame() {
  const { black, white } = countDisks();
  let msg = `Game Over! Black: ${black}, White: ${white}. `;
  msg += black > white ? 'You win!' : white > black ? 'AI wins!' : "It's a draw!";
  status.innerText = msg;
  if (black > white) { playSound(youWin);}
  if ( white >black) { playSound(youFail)}
  //playSound(gameoverSound);
}

// --- AI with Minimax + Alpha-Beta ---
function aiMove() {
  const depth = parseInt(difficultySelect.value, 10);
  const best = minimax(board, depth, -Infinity, Infinity, true);
  if (best.move) makeMove(best.move.x, best.move.y);
}

function minimax(b, depth, alpha, beta, isMax) {
  const color = isMax ? 'white' : 'black';
  const validMoves = getValidMoves(color, b);

  if (depth === 0 || validMoves.length === 0) {
    return { score: evaluateBoard(b) };
  }

  let bestMove = null;
  if (isMax) {
    let maxEval = -Infinity;
    for (let move of validMoves) {
      const newBoard = cloneBoard(b);
      placeDisk(newBoard, move.x, move.y, 'white');
      const eval = minimax(newBoard, depth - 1, alpha, beta, false).score;
      if (eval > maxEval) {
        maxEval = eval;
        bestMove = move;
      }
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    for (let move of validMoves) {
      const newBoard = cloneBoard(b);
      placeDisk(newBoard, move.x, move.y, 'black');
      const eval = minimax(newBoard, depth - 1, alpha, beta, true).score;
      if (eval < minEval) {
        minEval = eval;
        bestMove = move;
      }
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return { score: minEval, move: bestMove };
  }
}

function cloneBoard(b) {
  return b.map(row => row.slice());
}

function evaluateBoard(b) {
  const { black, white } = countDisks(b);
  return white - black;
}

createBoard();
