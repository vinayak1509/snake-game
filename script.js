// Simple Snake Game
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const gridSize = 20; // number of cells per row/col
let cellSize = 0; // will be set by resizeCanvas()

function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    // clientWidth comes from CSS (responsive). Keep square by using min of width/height.
    const clientSize = Math.min(canvas.clientWidth || canvas.width, canvas.clientHeight || canvas.height) || 400;
    const pixelSize = Math.floor(clientSize * dpr);
    canvas.width = pixelSize;
    canvas.height = pixelSize;
    cellSize = canvas.width / gridSize;
}

let snake;
let direction;
let nextDirection;
let food;
let score = 0;
let highScore = 0;
let running = false;
let gameInterval = null;
let speed = 120; // ms per frame

function init() {
    snake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    placeFood();
    score = 0;
    running = false;
    scoreEl.textContent = score;
    highScore = Number(localStorage.getItem('snake_highscore') || 0);
    highScoreEl.textContent = highScore;
    clearInterval(gameInterval);
    resizeCanvas();
}

function placeFood() {
    while (true) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        if (!snake.some(s => s.x === x && s.y === y)) {
            food = { x, y };
            return;
        }
    }
}

function drawCell(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function draw() {
    // background
    ctx.fillStyle = '#031424';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // food
    drawCell(food.x, food.y, '#ef4444');

    // snake
    for (let i = 0; i < snake.length; i++) {
        drawCell(snake[i].x, snake[i].y, i === 0 ? '#10b981' : '#065f46');
    }
}

function update() {
    // update direction
    if ((nextDirection.x !== -direction.x || nextDirection.y !== -direction.y) && (nextDirection.x !== 0 || nextDirection.y !== 0)) {
        direction = nextDirection;
    }

    if (direction.x === 0 && direction.y === 0) return; // not moving

    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // wrap around edges
    if (newHead.x < 0) newHead.x = gridSize - 1;
    if (newHead.x >= gridSize) newHead.x = 0;
    if (newHead.y < 0) newHead.y = gridSize - 1;
    if (newHead.y >= gridSize) newHead.y = 0;

    // check collision with self
    if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        gameOver();
        return;
    }

    snake.unshift(newHead);

    // eat food
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snake_highscore', highScore);
            highScoreEl.textContent = highScore;
        }
        placeFood();
    } else {
        snake.pop();
    }
}

function gameLoop() {
    update();
    draw();
}

function startGame() {
    if (running) return;
    running = true;
    // update button text to 'Pause'
    startBtn.textContent = 'Pause';
    if (direction.x === 0 && direction.y === 0) {
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
    }
    gameInterval = setInterval(gameLoop, speed);
}

function pauseGame() {
    if (!running) return;
    running = false;
    clearInterval(gameInterval);
    // change start button text to 'Resume'
    startBtn.textContent = 'Resume';
}

function restartGame() {
    init();
    // reset start button text
    startBtn.textContent = 'Start';
    startGame();
}

function gameOver() {
    pauseGame();
    // when lost, set button back to 'Start'
    startBtn.textContent = 'Start';
    alert('Game Over! Your score: ' + score);
}

window.addEventListener('keydown', (e) => {
    const key = e.key;
    if (key === 'ArrowUp') nextDirection = { x: 0, y: -1 };
    if (key === 'ArrowDown') nextDirection = { x: 0, y: 1 };
    if (key === 'ArrowLeft') nextDirection = { x: -1, y: 0 };
    if (key === 'ArrowRight') nextDirection = { x: 1, y: 0 };

    if (key === ' ') { // space to toggle pause
        if (running) pauseGame(); else startGame();
    }
});

// keep canvas resolution in sync when window resizes
let resizeTimeout = null;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // preserve visual state: recompute sizes and redraw
        resizeCanvas();
        draw();
    }, 100);
});

startBtn.addEventListener('click', () => {
    if (!running) {
        // if currently showing 'Resume' or 'Start' start the game
        startGame();
    } else {
        // currently running, so pause
        pauseGame();
    }
});

restartBtn.addEventListener('click', restartGame);

init();
draw();
