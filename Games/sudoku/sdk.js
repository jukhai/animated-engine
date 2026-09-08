
const N = 9, BOX = 3;
let solution = [], puzzle = [];

function generateEmptyBoard() {
  return Array.from({ length: N }, () => Array(N).fill(0));
}

function isSafe(board, row, col, num) {
  for (let i = 0; i < N; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const boxRow = row - row % BOX, boxCol = col - col % BOX;
  for (let i = 0; i < BOX; i++) {
    for (let j = 0; j < BOX; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
}

function solve(board) {
  for (let row = 0; row < N; row++) {
    for (let col = 0; col < N; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([...Array(N).keys()].map(x => x + 1));
        for (const num of nums) {
          if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function removeCells(board, count) {
  let removed = 0;
  while (removed < count) {
    const row = Math.floor(Math.random() * N);
    const col = Math.floor(Math.random() * N);
    if (board[row][col] !== 0) {
      board[row][col] = 0;
      removed++;
    }
  }
  return board;
}

function createSudokuGrid(board) {
  const container = document.getElementById("sudokuContainer");
  container.innerHTML = ""; // clear existing grid
  const table = document.createElement("table");

  for (let i = 0; i < N; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < N; j++) {
      const cell = document.createElement("td");
      // if ((j +1) % 3 === 0 && j < N) cell.classList.add("box-border");
      if (j % 3 === 0) cell.classList.add("box-left");
      if( j == N-1)  cell.classList.add("box-right");
      if (i % 3 === 0) cell.classList.add("box-top");
      if( i == N-1)  cell.classList.add("box-bottom");

      const input = document.createElement("input");
      input.setAttribute("maxlength", 1);
      input.setAttribute("data-row", i);
      input.setAttribute("data-col", j);

      if (board[i][j] !== 0) {
        input.value = board[i][j];
        input.disabled = true;
        // input.style.color ='#0aa'
        input.style.background = "#eee";
        input.style.fontWeight = "bold";
      }

      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  container.appendChild(table);
}


function checkSolution() {
  const grid = Array.from({ length: N }, () => Array(N).fill(0));
  let allFilled = true;

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      const input = document.querySelector(`input[data-row='${i}'][data-col='${j}']`);
      const val = parseInt(input.value);
      
      if (!val || val < 1 || val > 9) {
        input.style.color = "red";
        allFilled = false;
      } else {
        grid[i][j] = val;
        input.style.color = "blue";        
      }
    }
  }

  if (!allFilled) {
    document.getElementById("result").innerText = "⚠️ Please fill all cells with digits 1–9.";
    return;
  }

  if (isValidSudoku(grid)) {
    document.getElementById("result").innerText = "🎉 Great job! You solved it!";
  } else {
    document.getElementById("result").innerText = "❌ Oops! Something is wrong, try again.";
  }
}

function isValidSudoku(board) {
  function hasAllOneToNine(group) {
    return group.slice().sort().join('') === '123456789';
  }

  // Check rows and columns
  for (let i = 0; i < N; i++) {
    const row = [], col = [];
    for (let j = 0; j < N; j++) {
      row.push(board[i][j]);
      col.push(board[j][i]);
    }
    if (!hasAllOneToNine(row) || !hasAllOneToNine(col)) return false;
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < N; boxRow += BOX) {
    for (let boxCol = 0; boxCol < N; boxCol += BOX) {
      const box = [];
      for (let i = 0; i < BOX; i++) {
        for (let j = 0; j < BOX; j++) {
          box.push(board[boxRow + i][boxCol + j]);
        }
      }
      if (!hasAllOneToNine(box)) return false;
    }
  }

  return true;
}

function newPuzzle() {
  document.getElementById("result").innerText = "";
  solution = generateEmptyBoard();
  solve(solution);
  const level = parseInt(document.getElementById("difficulty").value);
  puzzle = solution.map(row => [...row]);
  removeCells(puzzle, level);
  createSudokuGrid(puzzle);
}
// Auto start on load 





