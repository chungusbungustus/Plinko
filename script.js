const modeToggleElement = document.getElementById("mode-toggle");
const betInfo = document.getElementById("bet-info");
const dropButton = document.getElementById("drop-ball");
const rowsOption = document.getElementById("rows");
const riskOption = document.getElementById("risk");
const betAmountOption = document.getElementById("bet-amount");
const moneyCounter = document.getElementById("money-amount");
const betRateContainer = document.getElementById("bet-rate-container");
const betRate = document.getElementById("bet-rate");

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gravity = 0.003*canvas.height;
const friction = 0.8;

let dropBallIntervel = null;

let money = 200;
let autoBetting = false;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let rows = 8;

const clampNumber = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

class ball {
    constructor(pos) {
        this.pos = pos;
        this.radius = 0.15*canvas.width/rows;
        this.mass = this.radius;
        this.vX = ((30 * Math.random()) - 20)/rows;
        this.vY = 0;
    }

    move() {
        this.pos[0] += this.vX;
        this.pos[1] += this.vY;
        this.vY += gravity;
        this.vX *= friction;
    }

    render() {
        ctx.fillStyle = "Red";
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class peg {
    constructor(pos, radius) {
        this.pos = pos;
        this.radius = (canvas.width)/(rows*16);
        this.outerRadiusTransparency = 0
        this.offet = [0,0]
    }

    render() {
        ctx.fillStyle = "White";
        ctx.beginPath();
        ctx.arc(this.pos[0] + this.offet[0], this.pos[1] + this.offet[1], this.radius, 0, Math.PI * 2);
        ctx.fill();

        this.offet[0] *= 0.8;
        this.offet[1] *= 0.8;

        this.outerRadiusTransparency *= 0.8;

        ctx.globalAlpha = this.outerRadiusTransparency;
        ctx.beginPath();
        ctx.arc(this.pos[0] + this.offet[0], this.pos[1] + this.offet[1], this.radius*1.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class block {
    constructor(pos, size, color, text) {
        this.pos = pos;
        this.size = size;
        this.color = color;
        this.text = text;
        this.yOffset = 0;
    }

    render() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.roundRect(this.pos[0], this.pos[1] + this.yOffset, this.size[0], this.size[1], Math.min((rows*this.size[0])/50, 0.2*this.size[0]));
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.font = (this.size[0] * 0.5).toString + "px Trebuchet MS";
        ctx.fillText(this.text + "x", this.pos[0]+(this.size[0] * 0.5), this.pos[1]+(this.size[0] * 0.6)+this.yOffset);
    }
}

function ballCollisionCheck(ball, peg) {
    let dx = ball.pos[0] - peg.pos[0];
    let dy = ball.pos[1] - peg.pos[1];

    return (dx * dx + dy * dy) < (ball.radius + peg.radius) * (ball.radius + peg.radius);
}

function collision(ball, peg) {
    let dx = ball.pos[0] - peg.pos[0];
    let dy = ball.pos[1] - peg.pos[1];

    ball.vX += clampNumber(dx,-0.2*ball.radius,0.2 * ball.radius);
    ball.pos[1]-=ball.vY*0.9;
    ball.vY = 0;

    peg.offet = [-dx*0.3,-dy*0.3];
}

let balls = [];
let pegs = [];
let blocks = [];

let block_N = {
    l: {
        8: [5.6, 2.1, 1.1, 1, 0.5, 1, 1.1, 2.1, 5.6],
        9: [5.6, 2, 1.6, 1, 0.7, 0.7, 1, 1.6, 2, 5.6],
        10: [8.9, 3, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 3, 8.9],
        11: [8.4, 3, 1.9, 1.3, 1, 0.7, 0.7, 1, 1.3, 1.9, 3, 8.4],
        12: [10, 3, 1.6, 1.4, 1.1, 1, 0.5, 1, 1.1, 1.4, 1.6, 3, 10],
        13: [12.1, 4, 3, 1.9, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.9, 3, 4, 12.1],
        14: [7.1, 4, 1.9, 1.4, 1.3, 1.1, 1, 0.5, 1, 1.1, 1.3, 1.4, 1.9, 4, 7.1],
        15: [15, 8, 3, 2, 1.5, 1.1, 1, 0.7, 0.7, 1, 1.1, 1.5, 2, 3, 8, 15],
        16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
        30: [1000, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 1000]
    },
    m: {
        8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
        9: [18, 4, 1.7, 0.9, 0.5, 0.5, 0.9, 1.7, 4, 18],
        10: [22, 5, 2, 1.4, 0.6, 0.4, 0.6, 1.4, 2, 5, 22],
        11: [24, 6, 3, 1.8, 0.7, 0.5, 0.5, 0.7, 1.8, 3, 6, 24],
        12: [33, 11, 4, 2, 1.1, 0.6, 0.3, 0.6, 1.1, 2, 4, 11, 33],
        13: [43, 13, 6, 3, 1.3, 0.7, 0.4, 0.4, 0.7, 1.3, 3, 6, 13, 43],
        14: [58, 15, 7, 4, 1.9, 1, 0.5, 0.2, 0.5, 1, 1.9, 4, 7, 15, 58],
        15: [88, 18, 11, 5, 3, 1.3, 0.5, 0.3, 0.3, 0.5, 1.3, 3, 5, 11, 18, 88],
        16: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
        30: [1000, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 1000]
    },
    h: {
        8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
        9: [43, 7, 2, 0.6, 0.2, 0.2, 0.6, 2, 7, 43],
        10: [76, 10, 3, 0.9, 0.3, 0.2, 0.3, 0.9, 3, 10, 76],
        11: [120, 14, 5.2, 1.4, 0.4, 0.2, 0.2, 0.4, 1.4, 5.2, 14, 120],
        12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
        13: [260, 37, 11, 4, 1, 0.2, 0.2, 0.2, 0.2, 1, 4, 11, 37, 260],
        14: [420, 56, 18, 5, 1.9, 0.3, 0.2, 0.2, 0.2, 0.3, 1.9, 5, 18, 56, 420],
        15: [620, 83, 27, 8, 3, 0.5, 0.2, 0.2, 0.2, 0.2, 0.5, 3, 8, 27, 83, 620],
        16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
        30: [1000, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 1000]
    }
};

function interpolateColors(c1, c2, p) {
    function rgb(c) {
        const hex = c.replace("#", "")
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16),
        }
    }  

    function hex(n) {
        n = n.toString(16);
        return (n.length == 1) ? "0" + n : n;
    }

    const a = rgb(c1);
    const c = rgb(c2);

    const r = Math.ceil(a.r * p + c.r * (1 - p));
    const g = Math.ceil(a.g * p + c.g * (1 - p));
    const b = Math.ceil(a.b * p + c.b * (1 - p));

    return "#" + hex(r) + hex(g) + hex(b);
}

function generatePegs(rows) {
    //loops through the rows
    for (let a = 3; a != rows+3; a++) {
        //loops through the columns
        for (let b = 0; b != a; b++) {
            pegs.push(
                new peg(
                    [(canvas.width/2)-(((a/2)-0.5)*canvas.width*0.5/rows)+(b*0.5*canvas.width/rows),
                    ((canvas.height/rows)*(a-3)/1.5)+canvas.height*(rows/(rows*50))+(canvas.height*0.2)],
                )
            );
            
            //generates the blocks
            if (a == rows+2 && b < a-1) {
                let color = interpolateColors("#FF003F","#FFC100",clampNumber(Math.abs((b - a/2)+1)/(a/2.5), 0, 1));
                
                blocks.push(
                    new block(
                        [(canvas.width/2)-(((a/2)-0.5)*canvas.width*0.49/rows)+(b*0.5*canvas.width/rows),
                        ((canvas.height/rows)*(a-3)/1.5)+canvas.height*(rows/(rows*50))+(canvas.height*0.2)+(0.25*canvas.width/rows)],
                        [(0.45*canvas.width/rows),(0.45*canvas.width/rows)],
                        color,
                        block_N[riskOption.options[riskOption.selectedIndex].value][rowsOption.options[rowsOption.selectedIndex].value][b]
                    )
                );
            };
        };
    };
};

function disableOptions() {
    riskOption.disabled = true;
    rowsOption.disabled = true;
    modeToggleElement.disabled = true;
    betAmountOption.disabled = true;

    document.querySelectorAll("#bet-info > div").forEach(p => {
        p.style.opacity = "50%";
    });
}

function enableOptions() {
    riskOption.disabled = false;
    rowsOption.disabled = false;
    modeToggleElement.disabled = false;
    betAmountOption.disabled = false;

    document.querySelectorAll("#bet-info > div").forEach(p => {
        p.style.opacity = "100%";
    });
}

function blockCollisionCheck(ball, block) {
    return (ball.pos[0] < block.pos[0] + block.size[0] && ball.pos[0] > block.pos[0])
}

function updateMoneyText() {
    moneyCounter.innerText = Math.floor(money*10)/10;
}

generatePegs(8);

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        ball.move();
        ball.render();
        pegs.forEach(peg => {
            if (ballCollisionCheck(ball, peg)) {
                collision(ball, peg);
                peg.outerRadiusTransparency = 0.8;
            };
        });


        if (ball.pos[1] > ((canvas.height/rows)*(rows)/1.5)+canvas.height*(rows/(rows*50))+(canvas.height*0.2)) {
            blocks.forEach(block => {
                if (blockCollisionCheck(ball, block)) {
                    money += betAmountOption.value * block.text;
                    updateMoneyText();
                    block.yOffset = block.size[1]*0.5
                };
            });
            balls.splice(balls.indexOf(ball), 1);
        };
    });
    if (balls.length == 0) {
        enableOptions();
    };
    pegs.forEach(peg => {
        peg.render();
    });
    blocks.forEach(block => {
        block.render();
        block.yOffset *= 0.8;
    });
};

