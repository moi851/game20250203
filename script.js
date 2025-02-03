// 캔버스 및 컨텍스트 초기화
var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var gameState = "start"; // 상태: start, play, pause, gameover
var keys = {};

var player;
var bullets = [];
var enemies = [];
var score = 0;

var lastShotTime = 0;
var shotInterval = 300; // 밀리초 단위, 총알 발사 간격

var lastEnemySpawn = Date.now();
var enemySpawnInterval = 1000; // 적 등장 간격 (밀리초)

// 게임 초기화 함수
function initGame() {
    player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 60,
        width: 30,
        height: 30,
        speed: 5,
        health: 3
    };
    bullets = [];
    enemies = [];
    score = 0;
    lastShotTime = 0;
    lastEnemySpawn = Date.now();
    gameState = "play";
}

// 충돌 판정 함수
function isColliding(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// 게임 오브젝트 업데이트 함수 (플레이 상태일 때 호출)
function updateGame() {
    // 플레이어 이동 업데이트
    if (keys[37]) { // 왼쪽
        player.x -= player.speed;
    }
    if (keys[39]) { // 오른쪽
        player.x += player.speed;
    }
    if (keys[38]) { // 위쪽
        player.y -= player.speed;
    }
    if (keys[40]) { // 아래쪽
        player.y += player.speed;
    }
    // 화면 경계 제한
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
    
    // 총알 발사 처리 (스페이스바)
    var currentTime = Date.now();
    if (keys[32] && currentTime - lastShotTime > shotInterval) {
        var bullet = {
            x: player.x + player.width / 2 - 2,
            y: player.y,
            width: 4,
            height: 10,
            speed: 8
        };
        bullets.push(bullet);
        lastShotTime = currentTime;
    }
    
    // 총알 업데이트
    for (var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bullets[i].speed;
        // 화면 상단 밖으로 나가면 제거
        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
        }
    }
    
    // 적 등장 처리
    if (currentTime - lastEnemySpawn > enemySpawnInterval) {
        var enemyWidth = 40;
        var enemyHeight = 40;
        var enemy = {
            x: Math.random() * (canvas.width - enemyWidth),
            y: -enemyHeight,
            width: enemyWidth,
            height: enemyHeight,
            speed: 2 + Math.random() * 1  // 약간의 빠르기 변동
        };
        enemies.push(enemy);
        lastEnemySpawn = currentTime;
    }
    
    // 적 업데이트
    for (var j = enemies.length - 1; j >= 0; j--) {
        enemies[j].y += enemies[j].speed;
        // 화면 하단을 벗어나면 제거
        if (enemies[j].y > canvas.height) {
            enemies.splice(j, 1);
        }
    }
    
    // 충돌 판정: 총알과 적
    for (var i = bullets.length - 1; i >= 0; i--) {
        for (var j = enemies.length - 1; j >= 0; j--) {
            if (isColliding(bullets[i], enemies[j])) {
                // 적 제거 및 총알 제거 후 점수 증가
                enemies.splice(j, 1);
                bullets.splice(i, 1);
                score += 10;
                break;
            }
        }
    }
    
    // 충돌 판정: 플레이어와 적
    for (var j = enemies.length - 1; j >= 0; j--) {
        if (isColliding(player, enemies[j])) {
            enemies.splice(j, 1);
            player.health -= 1;
            if (player.health <= 0) {
                gameState = "gameover";
            }
        }
    }
}

