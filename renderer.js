const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.6;
  canvas.height = window.innerHeight * 0.6;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let time = 0;
let playing = true;
let objects = [];
let selected = null;
let audios = [];
let dragging = false;

// Create object
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

// Keyframe interpolation (FIXED)
function getPosition(obj, t) {
  let kfs = obj.keyframes;

  if (kfs.length === 1) return kfs[0];

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

// Timeline sync with audio
function updateTimeline() {
  if (playing && audios.length > 0) {
    time = audios[0].currentTime;
  }
}

// Draw loop
function draw() {
  updateTimeline();

  if (playing && audios.length === 0) {
    time += 0.016;
  }

  const slider = document.getElementById("slider");
  slider.value = time;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  objects.forEach(obj => {
    let pos = getPosition(obj, time);

    if (obj.image) {
      ctx.drawImage(obj.image, pos.x, pos.y, obj.width, obj.height);
    } else {
      ctx.fillStyle = "#00ff88";
      ctx.fillRect(pos.x, pos.y, obj.width, obj.height);
    }

    if (obj === selected) {
      ctx.strokeStyle = "white";
      ctx.strokeRect(pos.x, pos.y, obj.width, obj.height);
    }
  });

  requestAnimationFrame(draw);
}

// Play / Pause
function play() {
  playing = true;
  audios.forEach(a => {
    a.currentTime = time;
    a.play();
  });
}

function pause() {
  playing = false;
  audios.forEach(a => a.pause());
}

// Timeline slider
document.getElementById("slider").addEventListener("input", e => {
  time = parseFloat(e.target.value);
  audios.forEach(a => a.currentTime = time);
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

// Mouse drag
canvas.addEventListener("mousedown", e => {
  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;

  selected = null;

  objects.forEach(obj => {
    let pos = getPosition(obj, time);

    if (
      x > pos.x && x < pos.x + obj.width &&
      y > pos.y && y < pos.y + obj.height
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

canvas.addEventListener("mouseup", () => dragging = false);

// Touch support
canvas.addEventListener("touchstart", e => {
  let rect = canvas.getBoundingClientRect();
  let t = e.touches[0];

  let x = t.clientX - rect.left;
  let y = t.clientY - rect.top;

  selected = null;

  objects.forEach(obj => {
    let pos = getPosition(obj, time);

    if (
      x > pos.x && x < pos.x + obj.width &&
      y > pos.y && y < pos.y + obj.height
    ) {
      selected = obj;
      dragging = true;
    }
  });
});

canvas.addEventListener("touchmove", e => {
  if (!dragging || !selected) return;

  let rect = canvas.getBoundingClientRect();
  let t = e.touches[0];

  selected.x = t.clientX - rect.left;
  selected.y = t.clientY - rect.top;
});

canvas.addEventListener("touchend", () => dragging = false);

// Image upload
document.getElementById("imgUpload").addEventListener("change", e => {
  let file = e.target.files[0];
  if (!file || !selected) return;

  let img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    selected.image = img;
  };
});

// Audio upload (MULTIPLE + timeline length)
document.getElementById("audioUpload").addEventListener("change", e => {
  let files = Array.from(e.target.files);

  files.forEach(file => {
    let a = new Audio(URL.createObjectURL(file));

    a.onloadedmetadata = () => {
      updateTimelineLength();
    };

    audios.push(a);
  });
});

// Timeline length based on audio
function updateTimelineLength() {
  let max = 5;

  audios.forEach(a => {
    if (a.duration > max) max = a.duration;
  });

  document.getElementById("slider").max = max;
}

// Start loop
draw();
