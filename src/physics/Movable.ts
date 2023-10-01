import { Canvas, Context2D, DrawLines, DrawSquare } from "@/functions/Canvas";
import { Add, Point, ZERO } from "@/functions/Point";
import { Rect } from "@/functions/Rect";

interface Draw {
  Draw: (ctx: Context2D, resolution: number) => void;
}

export type UpdateEvent<T> = {
  mousePosition: Point;
  resolution: number;
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
  rotationalVelocity: number;
  isPlaced: boolean = false;
  onUpdateUI: () => void;

  constructor(
    rect: Point & { width: number; height: number },
    rotation: number,
    onUpdateUI: () => void
  ) {
    this.x = rect.x;
    this.y = rect.y;

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
  }

  Update({
    isMouseDown,
    mousePosition,
    resolution,
    onClicked,
  }: UpdateEvent<Block>) {
    /*if (!this.isPlaced && isMouseDown) {
      this.x = Math.floor(mousePosition.x / resolution) * resolution;
      this.y = Math.floor(mousePosition.y / resolution) * resolution;
    }

    if (!isMouseDown && !this.isPlaced) {
      this.isPlaced = true;
    }*/

    this.Translate(this.velocity, this.rotationalVelocity);

    if (
      isMouseDown &&
      insidePolygon(
        Add(mousePosition, { x: -this.x, y: -this.y }),
        this.polygon
      )
    ) {
      onClicked(this);
    }

    /*if (
      isMouseDown &&
      mousePosition.x > this.x &&
      mousePosition.y > this.y &&
      mousePosition.x < this.x + this.width &&
      mousePosition.y < this.y + this.height
    ) {
      this.isPlaced = false;

      onClicked(this);
    }*/
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

  Translate(pos: Point, rot: number | undefined) {
    this.x += pos.x;
    this.y += pos.y;

    this.rotation += rot ?? this.rotation;

    this.onUpdateUI();
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
