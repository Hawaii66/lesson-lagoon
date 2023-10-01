export type Point = {
  x: number;
  y: number;
};

export const ZERO: Point = { x: 0, y: 0 } as const;

export const Multiply = (a: Point, b: Point): Point => {
  return {
    x: a.x * b.x,
    y: a.y * b.y,
  };
};

export const Add = (a: Point, b: Point): Point => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
};
