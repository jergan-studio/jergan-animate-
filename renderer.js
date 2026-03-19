const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

let time = 0;
let playing = true;

let keyframes = [
  { time: 0, x: 50, y: 50 },
  { time: 2, x: 300, y: 300 }
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getPosition(t) {
  let k1 = keyframes[0];
  let k2 = keyframes[1];

  let progress = (t - k1.time) / (k2.time - k1.time);
  progress = Math.max(0, Math.min(1, progress));

  return {
    x: lerp(k1.x, k2.x, progress),
    y: lerp(k1.y, k2.y, progress)
  };
}

function draw() {
  if (playing) time += 0.016;

  document.getElementById("slider").value = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let pos = getPosition(time % 2);

  ctx.fillStyle = "#00ff88";
  ctx.fillRect(pos.x, pos.y, 80, 80);

  requestAnimationFrame(draw);
}

function play() {
  playing = true;
}

function pause() {
  playing = false;
}

document.getElementById("slider").addEventListener("input", (e) => {
  time = parseFloat(e.target.value);
});

function addKeyframe() {
  keyframes.push({
    time: time,
    x: Math.random() * 300,
    y: Math.random() * 300
  });
}

function addPreset() {
  keyframes = [
    { time: 0, x: 200, y: 0 },
    { time: 2, x: 200, y: 300 }
  ];
}

draw();
