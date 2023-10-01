import { Canvas, Context2D, DrawLines, DrawSquare } from "@/functions/Canvas";
import { Add, Divide, Point, ZERO } from "@/functions/Point";
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
  Update: (event: UpdateEvent<T>) => void;
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
  onUpdateUI: () => void;

  constructor(
    rect: Point & { width: number; height: number },
    rotation: number,
    isStatic: boolean,
    onUpdateUI: () => void
  ) {
    this.x = rect.x;
    this.y = rect.y;

    this.isStatic = isStatic;
    this.restitution = 0.9;

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
    this.mass = 1;
  }

  Update({ isMouseDown, mousePosition, onClicked }: UpdateEvent<Block>) {
    //F=ma => a = f/m
    this.velocity = Add(this.velocity, this.acceleration);

    this.Translate(this.velocity, this.rotationalVelocity);

    this.rotationalVelocity = 0;

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

  Draw(ctx: Context2D, resolution: number) {
    ctx.save();
    ctx.translate(this.x * resolution, this.y * resolution);
    ctx.rotate((this.rotation * Math.PI) / 180);
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

  Translate(pos: Point, rot: number | undefined) {
    this.x += pos.x;
    this.y += pos.y;

    this.rotation += rot ?? this.rotation;
    this.rotation %= 360;

    this.onUpdateUI();
  }

  InverseMass() {
    if (this.isStatic) {
      return 0;
    }

    return 1 / this.mass;
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
