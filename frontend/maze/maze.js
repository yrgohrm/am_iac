import HighscoreService from "../highscore/highscore.js";

const GAME_NAME = "maze";

class MazeGame {

    // Original JavaScript code by Chirp Internet: www.chirpinternet.eu
    // Please acknowledge use of this code by including this header.

    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.cols = 2 * this.width + 1;
        this.rows = 2 * this.height + 1;

        this.maze = this.initArray([])
        
        this.totalSteps = 0;
        this.backtrackCount = 0;

        this.endReached = false;

        this.startTime = null;

        /* place initial walls */
        this.maze.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (r === 0 || 
                    r === this.rows - 1 || 
                    c === 0 || 
                    c === this.cols - 1 || 
                    c % 2 === 0 && r % 2 === 0) {
                    this.maze[r][c] = ["wall"];
                }
            });
        });

        /* place entrance in top row */
        const entrancePosTop = this.posToSpace(this.rand(1, this.width));
        this.maze[0][entrancePosTop] = ["entrance", "player", "visited"];
        this.currentPosition = [0, entrancePosTop];

        /* place exit in bottom row */
        const exitPosBottom = this.posToSpace(this.rand(1, this.width));
        this.maze[this.rows - 1][exitPosBottom] = ["exit"];

        /* start partitioning */
        this.partition(1, this.height - 1, 1, this.width - 1);
    }

    initArray(value) {
        return new Array(this.rows).fill().map(() => new Array(this.cols).fill(value));
    }

    rand(min, max) {
        return min + Math.floor(Math.random() * (1 + max - min));
    }

    posToSpace(x) {
        return 2 * (x - 1) + 1;
    }

    posToWall(x) {
        return 2 * x;
    }

    shuffle(array) {
        /* Durstenfeld shuffle */
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    partition(r1, r2, c1, c2) {
        if (r2 < r1 || c2 < c1) {
            return false;
        }

        const horiz = r1 == r2 ? r1 : this.getPartitionCoordinate(r1, r2);
        const vert = c1 == c2 ? c1 : this.getPartitionCoordinate(c1, c2);

        this.createPartitionWalls(r1, r2, c1, c2, horiz, vert);
        this.createGapsInPartitionWalls(r1, r2, c1, c2, horiz, vert);

        this.partition(r1, horiz - 1, c1, vert - 1);
        this.partition(horiz + 1, r2, c1, vert - 1);
        this.partition(r1, horiz - 1, vert + 1, c2);
        this.partition(horiz + 1, r2, vert + 1, c2);
    }

    getPartitionCoordinate(start, end) {
        const x = start + 1;
        const y = end - 1;
        const startOffset = 1 / 4;
        const endOffset = 3 / 4;
        const startRange = x + (y - x) * startOffset;
        const endRange = x + (y - x) * endOffset;
        return this.rand(Math.round(startRange), Math.round(endRange));
    }

    createPartitionWalls(r1, r2, c1, c2, horiz, vert) {
        for (let i = this.posToWall(r1) - 1; i <= this.posToWall(r2) + 1; i++) {
            for (let j = this.posToWall(c1) - 1; j <= this.posToWall(c2) + 1; j++) {
                if ((i == this.posToWall(horiz)) || (j == this.posToWall(vert))) {
                    this.maze[i][j] = ["wall"];
                }
            }
        }
    }

    createGapsInPartitionWalls(r1, r2, c1, c2, horiz, vert) {
        const gaps = this.shuffle([true, true, true, false]);

        if (gaps[0]) {
            const gapPosition = this.rand(c1, vert);
            this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
        }

        if (gaps[1]) {
            const gapPosition = this.rand(vert + 1, c2 + 1);
            this.maze[this.posToWall(horiz)][this.posToSpace(gapPosition)] = [];
        }

        if (gaps[2]) {
            const gapPosition = this.rand(r1, horiz);
            this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
        }

        if (gaps[3]) {
            const gapPosition = this.rand(horiz + 1, r2 + 1);
            this.maze[this.posToSpace(gapPosition)][this.posToWall(vert)] = [];
        }
    }

    display(id, doneCallback) {
        this.doneCallback = doneCallback;
        this.mazeDiv = document.getElementById(id);

        if (!this.mazeDiv) {
            return false;
        }

        this.mazeDiv.style.setProperty("--grid-cols", this.cols);
        this.mazeDiv.style.setProperty("--grid-rows", this.rows);

        while (this.mazeDiv.firstChild) {
            this.mazeDiv.removeChild(this.mazeDiv.firstChild);
        }

        const container = this.mazeDiv;
        container.dataset.steps = this.totalSteps;

        this.maze.forEach((row) => {
            row.forEach((cell) => {
                let cellDiv = document.createElement("div");
                if (cell) {
                    cellDiv.className = cell.join(" ");
                }
                container.appendChild(cellDiv);
            });
        });

        document.addEventListener('keydown', (evt) => this.movePlayer(evt));

        if (this.startTime === null) {
            this.startTime = Date.now();
        }

        // no need to keep that maze data around anymore
        this.maze = null;

        return true;
    }

    movePlayer(event) {
        if (this.endReached) return;

        const [row, col] = this.currentPosition;

        const movements = {
            ArrowUp: [-1, 0],
            ArrowDown: [1, 0],
            ArrowLeft: [0, -1],
            ArrowRight: [0, 1],
        };

        const movement = movements[event.code];
        if (!movement) return; // Ignore non-arrow keys or unknown arrow keys

        const newRow = row + movement[0];
        const newCol = col + movement[1];
        if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) {
            return; // Ignore movements outside the grid
        }

        const upcomingElem = this.mazeDiv.children[newRow * this.cols + newCol];
        if (upcomingElem.classList.contains("wall")) {
            return; // Ignore movements into walls
        }

        if (upcomingElem.classList.contains("visited")) {
            this.backtrackCount++;
        }

        const currentElem = this.mazeDiv.children[row * this.cols + col];
        currentElem.classList.remove("player");
        upcomingElem.classList.add("player");
        upcomingElem.classList.add("visited");

        this.currentPosition = [newRow, newCol];
        this.totalSteps++;

        if (upcomingElem.classList.contains("exit")) {
            this.endReached = true;
            this.calculateScore();
        }
    }

    calculateScore() {
        // use a timeout to allow the board do render (ie. the click handler to finish)
        setTimeout(async () => {
            const playerName = prompt("Enter your name to record your score");
            if (!playerName) return;

            const timeTaken = (Date.now() - this.startTime) / 1000;
            const score = Math.round(5000 * (this.totalSteps / timeTaken) / (this.backtrackCount + 1));

            await HighscoreService.setHighscore(GAME_NAME, playerName, score);

            if (this.doneCallback) {
                this.doneCallback(score);
            }
        }, 5);
    }
}

const highscore = document.getElementById("highscore");
const message = document.getElementById("message");
const resetButton = document.getElementById("reset");

async function updateHighscore() {
    const entries = await HighscoreService.getHighscore(GAME_NAME);
    highscore.innerHTML = "";
    for (const entry of entries.slice(0, 15)) {
        const li = document.createElement("li");
        li.textContent = `${entry.name}: ${entry.score}`;
        highscore.appendChild(li);
    }
}

function endOfGame(score) {
    message.textContent = `You got ${score} points!`
    updateHighscore();
}

function initGame() {
    message.textContent = "";
    const maze = new MazeGame(8, 8);
    maze.display("maze", endOfGame);
}

updateHighscore();
initGame();

resetButton.addEventListener("click", initGame);
