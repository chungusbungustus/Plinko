const modeToggleElement = document.getElementById("mode-toggle");
const dropButton = document.getElementById("drop-ball")
const rowsOption = document.getElementById("rows")

modeToggleElement.addEventListener("click", () => {
    modeToggleElement.classList.toggle("active");
});

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const gravity = 0.3;
const friction = 0.8;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let rows = 8;

window.addEventListener("resize", () => {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
});

const clampNumber = (num, min, max) => {
  return Math.max(min, Math.min(num, max));
};

class ball {
    constructor(pos) {
        this.pos = pos
        this.radius = 120/rows;
        this.mass = this.radius;
        this.vX = (1 * Math.random()) - 0.5
        this.vY = 0
    }

    move() {
        this.pos[0] += this.vX;
        this.pos[1] += this.vY;
        this.vY += gravity;
        this.vX *= friction;

        if (this.pos[1] > (canvas.height*0.99)) {
            this.vY = 0;
            this.vX =0;
            this.pos[1] = canvas.height*0.99;
        };
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
        this.pos = pos
        this.radius = radius;
    }

    render() {
        ctx.fillStyle = "White";
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2);
        ctx.fill();
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
    ball.pos[1]-=ball.vY;
    ball.vY = 0;
}

let balls = [];
let pegs = [];

function generatePegs(rows) {
    //loops through the rows
    for (let a = 3; a != rows+3; a++) {
        //loops through the columns
        for (let b = 0; b < a; b++) {
            pegs.push(
                new peg(
                    [(canvas.width/2)-(((a/2)-0.5)*canvas.width*0.5/rows)+(b*0.5*canvas.width/rows),
                    ((canvas.height/rows)*(a-3)/1.5)+canvas.height*rows/50],
                    60/rows
                )
            );
        };
    };
};

generatePegs(8)

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    balls.forEach(ball => {
        ball.move();
        ball.render();
        pegs.forEach(peg => {
            if (ballCollisionCheck(ball, peg)) {
                collision(ball, peg);
            };
        });
    });
    pegs.forEach(peg => {
        peg.render();
    });
};

animate()


dropButton.addEventListener("click", () => {
    balls.push(
        new ball([canvas.width/2, 0])
    );
});

rowsOption.addEventListener("change", () => {
    rows = parseInt(rowsOption.options[rowsOption.selectedIndex].value);
    pegs = [];
    balls = [];
    
    generatePegs(rows);
});