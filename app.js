const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 500;
canvas.height = 500;

let time = 0;
let playing = true;
let objects = [];
let selected = null;
let audio = null;

// Object structure
function createObject(x, y) {
  return {
    x, y,
    width: 80,
    height: 80,
    image: null,
    keyframes: [{ time: 0, x, y }]
  };
}

// Add object
function addObject() {
  let obj = createObject(100, 100);
  objects.push(obj);
  selected = obj;
}

// LERP
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Get interpolated position
function getPosition(obj, t) {
  let kfs = obj.keyframes;

  if (kfs.length < 2) return kfs[0];

  for (let i = 0; i < kfs.length - 1; i++) {
    let k1 = kfs[i];
    let k2 = kfs[i + 1];

    if (t >= k1.time && t <= k2.time) {
      let p = (t - k1.time) / (k2.time - k1.time);
      return {
        x: lerp(k1.x, k2.x, p),
        y: lerp(k1.y, k2.y, p)
      };
    }
  }

  return kfs[kfs.length - 1];
}

// Draw loop
function draw() {
  if (playing) time += 0.016;

  document.getElementById("slider").value = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  objects.forEach(obj => {
    let pos = getPosition(obj, time);

    if (obj.image) {
      ctx.drawImage(obj.image, pos.x, pos.y, obj.width, obj.height);
    } else {
      ctx.fillStyle = "#00ff88";
      ctx.fillRect(pos.x, pos.y, obj.width, obj.height);
    }
  });

  requestAnimationFrame(draw);
}

// Play / Pause
function play() {
  playing = true;
  if (audio) audio.play();
}

function pause() {
  playing = false;
  if (audio) audio.pause();
}

// Timeline slider
document.getElementById("slider").addEventListener("input", e => {
  time = parseFloat(e.target.value);
  if (audio) audio.currentTime = time;
});

// Add keyframe
function addKeyframe() {
  if (!selected) return;

  selected.keyframes.push({
    time: time,
    x: selected.x,
    y: selected.y
  });

  selected.keyframes.sort((a, b) => a.time - b.time);
}

// Drag system
let dragging = false;

canvas.addEventListener("mousedown", e => {
  let rect = canvas.getBoundingClientRect();
  let mx = e.clientX - rect.left;
  let my = e.clientY - rect.top;

  objects.forEach(obj => {
    let pos = getPosition(obj, time);

    if (
      mx > pos.x && mx < pos.x + obj.width &&
      my > pos.y && my < pos.y + obj.height
    ) {
      selected = obj;
      dragging = true;
    }
  });
});

canvas.addEventListener("mousemove", e => {
  if (!dragging || !selected) return;

  let rect = canvas.getBoundingClientRect();
  selected.x = e.clientX - rect.left;
  selected.y = e.clientY - rect.top;
});

canvas.addEventListener("mouseup", () => {
  dragging = false;
});

// Image upload
document.getElementById("imgUpload").addEventListener("change", e => {
  let file = e.target.files[0];
  let img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    if (selected) selected.image = img;
  };
});

// Audio upload
document.getElementById("audioUpload").addEventListener("change", e => {
  let file = e.target.files[0];
  audio = new Audio(URL.createObjectURL(file));
});

// Export frames (basic)
function exportFrames() {
  let frames = [];

  for (let t = 0; t < 5; t += 0.1) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach(obj => {
      let pos = getPosition(obj, t);
      ctx.fillRect(pos.x, pos.y, obj.width, obj.height);
    });

    frames.push(canvas.toDataURL());
  }

  console.log("Frames exported:", frames.length);
}

draw();
