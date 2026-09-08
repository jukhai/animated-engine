function setRandomBackground() {
  const images = [
    'images/1.jpg',
    'images/2.jpg',
    'images/3.jpg',
    'images/4.jpg',
    'images/5.jpg',
    'images/6.jpg'
  ];

  const chosen = images[Math.floor(Math.random() * images.length)];

  const wrapper = document.getElementById('board-wrapper');
  wrapper.style.setProperty('--bg-image', `url('${chosen}')`);
}

window.addEventListener('DOMContentLoaded', setRandomBackground);

// Grapheme splitter using Intl.Segmenter

function splitGraphemes(str) {
  return [...new Intl.Segmenter('und', { granularity: 'grapheme' }).segment(str)].map(s => s.segment);
}

function placeCaretAtEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function setupCellLimit(cell) {
  cell.addEventListener('input', () => {
    const g = splitGraphemes(cell.textContent);
    if (g.length > 1) {
      cell.textContent = g[0];
      placeCaretAtEnd(cell);
    }
  });
}
let wordPlacements = []; // list of { word, definition, r, c, vertical }
let placedWords = []; // store full entries with word + definition
let lastClickedCell = null;
let dictionary = [];
let selectedTile = null;
// const rackLetters = ['你', '好', 'á', 'é', '漢', '字', 'í'];
let wordMap = new Map();
let validCells = new Set();
let missingCells = new Set();

async function loadDictionary() {
  const res = await fetch('ji_gi.json');
  dictionary = await res.json();
  for (const entry of dictionary) {
    wordMap.set(entry.word, entry.definition);
  }
}

function checkWords() {
  const board = document.getElementById('board');
  const cells = Array.from(board.children);
  const message = document.getElementById('message');
  message.innerHTML = '';
  document.querySelectorAll('.cell.guessed').forEach(c => c.classList.remove('guessed'));

  let matchedWords = new Set();

  function readFromBoard(r, c, vertical, length) {
    let chars = [];
    for (let i = 0; i < length; i++) {
      const rr = vertical ? r + i : r;
      const cc = vertical ? c : c + i;
      const ch = cells[rr * BOARD_SIZE + cc].textContent.trim();
      chars.push(ch);
    }
    return chars.join('');
  }

  for (const { word, r, c, vertical } of wordPlacements) {
    const cleanWord = word.replace(/[\s\-]/g, '');
    const guess = readFromBoard(r, c, vertical, splitGraphemes(cleanWord).length);
    if (guess === cleanWord) {
      matchedWords.add(word);
      // Optionally highlight guessed cells
      for (let i = 0; i < cleanWord.length; i++) {
        const rr = vertical ? r + i : r;
        const cc = vertical ? c : c + i;
        cells[rr * BOARD_SIZE + cc].classList.add('guessed');
      }
    }
  }

  if (matchedWords.size === 0) {
    message.textContent = '❌ No correct words found.';
  } else {
    message.innerHTML = '✅ Correct words:<br>';
    for (const word of matchedWords) {
      const def = wordMap.get(word) || '(No definition)';
      message.innerHTML += `<b>${word}</b>: ${def}<br>`;
    }
  }
}

function createBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const index = r * BOARD_SIZE + c;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = index;
      cell.addEventListener('click', () => {
        lastClickedCell = cell;
      });
      if (missingCells.has(index)) {
        cell.contentEditable = true;
        setupCellLimit(cell);
      } else {
        const char = boardMatrix[r][c];
        if (char) {
          cell.textContent = char;
          cell.classList.add('locked');
          cell.contentEditable = false;
        } else if (validCells.has(index)) {
          cell.contentEditable = true;
          setupCellLimit(cell);
        } else {
          cell.classList.add('unused');
          cell.contentEditable = false;
        }
      }

      board.appendChild(cell);
    }
  }
}

function maskWord(word) {
  const chars = splitGraphemes(word);
  const maskableIndices = chars
    .map((ch, i) => /[^\s\-]/.test(ch) ? i : -1)
    .filter(i => i !== -1);
  const toMask = Math.max(1, Math.floor(maskableIndices.length / 3));
  const shuffled = maskableIndices.sort(() => Math.random() - 0.5).slice(0, toMask);
  for (const i of shuffled) chars[i] = '_';
  return chars.join('');
}




function giveMaskedHint() {
  const hintBox = document.getElementById('hint');
  if (!lastClickedCell || !lastClickedCell.classList.contains('cell')) {
    hintBox.textContent = 'Click a cell to get a contextual hint.';
    return;
  }

  const index = parseInt(lastClickedCell.dataset.index);
  const r0 = Math.floor(index / BOARD_SIZE);
  const c0 = index % BOARD_SIZE;

  for (const { word, definition, r, c, vertical } of wordPlacements) {
    const graphemes = splitGraphemes(word.replace(/[\s\-]/g, ''));
    const len = graphemes.length;
    console.log(`r0 =${r0 + 1} : r ${r + 1}, c0=${c0 + 1} : c ${c + 1} vertical: ${vertical} ${word}`);
    // check if clicked cell is within this word's range
    if (vertical) {
      if (c === c0 && r0 >= r && r0 < r + len) {
        const masked = maskWord(word);
        hintBox.innerHTML =
          `<b>Definition:</b> ${definition}<br>` +
          `<b>Hint:</b> <code>${masked}</code> (${len} jī)<br>` +
          `(ti̍t: tē ${c + 1} chōa/hâng) `;
        return;
      }
    } else {
      if (r === r0 && c0 >= c && c0 < c + len) {
        const masked = maskWord(word);
        hintBox.innerHTML =
          `<b>Definition:</b> ${definition}<br>` +
          `<b>Hint:</b> <code>${masked}</code> (${len} jī)<br>` +
          `(hûiⁿ: tē ${r + 1} lia̍t/pâi)`;
        return;
      }
    }
  }

  hintBox.textContent = 'No word placed at this cell.';
}

