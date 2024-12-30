export type Position = {
  x: number;
  y: number;
};
export type EntityType = "rock" | "paper" | "scissors";

export type Entity = {
  type: EntityType;
  position: Position;
  velocity: Position;
};

export type Entries = Entity[];
