const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highEl = document.getElementById('high');
const speedEl = document.getElementById('speed');
const startBtn = document.getElementById('start');
const pauseBtn = document.getElementById('pause');

const gridSize = 20; 
const tile = canvas.width / gridSize;

let snake, dir, food, score, highscore, gameInterval, speed, paused;

function randPos(){
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize)
  };
}

function init(){
  snake = [ {x:9,y:9}, {x:8,y:9}, {x:7,y:9} ];
  dir = {x:1, y:0};
  food = placeFood();
  score = 0;
  speed = 8;
  paused = false;

  scoreEl.textContent = score;
  speedEl.textContent = speed;

  highscore = Number(localStorage.getItem('snake_high') || 0);
  highEl.textContent = highscore;

  stopLoop();
  startLoop();
}

function placeFood(){
  let p;
  while(true){
    p = randPos();
    if(!snake.some(s => s.x === p.x && s.y === p.y)) break;
  }
  return p;
}

function draw(){
  ctx.fillStyle = '#071026';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.02)';
  for(let i=0;i<=gridSize;i++){
    ctx.beginPath(); ctx.moveTo(i*tile,0); ctx.lineTo(i*tile,canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*tile); ctx.lineTo(canvas.width,i*tile); ctx.stroke();
  }

  ctx.fillStyle = '#ff6363';
  roundRect(ctx, food.x*tile+3, food.y*tile+3, tile-6, tile-6, 6, true);

  for(let i=0;i<snake.length;i++){
    const s = snake[i];
    ctx.fillStyle = i===0 ? '#29d07b' : '#1fb06a';
    roundRect(ctx, s.x*tile+1, s.y*tile+1, tile-2, tile-2, 6, true);
  }
}

function roundRect(ctx, x, y, w, h, r, fill){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
  if(fill) ctx.fill(); else ctx.stroke();
}

function step(){
  if(paused) return;

  const head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  if(head.x < 0) head.x = gridSize-1;
  if(head.x >= gridSize) head.x = 0;
  if(head.y < 0) head.y = gridSize-1;
  if(head.y >= gridSize) head.y = 0;

  if(snake.some(s => s.x===head.x && s.y===head.y)){
    gameOver();
    return;
  }

  snake.unshift(head);

  if(head.x === food.x && head.y === food.y){
    score += 10;
    scoreEl.textContent = score;
    food = placeFood();

    if(score % 50 === 0){
      speed = Math.min(20, speed + 1);
      restartLoop();
    }

  } else {
    snake.pop();
  }

  draw();
}

function gameOver(){
  stopLoop();
  paused = true;

  if(score > highscore){
    localStorage.setItem('snake_high', score);
    highEl.textContent = score;
  }

  setTimeout(() => {
    if(confirm('Game Over! Skor: ' + score + '\nMulai ulang?')){
      init();
    }
  }, 100);
}

function startLoop(){
  stopLoop();
  gameInterval = setInterval(step, 1000 / speed);
}

function restartLoop(){
  startLoop();
  speedEl.textContent = speed;
}

function stopLoop(){
  if(gameInterval) clearInterval(gameInterval);
  gameInterval = null;
}

window.addEventListener('keydown', e => {
  const k = e.key;

  if(['ArrowUp','w','W'].includes(k) && dir.y !== 1)
    dir = {x:0, y:-1};

  if(['ArrowDown','s','S'].includes(k) && dir.y !== -1)
    dir = {x:0, y:1};

  if(['ArrowLeft','a','A'].includes(k) && dir.x !== 1)
    dir = {x:-1, y:0};

  if(['ArrowRight','d','D'].includes(k) && dir.x !== -1)
    dir = {x:1, y:0};

  if(k === ' ')
    paused = !paused;
});

startBtn.addEventListener('click', () => init());
pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? 'Lanjut' : 'Jeda';
});

canvas.addEventListener('click', ()=>canvas.focus());

init();
