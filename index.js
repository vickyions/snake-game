import Vector2 from "./Vector2.js";

const ARROW_LEFT = 37;
const ARROW_UP = 38;
const ARROW_RIGHT = 39;
const ARROW_DOWN = 40;

export const DIRECTION_VECTORS = {
  'left': new Vector2(-1, 0),
  'right': new Vector2(1, 0),
  'up': new Vector2(0, -1),
  'down': new Vector2(0, 1),
};

const OPPOSITE_DIRECTION_KEY = {
  [ARROW_RIGHT]: new Vector2(-1, 0),
  [ARROW_DOWN]: new Vector2(0, -1),
  [ARROW_LEFT]: new Vector2(1, 0),
  [ARROW_UP]: new Vector2(0, 1),
  68: new Vector2(-1, 0),
  83: new Vector2(0, -1),
  65: new Vector2(1, 0),
  87: new Vector2(0, 1),
}

export const CELL_SIZE = 40;
export const CELL_NUMBER = 20;

const CANVAS_WIDTH = CELL_SIZE * CELL_NUMBER;
const CANVAS_HEIGHT = CELL_SIZE * CELL_NUMBER;

const spriteSources = {
  food: "./assets/apple.png",
  head_u: "./assets/head_up.png",
  head_d: "./assets/head_down.png",
  head_l: "./assets/head_left.png",
  head_r: "./assets/head_right.png",
  tail_d: "./assets/tail_up.png",
  tail_u: "./assets/tail_down.png",
  tail_r: "./assets/tail_left.png",
  tail_l: "./assets/tail_right.png",
  body_hor: "./assets/body_horizontal.png",
  body_ver: "./assets/body_vertical.png",
  corner_tl: "./assets/body_tl.png",
  corner_tr: "./assets/body_tr.png",
  corner_bl: "./assets/body_bl.png",
  corner_br: "./assets/body_br.png",
  rat: "./assets/rat.png",
  mouse: "./assets/mouse.png",
  chicken: "./assets/chicken.png",
  pug: "./assets/pug.png",
};

export const sprites = {};

