const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

let time = 0;
let playing = true;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function draw() {
  if (playing) time += 0.016;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let t = (time % 2) / 2;

  let x = lerp(50, 300, t);
  let y = lerp(50, 300, t);

  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 50, 50);

  requestAnimationFrame(draw);
}

function play() {
  playing = true;
}

function pause() {
  playing = false;
}

draw();
