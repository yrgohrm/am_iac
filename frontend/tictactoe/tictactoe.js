import HighscoreService from "../highscore/highscore.js";

// Constants
const GAME_NAME = "tictactoe";
const BOARD_SIZE = 3;
const EMPTY = "";
const HUMAN_PLAYER = "X";
const COMPUTER_PLAYER = "O";

// Variables
let board = [];
let startTime;
let stopHumanCount;

// Elements
const cells = document.querySelectorAll(".cell");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset");
const highscore = document.getElementById("highscore");

// Functions
function init() {
    reset();

    // Add reset
    resetButton.addEventListener("click", reset);
}

function reset() {
    setMessage("");

    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = EMPTY;
            const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
            cell.textContent = "";
        }
    }

    // Add event listeners to cells
    cells.forEach(cell => {
        cell.addEventListener("click", handleCellClick, { once: true });
    });

    startTime = null;
    stopHumanCount = 0;
}

function handleCellClick(event) {
    if (startTime === null) {
        startTime = Date.now();
    }

    const row = event.target.children[0]?.dataset.row;
    const col = event.target.children[0]?.dataset.col;

    // Check if cell is a valid target
    if (row === undefined || col === undefined || board[row][col] !== EMPTY) {
        return;
    }

    // Update board and UI
    board[row][col] = HUMAN_PLAYER;
    event.target.children[0].textContent = HUMAN_PLAYER;

    // Check for winner or tie
    if (checkWin()) {
        cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
        handleWinner(HUMAN_PLAYER);
    } else if (checkTie()) {
        cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
        handleTie();
    } else {
        // Computer plays
        setTimeout(() => {
            computerPlay();
        }, 500);
    }
}

function setMessage(msg) {
    message.textContent = msg;
}

function handleWinner(player) {
    const winnerText = player === HUMAN_PLAYER ? "You win!" : "The Computer wins!";
    setMessage(`${winnerText}`);
    if (player === HUMAN_PLAYER) {
        recordScore(1);
    }
}

function handleTie() {
    setMessage("It's a tie.");
    recordScore(0.5);
}

function recordScore(scoreMultiplier) {
    // use a timeout to allow the board do render (ie. the click handler to finish)
    setTimeout(async () => {
        const playerName = prompt("Enter your name to record your score");
        if (!playerName) return;

        const endTime = Date.now();
        const time = (endTime - startTime) / 1000;
        const empty = board.reduce((acc, row) => acc + row.filter(cell => cell === EMPTY).length, 0);
        const score = Math.floor(10000 / time) * (empty + 1) * scoreMultiplier;
            
        await HighscoreService.setHighscore(GAME_NAME, playerName, score);

        updateHighscore();
    }, 5);
}

async function updateHighscore() {
    const entries = await HighscoreService.getHighscore(GAME_NAME);
    highscore.innerHTML = "";
    for (const entry of entries.slice(0, 15)) {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        highscore.appendChild(li);
    }
}

function computerPlay() {
    // Pick a random empty cell
    let [row, col] = pickComputerCell();

    // Update board and UI
    board[row][col] = COMPUTER_PLAYER;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = COMPUTER_PLAYER;

    // Check for winner or tie
    if (checkWin()) {
        cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
        handleWinner(COMPUTER_PLAYER);
    } else if (checkTie()) {
        cells.forEach(cell => cell.removeEventListener("click", handleCellClick));
        handleTie();
    }
}

// Pick the next cell for the computer to play at
// and do it somewhat intelligently
function pickComputerCell() {
    // if the computer can win, let's do that
    const computerWinPos = findWinningPosition(COMPUTER_PLAYER);
    if (computerWinPos !== null) {
        return computerWinPos;
    }

    // here we should do the same for the human player
    // and stop them if possible, but then the human
    // would never win, so we'll just do it once
    if (stopHumanCount < 1) {
        const humanWinsPos = findWinningPosition(HUMAN_PLAYER);
        if (humanWinsPos !== null) {
            stopHumanCount++;
            return humanWinsPos;
        }
    }

    // if the center is empty, it's the best
    if (board[1][1] === EMPTY) {
        return [1, 1];
    }

    // well, let's just pick one at random...
    let row, col
    do {
        row = Math.floor(Math.random() * BOARD_SIZE);
        col = Math.floor(Math.random() * BOARD_SIZE);
    } while (board[row][col] !== EMPTY);

    return [row, col];
}

function findWinningPosition(player) {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                board[i][j] = player;
                const win = checkWin();
                board[i][j] = EMPTY;

                if (win) {
                    return [i, j]
                }
            }
        }
    }

    return null;
}

function checkWin() {
    // Check rows
    for (let i = 0; i < BOARD_SIZE; i++) {
        if (board[i][0] !== EMPTY && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
            return true;
        }
    }

    // Check columns
    for (let j = 0; j < BOARD_SIZE; j++) {
        if (board[0][j] !== EMPTY && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
            return true;
        }
    }

    // Check diagonals
    if (board[0][0] !== EMPTY && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
        return true;
    }

    return (board[0][2] !== EMPTY && board[0][2] === board[1][1] && board[1][1] === board[2][0]);
}

function checkTie() {
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                return false;
            }
        }
    }

    return true;
}

init();
updateHighscore();
