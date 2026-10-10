const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const gameOverlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayDesc = document.getElementById('overlayDesc');
const startBtn = document.getElementById('startBtn');
const openGuideBtn = document.getElementById('openGuideBtn');
const guideModal = document.getElementById('guideModal');
const closeGuideBtn = document.getElementById('closeGuideBtn');
const closeGuideBtnBottom = document.getElementById('closeGuideBtnBottom');

// Tombol kontrol sentuh
const upBtn = document.getElementById('upBtn');
const downBtn = document.getElementById('downBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

const gridSize = 18;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 5, y: 5 };
let dx = 1;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameInterval = null;
let isPlaying = false;
let changeDirectionCalled = false;

highScoreEl.textContent = highScore;

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    dx = 1;
    dy = 0;
    score = 0;
    scoreEl.textContent = score;
    spawnFood();
}

function spawnFood() {
    food.x = Math.floor(Math.random() * tileCount);
    food.y = Math.floor(Math.random() * tileCount);
    // Pastikan makanan tidak muncul di badan ular
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) {
            spawnFood();
        }
    });
}

function startGame() {
    initGame();
    gameOverlay.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        gameOverlay.style.display = 'none';
    }, 300);
    isPlaying = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 110);
}

function gameOver() {
    clearInterval(gameInterval);
    isPlaying = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }

    overlayTitle.textContent = "GAME OVER";
    overlayDesc.innerHTML = `Skor Akhir Kamu: <span class="text-emerald-400 font-bold">${score}</span><br>Coba lagi untuk kalahkan rekor!`;
    startBtn.textContent = "MAIN LAGI";
    
    gameOverlay.style.display = 'flex';
    setTimeout(() => {
        gameOverlay.classList.remove('opacity-0', 'pointer-events-none');
    }, 10);
}

function gameLoop() {
    changeDirectionCalled = false;
    update();
    if (checkGameOver()) {
        gameOver();
        return;
    }
    draw();
}

function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    // Cek makan makanan
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        spawnFood();
    } else {
        snake.pop();
    }
}

function checkGameOver() {
    const head = snake[0];
    // Tabrak dinding
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        return true;
    }
    // Tabrak badan sendiri
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    return false;
}

function draw() {
    // Bersihkan canvas
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar grid tipis dekoratif
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Gambar Makanan (Neon Red/Pink)
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);

    // Gambar Ular (Neon Green)
    snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#10b981' : '#34d399';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = index === 0 ? 12 : 6;
        ctx.fillRect(part.x * gridSize + 1, part.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0; // Reset shadow
}

function changeDirection(newDx, newDy) {
    if (changeDirectionCalled || !isPlaying) return;
    // Mencegah ular berbalik arah 180 derajat langsung
    if (newDx === -dx && newDy === -dy) return;
    dx = newDx;
    dy = newDy;
    changeDirectionCalled = true;
}

// Event listener Keyboard (WASD & Panah)
window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            changeDirection(0, -1);
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            changeDirection(0, 1);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            changeDirection(-1, 0);
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            changeDirection(1, 0);
            break;
    }
});

// Event listener Touch Controls (Mobile)
upBtn.addEventListener('click', () => changeDirection(0, -1));
downBtn.addEventListener('click', () => changeDirection(0, 1));
leftBtn.addEventListener('click', () => changeDirection(-1, 0));
rightBtn.addEventListener('click', () => changeDirection(1, 0));

// Tombol Start / Ulang
startBtn.addEventListener('click', startGame);

// Modal Panduan APK
openGuideBtn.addEventListener('click', () => {
    guideModal.classList.remove('hidden');
});

closeGuideBtn.addEventListener('click', () => {
    guideModal.classList.add('hidden');
});

closeGuideBtnBottom.addEventListener('click', () => {
    guideModal.classList.add('hidden');
});

// Render tampilan awal
initGame();
draw();