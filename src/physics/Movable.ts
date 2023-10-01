import { Canvas, Context2D, DrawLines, DrawSquare } from "@/functions/Canvas";
import { Add, Divide, Point, Scale, ZERO } from "@/functions/Point";
import { Rect } from "@/functions/Rect";

interface Draw {
  Draw: (ctx: Context2D, resolution: number) => void;
}

export type UpdateEvent<T> = {
  mousePosition: Point;
  isMouseDown: boolean;
  onClicked: (obj: T) => void;
};

interface Update<T> {
  Update: (dt: number) => void;
  FinalUpdate: (event: UpdateEvent<T>) => void;
}

export class Block implements Rect, Draw, Update<Block> {
  x: number;
  y: number;
  polygon: Point[];
  rotation: number;
  velocity: Point;
  acceleration: Point;
  mass: number;
  restitution: number;
  isStatic: boolean;
  rotationalVelocity: number;
  name: string;
  staticFriction: number;
  dynamicFriction: number;
  onUpdateUI: () => void;

  constructor(
    rect: Point & { width: number; height: number },
    rotation: number,
    isStatic: boolean,
    name: string,
    onUpdateUI: () => void
  ) {
    this.name = name;
    this.x = rect.x;
    this.y = rect.y;

    this.staticFriction = 0.9;
    this.dynamicFriction = 0.8;

    this.isStatic = isStatic;
    this.restitution = 0.95;

    const width = rect.width;
    const height = rect.height;

    this.polygon = [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 },
    ];

    this.rotation = rotation;
    this.onUpdateUI = onUpdateUI;

    this.velocity = ZERO;
    this.rotationalVelocity = 0;

    this.acceleration = ZERO;
    this.mass = rect.width * rect.height;
    this.mass *= this.mass;
  }

  Update(dt: number) {
    //F=ma => a = f/m
    this.Translate(Scale(this.velocity, dt), this.rotationalVelocity * dt);
  }

  FinalUpdate({ isMouseDown, mousePosition, onClicked }: UpdateEvent<Block>) {
    this.velocity = Add(this.velocity, this.acceleration);

    //if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
    //if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
    //if (Math.abs(this.rotationalVelocity) < 0.001) this.rotationalVelocity = 0;

    this.acceleration = ZERO;

    if (
      isMouseDown &&
      insidePolygon(
        Add(mousePosition, { x: -this.x, y: -this.y }),
        this.polygon
      )
    ) {
      onClicked(this);
    }
  }

  CalculateMomentOfInertia() {
    const width = Math.abs(this.polygon[0].x - this.polygon[1].x);
    const height = Math.abs(this.polygon[1].y - this.polygon[2].y);
    return (1 / 12) * this.mass * (width * width + height * height);
  }

  Draw(ctx: Context2D, resolution: number) {
    ctx.save();
    ctx.translate(this.x * resolution, this.y * resolution);
    ctx.rotate(this.rotation);
    /*DrawSquare(
      ctx,
      ZERO,
      Add(ZERO, { x: this.width * resolution, y: this.height * resolution }),
      {
        color: "#b3a88b",
        fill: true,
      }
    );*/

    DrawLines(ctx, this.polygon, resolution, {
      color: "#b3a88b",
      fill: true,
    });

    ctx.restore();
  }

  AddForce(force: Point) {
    //f=ma => a = f/a
    this.acceleration = Add(this.acceleration, Divide(force, this.mass));
  }

  AddGravity(force: Point) {
    this.acceleration = Add(this.acceleration, force);
  }

  Translate(pos: Point, rot: number) {
    this.x += pos.x;
    this.y += pos.y;

    this.rotation += rot;

    this.onUpdateUI();
  }

  InverseMass() {
    if (this.isStatic) {
      return 0;
    }

    return 1 / this.mass;
  }

  InverseInertia() {
    if (this.isStatic) {
      return 0;
    }

    return 1 / this.CalculateMomentOfInertia();
  }
}

const insidePolygon = (point: Point, polygon: Point[]) => {
  var i, j;
  var c = false;
  const nvert = polygon.length;
  const testx = point.x;
  const testy = point.y;
  for (i = 0, j = nvert - 1; i < nvert; j = i++) {
    if (
      polygon[i].y > testy != polygon[j].y > testy &&
      testx <
        ((polygon[j].x - polygon[i].x) * (testy - polygon[i].y)) /
          (polygon[j].y - polygon[i].y) +
          polygon[i].x
    )
      c = !c;
  }
  return c;
};
