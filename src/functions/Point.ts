export type Point = {
  x: number;
  y: number;
};

export const ZERO: Point = { x: 0, y: 0 } as const;

export const NewPoint = (x: number, y: number): Point => ({ x, y });

export const Multiply = (a: Point, b: Point): Point => {
  return {
    x: a.x * b.x,
    y: a.y * b.y,
  };
};

export const Scale = (a: Point, b: number) => {
  return NewPoint(a.x * b, a.y * b);
};

export const Add = (a: Point, b: Point): Point => {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
  };
};

export const Subtract = (a: Point, b: Point): Point => {
  return Add(a, { x: -b.x, y: -b.y });
};

export const Divide = (a: Point, b: number): Point => {
  if (b === 0) {
    alert("Cant divide by zero");
    throw new Error("Cant divide by zero");
  }

  return NewPoint(a.x / b, a.y / b);
};

export const Distance = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return Magnitue(NewPoint(dx, dy));
};

export const DistanceSquared = (a: Point, b: Point) => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;

  return MagnitudeSquared(NewPoint(dx, dy));
};

export const Magnitue = (a: Point) => {
  return Math.sqrt(MagnitudeSquared(a));
};

export const MagnitudeSquared = (a: Point) => {
  return a.x * a.x + a.y * a.y;
};

export const Dot = (a: Point, b: Point) => {
  return a.x * b.x + a.y * b.y;
};

export const Normalize = (a: Point) => {
  const mag = Magnitue(a);
  return Divide(a, mag);
};

export const ToWorldCordinate = (a: Point, rotation: number) => {
  const rot = DegToRad(rotation);
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const point = NewPoint(cos * a.x - sin * a.y, sin * a.x + cos * a.y);
  return point;
};

export const DegToRad = (deg: number) => deg * (Math.PI / 180);

export const Negative = (a: Point) => NewPoint(-a.x, -a.y);

const VERY_SMALL_DISTANCE = 0.0000001;

export const NearlyEqual = (a: number, b: number) => {
  return Math.abs(a - b) < VERY_SMALL_DISTANCE;
};

export const NearlyEqualPoints = (a: Point, b: Point) => {
  return DistanceSquared(a, b) < VERY_SMALL_DISTANCE * VERY_SMALL_DISTANCE;
};
