import "./style.css";
import { celebrate } from "./celebration";
import { EntityType, Entity, Entries } from "./types";
import { ICONS } from "./utils";
import { initializeStats, updateStats } from "./stats";

const settings = {
  size: 0,
  get fontSize() {
    return this.size * 0.8;
  },
  numberOfEntities: 0,
};
const entries: Entries = [];

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const updatePosition = () => {
  entries.forEach((entry) => {
    // Update position based on velocity
    entry.position.x += entry.velocity.x;
    entry.position.y += entry.velocity.y;

    // Check for collision with canvas boundaries and reverse direction if needed
    if (
      entry.position.x <= 0 ||
      entry.position.x >= canvas.width - settings.size
    ) {
      entry.velocity.x *= -1;
    }
    if (
      entry.position.y <= 0 ||
      entry.position.y >= canvas.height - settings.size
    ) {
      entry.velocity.y *= -1;
    }
  });
};

const checkCollision = () => {
  // Create spatial partitioning grid
  const grid: Map<string, Entity[]> = new Map();
  const cellSize = settings.size * 2; // Adjust based on your needs

  // Place entries in grid cells
  entries.forEach((entry) => {
    const cellX = Math.floor(entry.position.x / cellSize);
    const cellY = Math.floor(entry.position.y / cellSize);
    const key = `${cellX},${cellY}`;

    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key)!.push(entry);
  });

  // Process collisions within each cell and neighboring cells
  grid.forEach((cellEntries, key) => {
    const [x, y] = key.split(",").map(Number);

    // Get neighboring cells
    const neighborCells = [
      grid.get(`${x - 1},${y - 1}`),
      grid.get(`${x},${y - 1}`),
      grid.get(`${x + 1},${y - 1}`),
      grid.get(`${x - 1},${y}`),
      grid.get(`${x},${y}`),
      grid.get(`${x + 1},${y}`),
      grid.get(`${x - 1},${y + 1}`),
      grid.get(`${x},${y + 1}`),
      grid.get(`${x + 1},${y + 1}`),
    ].filter(Boolean) as Entity[][];

    // Check collisions only with entries in same or neighboring cells
    const nearbyEntries = [
      ...new Set([...cellEntries, ...neighborCells.flat()]),
    ];

    // Create collision pairs to process
    const collisionPairs: [Entity, Entity][] = [];

    for (let i = 0; i < nearbyEntries.length; i++) {
      for (let j = i + 1; j < nearbyEntries.length; j++) {
        const entry = nearbyEntries[i];
        const otherEntry = nearbyEntries[j];

        if (entry.type === otherEntry.type) continue;

        if (
          entry.position.x < otherEntry.position.x + settings.size &&
          entry.position.x + settings.size > otherEntry.position.x &&
          entry.position.y < otherEntry.position.y + settings.size &&
          entry.position.y + settings.size > otherEntry.position.y
        ) {
          collisionPairs.push([entry, otherEntry]);
        }
      }
    }

    // Process all collisions at once
    collisionPairs.forEach(([entry, otherEntry]) => {
      if (entry.type === "rock" && otherEntry.type === "scissors") {
        otherEntry.type = "rock";
      } else if (entry.type === "paper" && otherEntry.type === "rock") {
        otherEntry.type = "paper";
      } else if (entry.type === "scissors" && otherEntry.type === "paper") {
        otherEntry.type = "scissors";
      }
    });
  });
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const checkIfGameIsOver = () => {
  const firstType = entries[0].type;
  return entries.every((entry) => entry.type === firstType);
};

