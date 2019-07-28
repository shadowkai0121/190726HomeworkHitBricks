/*
    todo:
        攻擊功能 (反彈)
        設置磚塊
        設置敵人
*/

// 複製物件
function clone(source) {
    if (source == null || typeof (source) != 'object') return null;

    let target = new Object();
    for (let attr in source) {
        if (typeof (source[attr]) != 'object') {
            target[attr] = source[attr];
        } else {
            target[attr] = clone(source[attr]);
        }
    }

    return target;
}


canvas.width = 640;
canvas.height = 480;

let ctx = canvas.getContext('2d'),
    direction = ["bottom", "left", "right", "top"];

// 玩家類別
function Player() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.dx = 4;
    this.dy = 4;
    this.direction = direction[parseInt(Math.random() * 4)];
    this.heath = 100;
}

Player.prototype = {
    // 物件移動的方法
    move: function () {
        switch (this.direction) {
            case "right":
                this.x += this.dx;
                if (this.x >= canvas.width - this.avatarImg.width) {
                    this.x = canvas.width - this.avatarImg.width;
                }
                break;
            case "left":
                this.x -= this.dx;
                if (this.x <= 0) {
                    this.x = 0;
                }
                break;
            case "top":
                this.y -= this.dy;
                if (this.y <= 0) {
                    this.y = 0;
                }
                break;
            case "bottom":
                this.y += this.dy;
                if (this.y >= canvas.height - this.avatarImg.height) {
                    this.y = canvas.height - this.avatarImg.height;
                }
                break;
        }

    },
}

// 繪圖功能
function Draw(scale = 1, width = 32, height = 32) {
    // 繪圖縮放比例
    this.scale = scale;
    // 人物大小 32*32
    this.avatarImg = {
        x: 0,
        y: 0,
        width: width,
        height: height,
    }
    // 動作圖移動距離
    this.actionX = width;
    this.actionY = height;
}

Draw.prototype = {
    draw: function () {
        // 取得人物對應的面向
        this.avatarImg.y = this.avatarImg.width * direction.indexOf(this.direction);
        this.show();
    },
    // 人物動作動畫
    action: function (obj) {
        obj.avatarImg.x += obj.actionX;

        if (obj.avatarImg.x >= obj.avatarImg.width * 2 || obj.avatarImg.x <= 0) {
            obj.actionX *= -1;
        }

        setTimeout(obj.action, 1000 / 3, obj);
    },
    show: function () {
        ctx.drawImage(this.img,
            // 人物擷取範圍
            this.avatarImg.x, this.avatarImg.y,
            this.avatarImg.width, this.avatarImg.height,
            // 人物在地圖的位置
            this.x, this.y,
            // 人物在地圖的大小
            this.avatarImg.width * this.scale, this.avatarImg.height * this.scale);
    },
    // 顯示一次特效
    specialEffect: function (obj) {
        // 取得下一張圖位置
        let col = obj.health % 3,
            row = Math.floor(obj.health / 3),
            timeout = 1000 / 60;

        // 動態調整裁切範圍
        obj.avatarImg.x = obj.avatarImg.width * col;
        obj.avatarImg.y = obj.avatarImg.height * row;

        // 計算目前執行次數
        obj.health++;
        if (obj.health > 9) {
            // 標記執行完成
            obj.isDelete = true;
            return;
        }

        setTimeout(obj.specialEffect, timeout, obj);
    }
}

// 戰士職業類別
function Warrior() {
    Player.call(this);
    this.x = 50
    this.y = canvas.height / 2;
    this.name = "Warrior";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    this.action(this);
}

Warrior.prototype = Object.create(Player.prototype);

Object.assign(Warrior.prototype, clone(new Draw));

// 玩家技能
Warrior.prototype.piercing = function () {
    let piercing = new Piercing(this.x, this.y, this.direction);
    piercing.specialEffect(piercing);
    // 物件存入清單內管理
    skillObj.push(piercing);
}

function Piercing(x, y, direct) {
    // 取得物件起始位置
    switch (direct) {
        case "right":
            this.x = x + 32;
            this.y = y - this.avatarImg.height * this.scale / 2 + 16;
            break;
        case "left":
            this.x = x - this.avatarImg.width * this.scale;
            this.y = y - this.avatarImg.height * this.scale / 2 + 16;
            break;
        case "top":
            this.x = x - this.avatarImg.width * this.scale / 2 + 16;
            this.y = y - this.avatarImg.height * this.scale;
            break;
        case "bottom":
            this.x = x - this.avatarImg.width * this.scale / 2 + 16;
            this.y = y + 32;
            break;
    }
    // 存活標記
    this.isDelete = false;
    this.direction = direct;
    this.img = new Image();
    // 載入對應方向的圖片
    this.img.src = "img/piercing_" + direct + ".png";
    this.health = 0;
    this.specialEffect(this);
}

Object.assign(Piercing.prototype, clone(new Draw(0.5, 320, 240)));

// 背景圖片
let bgReady = false,
    bgImg = new Image();
bgImg.src = "img/bg.png";
bgImg.onload = function () {
    ctx.drawImage(bgImg, 0, 0);
    bgReady = true;
}

// 蒐集技能物件
let skillObj = [];
// 產生玩家物件
let player = new Warrior();

// 儲存畫面更新的物件
let mainReq = {};
// 畫面更新
function update() {
    if (bgReady) {
        reset()
        ctx.drawImage(bgImg, 0, 0);
        player.draw();
        for (let o of skillObj) {
            // 移除執行完成的物件
            if (o.isDelete) {
                skillObj = skillObj.filter((item) => {
                    return item != o;
                });
                continue;
            }
            o.show();
        }
    }

    mainReq.update = requestAnimationFrame(update);
}
update();

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


// 使用者功能
let keysdown = [];
document.onkeydown = function (e) {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    keysdown[e.keyCode] = true;
}

document.onkeyup = function (e) {
    delete keysdown[e.keyCode];
}

function start() {
    update();
    main();
}

function pause() {
    for (let request in mainReq) {
        cancelAnimationFrame(mainReq[request]);
    }
}

function userReset() {
    pause();
    reset();
    ctx.drawImage(bgImg, 0, 0);
}

// 技能按鍵延遲偵測
function casting() {

    if (90 in keysdown) {
        player.piercing();
    }


    mainReq.casting = setTimeout(casting, 1000 / 8);
}
casting();


function main() {
    if (37 in keysdown) {
        player.direction = "left";
        player.move();
    }
    if (38 in keysdown) {
        player.direction = "top";
        player.move();
    }
    if (39 in keysdown) {
        player.direction = "right";
        player.move();
    }
    if (40 in keysdown) {
        player.direction = "bottom";
        player.move();
    }

    mainReq.main = requestAnimationFrame(main);
}
main();