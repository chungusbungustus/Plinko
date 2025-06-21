const modeToggleElement = document.getElementById("mode-toggle");

modeToggleElement.addEventListener("click", () => {
    modeToggleElement.classList.toggle("active");
});

var canvas = document.getElementById("game");
var ctx = canvas.getContext("2d");



function render() {

}

function simulate() {

}

function update() {
    simulate();
    draw();
    requestAnimationFrame(update);
}

update();