function loadImages(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function loadSprites() {
  const entries = Object.entries(spriteSources);
  for (const [key, src] of entries) {
    sprites[key] = await loadImages(src);
  }
  console.log('All sprites loaded: ', sprites);
};

await loadSprites();


let score = 0;

const canvas = window.canvas;
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
const scale = window.devicePixelRatio || 1;

// Set display size (css pixels)
canvas.style.width = `${CANVAS_WIDTH}px`;
canvas.style.height = `${CANVAS_HEIGHT}px`;

// Set actual size in memory (scaled to account for extra pixel density).
canvas.width = Math.floor(CANVAS_WIDTH * scale);
canvas.height = Math.floor(CANVAS_HEIGHT * scale);
// canvas.width = CANVAS_WIDTH;
// canvas.height = CANVAS_HEIGHT;

// Normalize coordinates system to use CSS pixels.
ctx.scale(scale, scale);



let SNAKE_SPEED = 10; // 10 frames / per sec // snake moves 1 cell/frame here this is 10 frames per second

let lastStepTime = performance.now();
const initialTime = lastStepTime;

function randomPosition() {
  return Math.floor(Math.random() * CELL_NUMBER); // 0 -> CELL_NUMBER - 1;
}

class Food {
  constructor() {
    this.mouseTileSize = 32;
    this.mouseTileColumns = 3;
    this.mouseTileRows = 4;
    this.lastTimeStamp = null;
    this.tick = 150; // 150ms
    this.sprites = ['rat', 'mouse', 'chicken', 'pug'];
    this.currentSpriteIndex = 0;
    this.verticalTileOffsetForRenderArtifact = 1; // upper image is visible in this tileset
    this.randomize();
  }

  randomize(snakeBody) {
    this.x = randomPosition();
    this.y = randomPosition();
    this.pos = new Vector2(this.x, this.y);
    if (snakeBody && snakeBody.some(part => part.isEqual(this.pos))) { this.randomize(snakeBody); return; }
    this.sy = Math.floor(Math.random() * this.mouseTileRows) // ctx.drawImage sy
    this.sx = 0;
    this.currentSpriteIndex = Math.floor(Math.random() * this.sprites.length);
  }

  draw(timeStamp) {
    if (!this.lastTimeStamp) this.lastTimeStamp = timeStamp;

    if (timeStamp - this.lastTimeStamp < this.tick) {

    } else {
      this.lastTimeStamp = timeStamp;

      this.sx = Math.floor(Math.random() * this.mouseTileColumns);
    }

    const xPos = this.pos.x * CELL_SIZE;
    const yPos = this.pos.y * CELL_SIZE;
    const padding = 0;
    ctx.drawImage(sprites[this.sprites[this.currentSpriteIndex]], this.sx * this.mouseTileSize, this.sy * (this.mouseTileSize + this.verticalTileOffsetForRenderArtifact), this.mouseTileSize, this.mouseTileSize, xPos, yPos - padding, CELL_SIZE, CELL_SIZE)

    // apple
    // ctx.drawImage(sprites.food, xPos, yPos, CELL_SIZE, CELL_SIZE);


    /// block
    // ctx.fillStyle = "yellow";
    // ctx.beginPath();
    // const arcRadius = CELL_SIZE / 2;
    // const arcCenterX = this.pos.x * CELL_SIZE + arcRadius;
    // const arcCenterY = this.pos.y * CELL_SIZE + arcRadius;
    // const arcStartAngle = 0;
    // const arcEndAngle = 2 * Math.PI;
    // ctx.arc(arcCenterX, arcCenterY, arcRadius, arcStartAngle, arcEndAngle);
    // ctx.fill();
  }
}

class Snake {
  constructor() {
    this.body = [new Vector2(5, 3), new Vector2(4, 3), new Vector2(3, 3)];
    this._direction = new Vector2(1, 0);
    this.newBlock = false;
  }

  get direction() {
    return this._direction;
  }

  set direction(dirString) {
    if (!['l', 'u', 'r', 'd'].includes(dirString)) throw new Error('Direction should be one among l/u/r/d');
    switch (dirString) {
      case 'l':
        this._direction = new Vector2(-1, 0);
        break;
      case 'u':
        this._direction = new Vector2(0, -1);
        break;
      case 'r':
        this._direction = new Vector2(1, 0);
        break;
      case 'd':
        this._direction = new Vector2(0, 1);
        break;
    }
  }

  draw() {
    ctx.fillStyle = 'red';
    this.body.forEach((part, index) => {
      const xPos = part.x * CELL_SIZE;
      const yPos = part.y * CELL_SIZE;
      let partSprite = sprites.food;
      if (index === 0) {
        let relativeDirection = 'u';
        let next = this.body[index + 1].subtract(part);
        if (next.magnitude > 1) next = next.divide(1 - CELL_NUMBER);
        if (next.y === -1) relativeDirection = 'd';
        if (next.y === 1) relativeDirection = 'u';
        if (next.x === -1) relativeDirection = 'r';
        if (next.x === 1) relativeDirection = 'l';
        partSprite = sprites[`head_${relativeDirection}`];
      } else if (index === this.body.length - 1) {
        let relativeDirection = 'u';
        let previous = this.body[index - 1].subtract(part);
        if (previous.magnitude > 1) previous = previous.divide(1 - CELL_NUMBER);
        if (previous.y === -1) relativeDirection = 'u';
        if (previous.y === 1) relativeDirection = 'd';
        if (previous.x === -1) relativeDirection = 'l';
        if (previous.x === 1) relativeDirection = 'r';
        partSprite = sprites[`tail_${relativeDirection}`];
      } else {
        let next = this.body[index + 1].subtract(part);
        let previous = this.body[index - 1].subtract(part);

        if (previous.magnitude > 1) previous = previous.divide(1 - CELL_NUMBER) // (19, 0) so divide by CELL_NUMBER - 1
        if (next.magnitude > 1) next = next.divide(1 - CELL_NUMBER) // (19, 0) so divide by -(CELL_NUMBER - 1) to get a right direction unit vector
        // boundry jump corner handling

        if (next.y === 0 && previous.y === 0) partSprite = sprites.body_hor;
        if (next.x === 0 && previous.x === 0) partSprite = sprites.body_ver;
        if ((next.x === 1 && previous.y === 1) || (next.y === 1 && previous.x === 1)) partSprite = sprites.corner_tl;
        if ((next.y === -1 && previous.x === 1) || (next.x === 1 && previous.y === -1)) partSprite = sprites.corner_bl;
        if ((next.y === -1 && previous.x === -1) || (next.x === -1 && previous.y === -1)) partSprite = sprites.corner_br;
        if ((next.y === 1 && previous.x === -1) || (next.x === -1 && previous.y === 1)) partSprite = sprites.corner_tr;
      }
      ctx.drawImage(partSprite, xPos, yPos, CELL_SIZE, CELL_SIZE);
    });
  }

  move() {
    let newHeadPos = this.body[0].add(this.direction);
    const CANVAS_TOTAL_ROW_VECTOR = new Vector2(0, CELL_NUMBER);
    const CANVAS_TOTAL_COLUMN_VECTOR = new Vector2(CELL_NUMBER, 0);
    if (newHeadPos.x >= CELL_NUMBER) newHeadPos = newHeadPos.subtract(CANVAS_TOTAL_COLUMN_VECTOR);
    if (newHeadPos.y >= CELL_NUMBER) newHeadPos = newHeadPos.subtract(CANVAS_TOTAL_ROW_VECTOR);
    if (newHeadPos.x < 0) newHeadPos = newHeadPos.add(CANVAS_TOTAL_COLUMN_VECTOR);
    if (newHeadPos.y < 0) newHeadPos = newHeadPos.add(CANVAS_TOTAL_ROW_VECTOR);
    if (this.newBlock) {
      this.newBlock = false;
    } else {
      this.body.pop();
    }
    this.body.unshift(newHeadPos);
  }

  checkSelfCollision() {
    const head = this.body[0];
    return this.body.some((part, index) => index === 0 ? false : part.isEqual(head));
  }
}

const food = new Food();
const snake = new Snake();

function checkFoodEaten() {
  const snakeHead = snake.body[0];
  if (snakeHead.isEqual(food.pos)) {
    score++;
    if (score > 10) SNAKE_SPEED = 10;
    snake.newBlock = true;
    food.randomize(snake.body);
  }
}

function drawScore() {
  const fontSize = 20; //px
  const padding = 5; //px
  ctx.font = `${fontSize}px monospace`;
  ctx.fillStyle = "#EB5B00";
  const scoreString = `Eaten: ${score}`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText(scoreString, CANVAS_WIDTH - padding, 0 + padding);
}

let allowInput = false;
window.addEventListener('keydown', handleUserInput);

function handleUserInput(keyEvent) {
  if (!allowInput) return;
  if (snake.direction.isEqual(OPPOSITE_DIRECTION_KEY[keyEvent.keyCode])) return;
  switch (keyEvent.keyCode) {
    case ARROW_LEFT:
      snake.direction = 'l';
      break;
    case ARROW_UP:
      snake.direction = 'u';
      break;
    case ARROW_RIGHT:
      snake.direction = 'r';
      break;
    case ARROW_DOWN:
      snake.direction = 'd';
      break;
    case 65:
      snake.direction = 'l';
      break;
    case 87:
      snake.direction = 'u';
      break;
    case 68:
      snake.direction = 'r';
      break;
    case 83:
      snake.direction = 'd';
      break;
  }
  allowInput = false;
}

function drawFloor() {
  const col_primary = '#f5f5dc';
  const col_secondary = '#d0e0b0';
  for (let row = 0; row < CELL_NUMBER; row++) {
    if (row % 2 === 0) {
      for (let col = 0; col < CELL_NUMBER; col++) {
        if (col % 2 === 0) {
          ctx.fillStyle = col_primary;
        } else {
          ctx.fillStyle = col_secondary;
        }
        ctx.fillRect(row * CELL_SIZE, col * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    } else {
      for (let col = 0; col < CELL_NUMBER; col++) {
        if (col % 2 === 0) {
          ctx.fillStyle = col_secondary;
        } else {
          ctx.fillStyle = col_primary;
        }
        ctx.fillRect(row * CELL_SIZE, col * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}


function gameLoop(timeStamp) {
  // ------
  const TICK = 1000 / SNAKE_SPEED; // 100 ms per gameloop
  if (timeStamp - lastStepTime >= TICK) {
    // game logic
    allowInput = true;
    lastStepTime = timeStamp;
    snake.move();
    if (snake.checkSelfCollision()) { window.alert(`Eaten: ${score}`); window.location.reload(); return };
    checkFoodEaten();
  }
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawFloor();
  snake.draw();
  food.draw(timeStamp);
  drawScore();

  window.requestAnimationFrame(gameLoop);
}
window.requestAnimationFrame(gameLoop);