const BOARD_SIZE = 15;
let boardMatrix = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(''));
let lockedPositions = new Set();
let usedWords = new Set();
function lookupDefinition() {
  const input = document.getElementById('lookupInput').value.trim();
  const resultBox = document.getElementById('lookupResult');
  const suggestions = document.getElementById('suggestions');
  suggestions.style.display = 'none';

  if (!input) {
    resultBox.textContent = 'Please enter a word.';
    return;
  }

  const entry = dictionary.find(d => d.word === input);
  if (entry) {
    resultBox.innerHTML = `<b>${entry.word}</b>: ${entry.definition || '(No definition provided)'}`;
  } else {
    // Fuzzy match fallback
    const similar = dictionary.filter(d => d.word.includes(input));
    if (similar.length > 0) {
      resultBox.innerHTML = `❓ Not found exactly. Similar words:<br>` + similar
        .slice(0, 5)
        .map(d => `<b>${d.word}</b>: ${d.definition || '(No definition)'}`)
        .join('<br>');
    } else {
      resultBox.innerHTML = `❌ Word not found in dictionary.`;
    }
  }
}

function updateSuggestions() {
  const input = document.getElementById('lookupInput').value.trim();
  const box = document.getElementById('suggestions');
  box.innerHTML = '';
  box.style.display = 'none';

  if (input.length < 1) return;

  const matches = dictionary
    .filter(d => d.word.includes(input))
    .slice(0, 10);

  if (matches.length === 0) return;

  for (const match of matches) {
    const div = document.createElement('div');
    div.textContent = match.word;
    div.style.padding = '4px';
    div.style.cursor = 'pointer';
    div.onclick = () => {
      document.getElementById('lookupInput').value = match.word;
      box.style.display = 'none';
      lookupDefinition();
    };
    box.appendChild(div);
  }

  box.style.display = 'block';
}


let currentHintWord = null;

function placeDictionaryWordsOnBoard(maxWords = 25) {
  let placed = 0;
  while (placed < maxWords) {
    const entry = dictionary[Math.floor(Math.random() * dictionary.length)];
    const word = entry.word.replace(/[\s\-]/g, '');
    const graphemes = splitGraphemes(word);
    if (usedWords.has(word) || graphemes.length > BOARD_SIZE) continue;

    const vertical = Math.random() < 0.5;
    const maxStart = BOARD_SIZE - graphemes.length;
    const row = vertical ? Math.floor(Math.random() * maxStart) : Math.floor(Math.random() * BOARD_SIZE);
    const col = vertical ? Math.floor(Math.random() * BOARD_SIZE) : Math.floor(Math.random() * maxStart);

    let canPlace = true;
    for (let i = 0; i < graphemes.length; i++) {
      const r = vertical ? row + i : row;
      const c = vertical ? col : col + i;

      const boardChar = boardMatrix[r][c];
      const newChar = graphemes[i];

      if (boardChar && boardChar !== newChar) {
        canPlace = false; // ❌ existing character conflicts
        break;
      }
    }

    if (!canPlace) continue;

    // Randomly decide which letters to leave blank for guessing
    const maskCount = Math.max(1, Math.floor(graphemes.length / 2)); // mark 1/3
    const maskIndices = Array.from({ length: graphemes.length }, (_, i) => i).sort(() => Math.random() - 0.5).slice(0, maskCount);

    for (let i = 0; i < graphemes.length; i++) {
      const r = vertical ? row + i : row;
      const c = vertical ? col : col + i;
      const index = r * BOARD_SIZE + c;

      if (maskIndices.includes(i)) {
        missingCells.add(index);
        validCells.add(index);
      } else {
        boardMatrix[r][c] = graphemes[i];
        lockedPositions.add(index);
      }

      // Mark only this exact cell as valid (if masked)
      if (maskIndices.includes(i)) {
        missingCells.add(index);
        validCells.add(index);
      } else {
        boardMatrix[r][c] = graphemes[i];
        lockedPositions.add(index);
      }

      // Record this cell as used
      validCells.add(index);
    }

    usedWords.add(word);
    wordPlacements.push({
      word: entry.word,
      definition: entry.definition,
      r: row,
      c: col,
      vertical
    });
    placed++;
  }
}

window.onload = async () => {
  await loadDictionary();
  placeDictionaryWordsOnBoard();
  createBoard();
};