animate()

function dropBall() {
    if (money >= betAmountOption.value) {
        balls.push(
            new ball([canvas.width/2, 0])
        );

        money -= betAmountOption.value;
        updateMoneyText();
    }
}

function generateRows() {
    rows = parseInt(rowsOption.options[rowsOption.selectedIndex].value);
    pegs = [];
    balls = [];
    blocks = [];
    
    generatePegs(rows);
}

modeToggleElement.addEventListener("click", () => {
    modeToggleElement.classList.toggle("active");

    if (modeToggleElement.classList.contains("active")) {
        betRateContainer.style.visibility = "visible";
        dropButton.childNodes[1].textContent = "Start Autobet";
    } else {
        betRateContainer.style.visibility = "hidden";
        dropButton.childNodes[1].textContent = "Drop Ball";
    }
});

dropButton.addEventListener("click", () => {
    if (modeToggleElement.classList.contains("active")) {
        dropButton.classList.toggle("auto-bet");
        
        if (dropButton.classList.contains("auto-bet")) {
            dropBall();
            dropBallIntervel = setInterval(dropBall, betRate.value * 1000);
            dropButton.childNodes[1].textContent = "Stop Autobet";
        } else {
            clearInterval(dropBallIntervel);
            dropButton.childNodes[1].textContent = "Start Autobet";
        };
    } else {
        dropBall()
    };
    
    disableOptions();
});

rowsOption.addEventListener("change", generateRows);
riskOption.addEventListener("change", generateRows);

window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
});