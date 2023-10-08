import { Add, Multiply, Point } from "./Point";

export type Context2D = CanvasRenderingContext2D;
export type Canvas = HTMLCanvasElement;

type DrawSettings = {
  stroke?: boolean;
  color?: string;
  fill?: boolean;
};

const DefaultSettings = { stroke: false, color: "#000", fill: false } as const;

const SafeSettings = (settings: DrawSettings): Required<DrawSettings> => {
  return {
    color: settings.color ?? DefaultSettings.color,
    stroke: settings.stroke ?? DefaultSettings.stroke,
    fill: settings.fill ?? DefaultSettings.fill,
  };
};

export const DrawLines = (
  ctx: Context2D,
  points: Point[],
  resolution: number,
  drawSettings: DrawSettings = DefaultSettings
) => {
  const settings = SafeSettings(drawSettings);

  ctx.moveTo(points[0].x * resolution, points[0].y * resolution);

  for (var i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x * resolution, points[i].y * resolution);
  }

  ctx.lineTo(points[0].x * resolution, points[0].y * resolution);

  if (settings.stroke) {
    ctx.strokeStyle = settings.color;
    ctx.stroke();
  }

  if (settings.fill) {
    ctx.fillStyle = settings.color;
    ctx.fill();
  }
};

export const DrawSquare = (
  ctx: Context2D,
  topLeft: Point,
  bottomRight: Point,
  drawSettings: DrawSettings = DefaultSettings
) => {
  const settings = SafeSettings(drawSettings);
  ctx.rect(
    topLeft.x,
    topLeft.y,
    bottomRight.x - topLeft.x,
    bottomRight.y - topLeft.y
  );

  if (settings.stroke) {
    ctx.strokeStyle = settings.color;
    ctx.stroke();
  }

  if (settings.fill) {
    ctx.fillStyle = settings.color;
    ctx.fill();
  }
};

export const DrawGrid = (
  ctx: Context2D,
  topLeft: Point,
  size: Point,
  count: Point
) => {
  Array.from({ length: count.x }).forEach((_, x) => {
    Array.from({ length: count.y }).forEach((_, y) => {
      DrawSquare(
        ctx,
        Add(Multiply(size, { x, y }), topLeft),
        Add(Multiply(size, { x: x + 1, y: y + 1 }), topLeft)
      );
    });
  });

  ctx.strokeStyle = "#dddddd";
  ctx.stroke();
};
