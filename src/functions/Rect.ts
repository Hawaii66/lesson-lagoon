import { Point } from "./Point";

export type Rect = Point & {
  polygon: Point[];
};
