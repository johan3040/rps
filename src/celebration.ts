import { tsParticles } from "@tsparticles/engine";
import confetti from "canvas-confetti";

tsParticles.load({
  id: "tsparticles",
  options: {
    particles: {
      number: {
        value: 80,
      },
      color: {
        value: "#ff0000",
      },
      shape: {
        type: "circle",
      },
      opacity: {
        value: 0.5,
      },
      size: {
        value: 3,
      },
      move: {
        enable: true,
        speed: 6,
      },
    },
  },
});

const defaults = {
  spread: 360,
  ticks: 100,
  gravity: 0,
  decay: 0.94,
  startVelocity: 30,
};

function shoot(text: string) {
  confetti({
    ...defaults,
    particleCount: 30,
    scalar: 1.2,
    shapes: ["circle", "square"],
    colors: ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#fdff6a"],
  });
  const scalar = 2;
  const shape = confetti.shapeFromText({ text, scalar });
  confetti({
    ...defaults,
    particleCount: 20,
    scalar: 4,
    shapes: [shape],
  });
}

export const celebrate = (text: string) => {
  setTimeout(() => shoot(text), 0);
  setTimeout(() => shoot(text), 100);
  setTimeout(() => shoot(text), 200);
};