// 게임 그리기 함수
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameState === "start") {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("우주선 슈팅 게임", canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = "20px Arial";
        ctx.fillText("Enter 키를 눌러 시작", canvas.width / 2, canvas.height / 2);
    } else if (gameState === "play" || gameState === "pause") {
        // 플레이어 그리기
        ctx.fillStyle = "blue";
        ctx.fillRect(player.x, player.y, player.width, player.height);
        
        // 총알 그리기
        ctx.fillStyle = "yellow";
        for (var i = 0; i < bullets.length; i++) {
            ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].width, bullets[i].height);
        }
        
        // 적 그리기
        ctx.fillStyle = "red";
        for (var j = 0; j < enemies.length; j++) {
            ctx.fillRect(enemies[j].x, enemies[j].y, enemies[j].width, enemies[j].height);
        }
        
        // 점수와 체력 표시
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "left";
        ctx.fillText("Score: " + score, 10, 30);
        ctx.fillText("Health: " + player.health, 10, 60);
        
        if (gameState === "pause") {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.textAlign = "center";
            ctx.fillText("일시 정지", canvas.width / 2, canvas.height / 2);
        }
    } else if (gameState === "gameover") {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.textAlign = "center";
        ctx.fillText("게임 오버", canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = "20px Arial";
        ctx.fillText("최종 점수: " + score, canvas.width / 2, canvas.height / 2);
        ctx.fillText("Enter 키를 눌러 재시작", canvas.width / 2, canvas.height / 2 + 30);
    }
}

// 게임 루프 함수
function gameLoop() {
    // 게임이 진행 중이면 게임 시작 버튼 숨김, 아니면 표시
    if (gameState === "play") {
        if (startButton) { startButton.style.display = "none"; }
        updateGame();
    } else {
        if (startButton) { startButton.style.display = "block"; }
    }
    drawGame();
    requestAnimationFrame(gameLoop);
}

// 키 이벤트 처리
document.addEventListener("keydown", function(e) {
    keys[e.keyCode] = true;
    
    // Enter 키로 게임 시작 및 재시작
    if (e.keyCode === 13) {
        if (gameState === "start" || gameState === "gameover") {
            initGame();
        } else if (gameState === "pause") {
            gameState = "play";
        }
    }
    
    // P 키로 일시정지 토글
    if (e.keyCode === 80) {
        if (gameState === "play") {
            gameState = "pause";
        } else if (gameState === "pause") {
            gameState = "play";
        }
    }
});

document.addEventListener("keyup", function(e) {
    keys[e.keyCode] = false;
});

// 모바일 터치 이벤트 처리
function addTouchEvents(id, keyCode) {
    var btn = document.getElementById(id);
    if (btn) {
        btn.addEventListener("touchstart", function(e) {
            e.preventDefault();
            console.log("Touch start: " + id);
            keys[keyCode] = true;
        }, false);
        btn.addEventListener("touchend", function(e) {
            e.preventDefault();
            console.log("Touch end: " + id);
            keys[keyCode] = false;
        }, false);
        // 터치 취소 이벤트도 처리
        btn.addEventListener("touchcancel", function(e) {
            e.preventDefault();
            console.log("Touch cancel: " + id);
            keys[keyCode] = false;
        }, false);
        
        // 마우스 이벤트 처리 (데스크탑 및 마우스 클릭을 위한 처리)
        btn.addEventListener("mousedown", function(e) {
            e.preventDefault();
            console.log("Mouse down: " + id);
            keys[keyCode] = true;
        }, false);
        btn.addEventListener("mouseup", function(e) {
            e.preventDefault();
            console.log("Mouse up: " + id);
            keys[keyCode] = false;
        }, false);
        btn.addEventListener("mouseleave", function(e) {
            e.preventDefault();
            console.log("Mouse leave: " + id);
            keys[keyCode] = false;
        }, false);
    }
}

// 게임 시작 버튼 이벤트 처리
var startButton = document.getElementById("btnStart");
if (startButton) {
    startButton.addEventListener("click", function(e) {
        if (gameState === "start" || gameState === "gameover") {
            initGame();
        }
    }, false);
}

// 각 버튼에 대해 터치 이벤트 등록
addTouchEvents("btnUp", 38);    // 위쪽
addTouchEvents("btnDown", 40);  // 아래쪽
addTouchEvents("btnLeft", 37);  // 왼쪽
addTouchEvents("btnRight", 39); // 오른쪽
addTouchEvents("btnFire", 32);  // 총알 발사 (스페이스바)

// 게임 루프 시작
requestAnimationFrame(gameLoop);
