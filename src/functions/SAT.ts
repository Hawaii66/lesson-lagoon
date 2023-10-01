import { Block } from "@/physics/Movable";
import {
  Add,
  Dot,
  Multiply,
  Negative,
  NewPoint,
  Normalize,
  Point,
  Scale,
  Subtract,
  ToWorldCordinate,
  ZERO,
} from "./Point";

export const Solve = (a: Block, b: Block) => {
  if (a.isStatic && b.isStatic) return;

  const polygonA = a.polygon.map((point) =>
    Add(NewPoint(a.x, a.y), ToWorldCordinate(point, a.rotation))
  );
  const polygonB = b.polygon.map((point) =>
    Add(NewPoint(b.x, b.y), ToWorldCordinate(point, b.rotation))
  );

  const result = Intersection(polygonA, polygonB);

  if (b.isStatic && !a.isStatic) {
    a.velocity = Add(a.velocity, Negative(Scale(result.normal, result.depth)));
  }

  if (a.isStatic && !b.isStatic) {
    b.velocity = Add(b.velocity, Negative(Scale(result.normal, result.depth)));
  }

  if (!b.isStatic && !a.isStatic) {
    b.velocity = Add(
      b.velocity,
      Negative(Scale(result.normal, result.depth / 2))
    );
    a.velocity = Add(a.velocity, Scale(result.normal, result.depth / 2));
  }

  ResolveCollision(a, b, result.normal);
};

type IntersectionResult = {
  isIntersecting: boolean;
  normal: Point;
  depth: number;
};

const ResolveCollision = (a: Block, b: Block, normal: Point) => {
  const relativeVelocity = Subtract(a.velocity, b.velocity);

  const e = Math.min(a.restitution, b.restitution);

  //Should be 1 + e but that gives a negative restitution
  var j = -(1 - e) * Dot(relativeVelocity, normal);
  j /= a.InverseMass() + b.InverseMass();

  a.velocity = Add(a.velocity, Scale(normal, j * a.InverseMass()));
  b.velocity = Subtract(b.velocity, Scale(normal, j * b.InverseMass()));
};

const Intersection = (
  polygonA: Point[],
  polygonB: Point[]
): IntersectionResult => {
  var depth = Number.MAX_VALUE;
  var normal = ZERO;
  var result = CheckPolygon(polygonA, polygonB, depth);
  if (result === false)
    return { depth: 0, isIntersecting: false, normal: ZERO };

  if (result.depth !== depth) {
    depth = result.depth;
    normal = result.normal;
  }

  result = CheckPolygon(polygonB, polygonA, depth);
  if (result === false)
    return { depth: 0, isIntersecting: false, normal: ZERO };

  if (result.depth !== depth) {
    depth = result.depth;
    normal = result.normal;
  }

  const centerA = FindArithmeticMean(polygonA);
  const centerB = FindArithmeticMean(polygonB);
  const direction = Subtract(centerA, centerB);

  if (Dot(direction, normal) < 0) {
    normal = Negative(normal);
  }

  return {
    isIntersecting: true,
    depth: depth,
    normal: normal,
  };
};

const CheckPolygon = (
  polygonA: Point[],
  polygonB: Point[],
  depth: number
): false | { normal: Point; depth: number } => {
  var newDepth = depth;
  var normal = ZERO;

  for (var i = 0; i < polygonA.length; i++) {
    const va = polygonA[i];
    const vb = polygonA[(i + 1) % polygonA.length];

    const edge = Subtract(vb, va);
    const axis = Normalize(NewPoint(-edge.y, edge.x));

    const { min: minA, max: maxA } = ProjectPolygon(polygonA, axis);
    const { min: minB, max: maxB } = ProjectPolygon(polygonB, axis);

    if (minA >= maxB || minB >= maxA) {
      return false;
    }

    const axisDepth = Math.min(maxB - minA, maxA - minB);
    if (axisDepth < newDepth) {
      newDepth = axisDepth;
      normal = axis;
    }
  }

  return {
    depth: newDepth,
    normal,
  };
};

const ProjectPolygon = (polygon: Point[], axis: Point) => {
  var min = Number.MAX_VALUE;
  var max = Number.MIN_VALUE;

  for (var i = 0; i < polygon.length; i++) {
    const v = polygon[i];

    const proj = Dot(v, axis);

    if (proj < min) min = proj;
    if (proj > max) max = proj;
  }

  return { min, max };
};

const FindArithmeticMean = (polygon: Point[]) => {
  var sumX = 0;
  var sumY = 0;

  polygon.forEach((point) => {
    sumX += point.x;
    sumY += point.y;
  });

  return NewPoint(sumX / polygon.length, sumY / polygon.length);
};
