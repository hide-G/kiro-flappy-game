class KiroFlappyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.kiro = { x: 50, y: 300, width: 40, height: 40, velocity: 0 };
        this.pipes = [];
        this.score = 0;
        this.gameRunning = true;
        this.gravity = 0.4;
        this.jumpPower = -9;
        this.pipeWidth = 60;
        this.basePipeGap = 150;
        this.pipeSpeed = 2;
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        this.canvas.addEventListener('click', () => this.jump());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        });
        this.gameLoop();
    }
    
    jump() {
        if (this.gameRunning) {
            this.kiro.velocity = this.jumpPower;
        }
    }
    
    getCurrentGap() {
        const elapsedTime = (Date.now() - this.startTime) / 1000;
        
        if (elapsedTime <= 10) {
            return this.basePipeGap * 3;
        } else if (elapsedTime <= 20) {
            return this.basePipeGap * 2;
        } else {
            return this.basePipeGap;
        }
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Kiroの物理演算
        this.kiro.velocity += this.gravity;
        this.kiro.y += this.kiro.velocity;
        
        // パイプの生成
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            const currentGap = this.getCurrentGap();
            const pipeHeight = Math.random() * (this.canvas.height - currentGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                topHeight: pipeHeight,
                bottomY: pipeHeight + currentGap,
                passed: false
            });
        }
        
        // パイプの移動と削除
        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= this.pipeSpeed;
            
            // スコア計算
            if (!pipe.passed && pipe.x + this.pipeWidth < this.kiro.x) {
                pipe.passed = true;
                this.score++;
                document.getElementById('score').textContent = this.score;
            }
            
            return pipe.x > -this.pipeWidth;
        });
        
        // 衝突判定
        this.checkCollisions();
    }
    
    checkCollisions() {
        // 地面と天井の衝突
        if (this.kiro.y <= 0 || this.kiro.y + this.kiro.height >= this.canvas.height) {
            this.gameOver();
            return;
        }
        
        // パイプとの衝突
        for (let pipe of this.pipes) {
            if (this.kiro.x < pipe.x + this.pipeWidth &&
                this.kiro.x + this.kiro.width > pipe.x) {
                if (this.kiro.y < pipe.topHeight ||
                    this.kiro.y + this.kiro.height > pipe.bottomY) {
                    this.gameOver();
                    return;
                }
            }
        }
    }
    
    draw() {
        // 背景をクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Kiroを描画
        this.ctx.font = '40px Arial';
        this.ctx.fillText('👻', this.kiro.x, this.kiro.y + this.kiro.height);
        
        // パイプを描画
        this.ctx.fillStyle = '#2c2c54';
        for (let pipe of this.pipes) {
            // 上のパイプ
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // 下のパイプ
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

function restartGame() {
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').textContent = '0';
    new KiroFlappyGame();
}

function shareOnX() {
    const score = document.getElementById('finalScore').textContent;
    const gameUrl = window.location.href;
    const text = `Kiro Flappy Gameで${score}点を獲得しました！ ${gameUrl} #Kiro #BuildwithKiro`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
}

// ゲーム開始
new KiroFlappyGame();
