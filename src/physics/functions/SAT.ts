import { Block } from "../Movable";
import { Point } from "../types";
import {
  Add,
  NewPoint,
  ToWorldCordinate,
  Negative,
  Subtract,
  NearlyEqualPoints,
  ZERO,
  Normalize,
  NearlyEqual,
  Magnitue,
  Distance,
  Scale,
  Dot,
  Cross,
} from "./Point";

export const Solve = (blocks: Block[]) => {
  const manifolds: CollisionManifold[] = [];

  for (var i = 0; i < blocks.length; i++) {
    for (var j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];

      if (a.isStatic && b.isStatic) continue;

      const result = IsColliding(a, b);
      if (!result.isIntersecting) continue;

      const manifold: CollisionManifold = {
        a,
        b,
        contacts: FindContactPoints(a, b),
        ...result,
      };

      manifolds.push(manifold);
    }
  }

  manifolds.forEach(ResolveCollisionWithRotation);
};

const IsColliding = (a: Block, b: Block) => {
  const polygonA = a.polygon.map((point) =>
    Add(NewPoint(a.x, a.y), ToWorldCordinate(point, a.rotation))
  );
  const polygonB = b.polygon.map((point) =>
    Add(NewPoint(b.x, b.y), ToWorldCordinate(point, b.rotation))
  );

  const result = Intersection(polygonA, polygonB);
  const { depth, normal } = result;

  if (b.isStatic && !a.isStatic) {
    a.velocity = Add(a.velocity, Scale(normal, depth * 0.99));
  }

  if (a.isStatic && !b.isStatic) {
    b.velocity = Add(b.velocity, Negative(Scale(normal, depth * 0.99)));
  }

  if (!b.isStatic && !a.isStatic) {
    b.velocity = Add(b.velocity, Negative(Scale(normal, depth / 2)));
    a.velocity = Add(a.velocity, Scale(normal, depth / 2));
  }
  return result;
};

type IntersectionResult = {
  isIntersecting: boolean;
  normal: Point;
  depth: number;
};

const ResolveCollisionWithRotation = ({
  a,
  b,
  contacts,
  depth,
  normal,
}: CollisionManifold) => {
  const e = Math.min(a.restitution, b.restitution);
  const staticFriction = a.staticFriction;
  const dynamicFriction = a.dynamicFriction;

  const impulsesInfo: { impulse: Point; ra: Point; rb: Point }[] = [];
  const jInfo: number[] = [];

  contacts.forEach((contactPoint) => {
    const ra = Subtract(contactPoint, NewPoint(a.x, a.y));
    const rb = Subtract(contactPoint, NewPoint(b.x, b.y));

    const raPerp = NewPoint(-ra.y, ra.x);
    const rbPerp = NewPoint(-rb.y, rb.x);

    const angularVelocityA = Scale(raPerp, a.rotationalVelocity);
    const angularVelocityB = Scale(rbPerp, b.rotationalVelocity);

    const relativeVelocity = Subtract(
      Add(a.velocity, angularVelocityA),
      Add(b.velocity, angularVelocityB)
    );

    const contactVelocityMagnitude = Dot(relativeVelocity, normal);

    if (contactVelocityMagnitude > 0) {
      jInfo.push(0);
      return;
    }

    const raPerpDotN = Dot(raPerp, normal);
    const rbPerpDotN = Dot(rbPerp, normal);

    const denom =
      a.InverseMass() +
      b.InverseMass() +
      raPerpDotN * raPerpDotN * a.InverseInertia() +
      rbPerpDotN * rbPerpDotN * b.InverseInertia();

    var j = -(1 + e) * contactVelocityMagnitude;
    j /= denom;
    j /= contacts.length;

    const impulse = Scale(normal, j);
    impulsesInfo.push({
      impulse,
      ra,
      rb,
    });
    jInfo.push(j);
  });

  impulsesInfo.forEach(({ impulse, ra, rb }) => {
    a.velocity = Add(a.velocity, Scale(impulse, a.InverseMass()));
    a.rotationalVelocity += Cross(ra, impulse) * a.InverseInertia();
    b.velocity = Subtract(b.velocity, Scale(impulse, b.InverseMass()));
    b.rotationalVelocity += -Cross(rb, impulse) * b.InverseInertia();
  });

  ///Friction
  const impulseFrictionInfo: {
    frictionImpulse: Point;
    ra: Point;
    rb: Point;
  }[] = [];

  contacts.forEach((contactPoint, idx) => {
    const ra = Subtract(contactPoint, NewPoint(a.x, a.y));
    const rb = Subtract(contactPoint, NewPoint(b.x, b.y));

    const raPerp = NewPoint(-ra.y, ra.x);
    const rbPerp = NewPoint(-rb.y, rb.x);

    const angularVelocityA = Scale(raPerp, a.rotationalVelocity);
    const angularVelocityB = Scale(rbPerp, b.rotationalVelocity);

    const relativeVelocity = Subtract(
      Add(a.velocity, angularVelocityA),
      Add(b.velocity, angularVelocityB)
    );

    var tangent = Subtract(
      relativeVelocity,
      Scale(normal, Dot(relativeVelocity, normal))
    );

    if (NearlyEqualPoints(tangent, ZERO)) {
      return;
    }

    tangent = Normalize(tangent);

    const raPerpDotT = Dot(raPerp, tangent);
    const rbPerpDotT = Dot(rbPerp, tangent);

    const denom =
      a.InverseMass() +
      b.InverseMass() +
      raPerpDotT * raPerpDotT * a.InverseInertia() +
      rbPerpDotT * rbPerpDotT * b.InverseInertia();

    var jt = -Dot(relativeVelocity, tangent);
    jt /= denom;
    jt /= contacts.length;

    var frictionImpulse = ZERO;

    const j = jInfo[idx];
    if (Math.abs(jt) < j * staticFriction) {
      frictionImpulse = Scale(tangent, jt);
    } else {
      frictionImpulse = Scale(tangent, -j * dynamicFriction);
    }

    impulseFrictionInfo.push({
      frictionImpulse,
      ra,
      rb,
    });
  });

  impulseFrictionInfo.forEach(({ frictionImpulse, ra, rb }) => {
    a.velocity = Add(a.velocity, Scale(frictionImpulse, a.InverseMass()));
    a.rotationalVelocity += Cross(ra, frictionImpulse) * a.InverseInertia();
    b.velocity = Subtract(b.velocity, Scale(frictionImpulse, b.InverseMass()));
    b.rotationalVelocity += -Cross(rb, frictionImpulse) * b.InverseInertia();
  });
};

