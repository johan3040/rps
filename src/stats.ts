import { Entries, EntityType } from "./types";
import { ICONS } from "./utils";

const initialPositions = [
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];

const latestPositions: Record<EntityType, { x: number; y: number }> = {
  rock: { x: 0, y: 0 },
  paper: { x: 0, y: 0 },
  scissors: { x: 0, y: 0 },
};

const isAnimating: Record<EntityType, boolean> = {
  rock: false,
  paper: false,
  scissors: false,
};

let rock: HTMLParagraphElement;
let paper: HTMLParagraphElement;
let scissors: HTMLParagraphElement;

export const initializeStats = () => {
  rock = document.createElement("p");
  paper = document.createElement("p");
  scissors = document.createElement("p");
  const container = document.querySelector("#stats") as HTMLDivElement;

  rock.setAttribute("data-type", "rock");
  paper.setAttribute("data-type", "paper");
  scissors.setAttribute("data-type", "scissors");

  rock.innerHTML = `${ICONS.rock}`;
  paper.innerHTML = `${ICONS.paper}`;
  scissors.innerHTML = `${ICONS.scissors}`;

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  container.appendChild(rock);
  container.appendChild(paper);
  container.appendChild(scissors);

  setPositions();
};

const getElements = () => {
  return [rock, paper, scissors];
};

const setPositions = () => {
  const elements = getElements();
  console.log(elements);

  elements.forEach((element, i) => {
    const { x, y, height } = element.getBoundingClientRect();
    console.log({ height });
    initialPositions[i] = { x, y };
    console.log(x, y);
  });

  elements.forEach((element, i) => {
    element.style.position = "absolute";
    element.style.left = `${initialPositions[i].x}px`;
    element.style.top = `${initialPositions[i].y}px`;
  });

  elements.forEach((element) => {
    const { x, y } = element.getBoundingClientRect();
    latestPositions[element.getAttribute("data-type") as EntityType] = { x, y };
  });

  elements.forEach((element) => {
    element.classList.add("reveal");
  });
};

const animatePosition = (
  type: EntityType,
  element: HTMLElement,
  targetX: number,
  targetY: number,
  duration: number
) => {
  const startX = parseFloat(element.style.left) || 0;
  const startY = parseFloat(element.style.top) || 0;
  const startTime = performance.now();

  const animate = (currentTime: number) => {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const newX = startX + (targetX - startX) * progress;
    const newY = startY + (targetY - startY) * progress;

    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      if (
        latestPositions[type].x === targetX &&
        latestPositions[type].y === targetY
      ) {
        isAnimating[type] = false;
        return;
      } else {
        animatePosition(
          type,
          element,
          latestPositions[type].x,
          latestPositions[type].y,
          150
        );
      }
    }
  };

  requestAnimationFrame(animate);
};

const getElement = (type: EntityType) => {
  if (type === "rock") return rock;
  if (type === "paper") return paper;
  return scissors;
};

export const updateStats = (entries: Entries) => {
  const rockCount = entries.filter((entry) => entry.type === "rock").length;
  const paperCount = entries.filter((entry) => entry.type === "paper").length;
  const scissorsCount = entries.filter(
    (entry) => entry.type === "scissors"
  ).length;

  const stats: {
    type: EntityType;
    count: number;
  }[] = [
    { count: rockCount, type: "rock" },
    { count: paperCount, type: "paper" },
    { count: scissorsCount, type: "scissors" },
  ];
  stats.sort((a, b) => b.count - a.count);

  const [rock, paper, scissors] = getElements();

  rock.innerHTML = `${ICONS.rock} ${rockCount}`;
  paper.innerHTML = `${ICONS.paper} ${paperCount}`;
  scissors.innerHTML = `${ICONS.scissors} ${scissorsCount}`;

  stats.forEach((stat, i) => {
    const targetX = initialPositions[i].x;
    const targetY = initialPositions[i].y;

    if (isAnimating[stat.type]) {
      latestPositions[stat.type] = { x: targetX, y: targetY };
      return;
    }
    const element = getElement(stat.type);
    isAnimating[stat.type] = true;
    animatePosition(stat.type, element, targetX, targetY, 150);
  });
};
