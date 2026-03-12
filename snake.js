const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreNode = document.getElementById("score");
const bestNode = document.getElementById("best");
const statusNode = document.getElementById("status");

const gridSize = 21;
const cellSize = canvas.width / gridSize;
const speedMs = 130;

let snake;
let direction;
let nextDirection;
let food;
let running;
let paused;
let score;
let best = Number(localStorage.getItem("snake-best") || 0);
let timer = null;

bestNode.textContent = String(best);
reset();
render();

window.addEventListener("keydown", (event) => {
  const key = event.key;
  const map = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };

  if (key === " " || key === "Spacebar") {
    event.preventDefault();
    if (running) {
      paused = !paused;
      setStatus(paused ? "游戏暂停（空格继续）" : "游戏继续");
      if (!paused) {
        tick();
      }
      render();
    }
    return;
  }

  if (key.toLowerCase() === "r") {
    reset();
    render();
    return;
  }

  if (!(key in map)) {
    return;
  }

  event.preventDefault();
  const chosen = map[key];

  if (!running) {
    running = true;
    paused = false;
    setStatus("游戏进行中");
    nextDirection = chosen;
    tick();
    return;
  }

  if (paused) {
    return;
  }

  if (chosen.x + direction.x === 0 && chosen.y + direction.y === 0) {
    return;
  }

  nextDirection = chosen;
});

function reset() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = direction;
  food = randomFood();
  running = false;
  paused = false;
  score = 0;
  scoreNode.textContent = "0";
  setStatus("按任意方向键开始", "");
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

function tick() {
  if (!running || paused) {
    return;
  }

  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (isWall(head) || isSnake(head)) {
    running = false;
    paused = false;
    setStatus(`游戏结束！得分 ${score}，按 R 重开`, "game-over");
    render();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 1;
    scoreNode.textContent = String(score);
    if (score > best) {
      best = score;
      localStorage.setItem("snake-best", String(best));
      bestNode.textContent = String(best);
    }
    food = randomFood();
  } else {
    snake.pop();
  }

  render();
  timer = setTimeout(tick, speedMs);
}

function isWall(point) {
  return point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
}

function isSnake(point) {
  return snake.some((part) => part.x === point.x && part.y === point.y);
}

function randomFood() {
  let point;
  do {
    point = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (isSnake(point));

  return point;
}

function setStatus(text, className = "") {
  statusNode.textContent = text;
  statusNode.className = `status ${className}`.trim();
}

function render() {
  drawBoard();
  drawFood();
  drawSnake();
}

function drawBoard() {
  ctx.fillStyle = "#080d1f";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(120, 140, 200, 0.12)";
  for (let i = 0; i <= gridSize; i += 1) {
    const p = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    ctx.fillStyle = index === 0 ? "#6ce5b1" : "#35c98f";
    ctx.fillRect(part.x * cellSize + 1, part.y * cellSize + 1, cellSize - 2, cellSize - 2);
  });
}

function drawFood() {
  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.arc(
    food.x * cellSize + cellSize / 2,
    food.y * cellSize + cellSize / 2,
    cellSize * 0.32,
    0,
    Math.PI * 2
  );
  ctx.fill();
}