const run = () => {
  // const startTime = performance.now();
  clearCanvas();
  const gameOver = checkIfGameIsOver();
  updatePosition();
  checkCollision();
  updateStats(entries);

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  entries.forEach((entry) => {
    // ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.font = `${settings.fontSize}px sans-serif`;
    ctx.fillText(
      ICONS[entry.type],
      entry.position.x,
      entry.position.y + settings.size / 2 + 8
    );
    // ctx.fillRect(entry.position.x, entry.position.y, settings.size, settings.size);
  });

  // const endTime = performance.now();
  // console.log(endTime - startTime);

  if (!gameOver) {
    requestAnimationFrame(run);
  } else {
    const title = document.querySelector("h2") as HTMLHeadingElement;
    title.innerText = `${entries[0].type.toUpperCase()} WINS 🎆`;
    const container = document.querySelector(
      "#gameOverContainer"
    ) as HTMLDivElement;
    container.style.display = "flex";
    celebrate(ICONS[entries[0].type]);

    document
      .querySelector("#gameOverContainer button")
      ?.addEventListener("click", initialize);

    document.getElementById("home")?.addEventListener("click", showStartScreen);
  }
};

const getRandomValue = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const getStartPositionForEntity = (type: EntityType): [number, number] => {
  switch (type) {
    case "rock":
      return [
        getRandomValue(0, canvas.width * 0.33),
        getRandomValue(canvas.height / 2, canvas.height - settings.size),
      ];
    case "paper":
      return [
        getRandomValue(canvas.width * 0.33, canvas.width * 0.66),
        getRandomValue(0, canvas.height * 0.2),
      ];
    case "scissors":
      return [
        getRandomValue(canvas.width * 0.66, canvas.width - settings.size),
        getRandomValue(canvas.height / 2, canvas.height - settings.size),
      ];
  }
};

const initialize = () => {
  // Fill the entries with correct number of entities
  initializeStats();
  const gameOverContainer = document.querySelector(
    "#gameOverContainer"
  ) as HTMLDivElement;
  gameOverContainer.style.display = "none";

  document
    .querySelector("#gameOverContainer button")
    ?.removeEventListener("click", initialize);

  // Clear entries
  while (entries.length) {
    entries.pop();
  }

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < settings.numberOfEntities; j++) {
      const initialSpeed = 1 + Math.random();
      const type = i === 0 ? "rock" : i === 1 ? "paper" : "scissors";
      const [x, y] = getStartPositionForEntity(type);
      entries.push({
        type,
        position: {
          x,
          y,
        },
        velocity: {
          x: initialSpeed * (Math.random() > 0.5 ? 1 : -1),
          y: initialSpeed * (Math.random() > 0.5 ? 1 : -1),
        },
      });
    }
  }
  run();
};

const calculateSize = (numberOfEntities: number): number => {
  const minSize = 5;
  const maxSize = 35;
  const maxEntities = 2000;
  const minEntities = 3;

  // Exponential decay formula
  const scale = (numberOfEntities - minEntities) / (maxEntities - minEntities);
  return Math.max(minSize, maxSize * Math.exp(-scale * 4));
};

const start = () => {
  const container = document.querySelector("#playContainer") as HTMLDivElement;
  container.style.display = "none";
  document.getElementById("startBtn")?.removeEventListener("click", start);
  const rangeValue = document.querySelector("span") as HTMLSpanElement;
  settings.numberOfEntities = parseInt(rangeValue.innerText);
  settings.size = calculateSize(settings.numberOfEntities);
  console.log(window.innerWidth, window.outerWidth);
  initialize();
};

const showStartScreen = () => {
  (document.querySelector(".gameContainer") as HTMLDivElement)!.style.display =
    "flex";
  (document.querySelector("#playContainer") as HTMLDivElement)!.style.display =
    "flex";
  (document.querySelector(
    "#gameOverContainer"
  ) as HTMLDivElement)!.style.display = "none";

  document
    .getElementById("home")
    ?.removeEventListener("click", showStartScreen);

  const range = document.querySelector("input") as HTMLInputElement;
  const rangeValue = document.querySelector("span") as HTMLSpanElement;

  rangeValue.innerText = range.value;
  range.addEventListener("input", () => {
    rangeValue.innerText = range.value;
  });

  document.getElementById("startBtn")?.addEventListener("click", start);
};

window.addEventListener("load", () => {
  canvas = document.getElementById("canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

  const width = Math.min(window.innerWidth, 1200) - 20;
  const height = Math.min(window.innerHeight, 580);
  canvas.width = width;
  canvas.height = height;

  if (!ctx) {
    console.error("No canvas context...");
  } else {
    showStartScreen();
  }
});