const ResolveCollision = ({
  a,
  b,
  contacts,
  depth,
  normal,
}: CollisionManifold) => {
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

type CollisionManifold = {
  a: Block;
  b: Block;
  normal: Point;
  depth: number;
  contacts: Point[];
};

const FindContactPoints = (a: Block, b: Block) => {
  const polygonA = a.polygon.map((point) =>
    Add(NewPoint(a.x, a.y), ToWorldCordinate(point, a.rotation))
  );
  const polygonB = b.polygon.map((point) =>
    Add(NewPoint(b.x, b.y), ToWorldCordinate(point, b.rotation))
  );

  var contacts: Point[] = [];
  var minDistSquared = Number.MAX_VALUE;

  for (var i = 0; i < polygonA.length; i++) {
    const p = polygonA[i];

    for (var j = 0; j < polygonB.length; j++) {
      const va = polygonB[j];
      const vb = polygonB[(j + 1) % polygonB.length];

      const { cp, lengthSquared } = PointSegmentDistance(p, va, vb);

      if (NearlyEqual(lengthSquared, minDistSquared)) {
        if (!NearlyEqualPoints(cp, contacts[0])) {
          if (contacts.length === 1) {
            contacts.push(cp);
          } else {
            contacts[1] = cp;
          }
        }
      } else if (lengthSquared < minDistSquared) {
        minDistSquared = lengthSquared;
        contacts = [cp];
      }
    }
  }

  for (var i = 0; i < polygonB.length; i++) {
    const p = polygonB[i];

    for (var j = 0; j < polygonA.length; j++) {
      const va = polygonA[j];
      const vb = polygonA[(j + 1) % polygonA.length];

      const { cp, lengthSquared } = PointSegmentDistance(p, va, vb);

      if (NearlyEqual(lengthSquared, minDistSquared)) {
        if (!NearlyEqualPoints(cp, contacts[0])) {
          if (contacts.length === 1) {
            contacts.push(cp);
          } else {
            contacts[1] = cp;
          }
        }
      } else if (lengthSquared < minDistSquared) {
        minDistSquared = lengthSquared;
        contacts = [cp];
      }
    }
  }

  return contacts;
};

const PointSegmentDistance = (p: Point, a: Point, b: Point) => {
  const ab = Subtract(b, a);
  const ap = Subtract(p, a);

  const proj = Dot(ap, ab);
  const abLengthSquared = Magnitue(ab) * Magnitue(ab);
  const d = proj / abLengthSquared;

  var cp: Point = ZERO;

  if (d <= 0) {
    cp = a;
  } else if (d >= 1) {
    cp = b;
  } else {
    cp = Add(a, Scale(ab, d));
  }

  return {
    lengthSquared: Distance(p, cp),
    cp,
  };
};
