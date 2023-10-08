"use client";

import { useTick } from "@/hooks/useTick";
import { Block, UpdateEvent } from "@/physics/Movable";
import { DrawGrid } from "@/physics/functions/Canvas";
import { ZERO, NewPoint } from "@/physics/functions/Point";
import { Solve } from "@/physics/functions/SAT";
import { Point } from "@/physics/types";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef<Point>(ZERO);
  const mouseDown = useRef<boolean>(false);
  const [selectedObject, setSelectedObject] = useState<any>(undefined);
  const { count, tick } = useTick();
  const block = useRef<Block>();

  useEffect(() => {
    onmousemove = (e) =>
      (mousePos.current = {
        x: e.clientX - (canvasRef.current?.offsetLeft ?? 0),
        y: e.clientY - (canvasRef.current?.offsetTop ?? 0),
      });
    onmousedown = (e) => {
      mouseDown.current = true;
    };
    onmouseup = (e) => {
      mouseDown.current = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolution = 100;

    if (block.current !== undefined) return;

    var fallingBlock = new Block(
      {
        x: 23,
        y: 20,
        width: 2,
        height: 2,
      },
      0,
      false,
      "falling-1",
      () => {
        tick();
      }
    );
    var fallingBlock2 = new Block(
      {
        x: 20,
        y: 40,
        width: 5,
        height: 5,
      },
      0,
      false,
      "falling-2",
      () => {
        tick();
      }
    );
    var fallingBlock3 = new Block(
      {
        x: 55,
        y: 10,
        width: 5,
        height: 5,
      },
      0,
      false,
      "falling-3",
      () => {
        tick();
      }
    );
    const ground = new Block(
      {
        x: resolution / 2,
        y: (resolution * 800) / 1400 - 1,
        height: 2,
        width: resolution,
      },
      0,
      true,
      "ground-1",
      () => {
        tick();
      }
    );
    const ground2 = new Block(
      {
        x: resolution / 2,
        y: (resolution * 800) / 1400 / 2 - 1,
        height: 2,
        width: resolution / 4,
      },
      25,
      true,
      "ground-2",
      () => {
        tick();
      }
    );
    const ground3 = new Block(
      {
        x: 0,
        y: (resolution * 800) / 1400 / 2,
        height: (resolution * 800) / 1400,
        width: 1,
      },
      0,
      true,
      "ground-3",
      () => {
        tick();
      }
    );
    block.current = fallingBlock;
    setSelectedObject(fallingBlock);

    const t = setInterval(() => {
      const ctx = canvasRef.current?.getContext("2d")!;
      ctx.beginPath();
      ctx.clearRect(0, 0, ctx.canvas.width, canvas.height);
      DrawGrid(
        ctx,
        ZERO,
        { x: 1400 / resolution, y: 1400 / resolution },
        { x: resolution, y: (resolution * 800) / 1400 }
      );

      ctx.beginPath();

      const updateEvent: UpdateEvent<Block> = {
        isMouseDown: mouseDown.current,
        mousePosition: {
          x: mousePos.current.x / (1400 / resolution),
          y: mousePos.current.y / (1400 / resolution),
        },
        onClicked: (target) => {
          setSelectedObject(target);
        },
      };

      fallingBlock.AddForce(NewPoint(0, 9.88 / (1400 / resolution)));
      fallingBlock2.AddForce(NewPoint(0, 9.88 / (1400 / resolution)));
      fallingBlock3.AddForce(NewPoint(0, 9.88 / (1400 / resolution)));

      const substeps = 1000;
      const oneStep = 1 / substeps;
      for (var i = 0; i < substeps; i++) {
        Solve([
          ground,
          ground2,
          ground3,
          fallingBlock,
          fallingBlock2,
          fallingBlock3,
        ]);

        ground.Update(oneStep);
        ground2.Update(oneStep);
        ground3.Update(oneStep);
        fallingBlock.Update(oneStep);
        fallingBlock2.Update(oneStep);
        fallingBlock3.Update(oneStep);
      }

      fallingBlock.FinalUpdate(updateEvent);
      fallingBlock.Draw(ctx, 1400 / resolution);

      fallingBlock2.FinalUpdate(updateEvent);
      fallingBlock2.Draw(ctx, 1400 / resolution);

      fallingBlock3.FinalUpdate(updateEvent);

      fallingBlock3.Draw(ctx, 1400 / resolution);

      ground.FinalUpdate(updateEvent);
      ground.Draw(ctx, 1400 / resolution);
      ground2.FinalUpdate(updateEvent);
      ground2.Draw(ctx, 1400 / resolution);
      ground3.FinalUpdate(updateEvent);
      ground3.Draw(ctx, 1400 / resolution);
    }, 20);

    () => {
      clearInterval(t);
    };
  }, []);

  return (
    <div className="p-4 flex flex-row">
      <div>
        <h1>Physics</h1>
        <canvas ref={canvasRef} width={1400} height={800} />
      </div>
      {selectedObject && (
        <div className="shadow-md p-4 m-4 flex-grow">
          <h1>Edit object</h1>
          <h2>
            ({selectedObject.x}; {selectedObject.y})
          </h2>
          <h2>
            ({selectedObject.velocity.x}; {selectedObject.velocity.y})
          </h2>
          <p>{selectedObject.rotation}</p>
          <p>{selectedObject.rotationalVelocity}</p>
          <div className="flex flex-row w-full justify-between items-center gap-4 my-2">
            <input
              value={selectedObject.x}
              onChange={(e) => {
                const newX =
                  e.target.value === "" ? 0 : parseInt(e.target.value);
                selectedObject.Translate(
                  {
                    x: newX - selectedObject.x,
                    y: 0,
                  },
                  0
                );
              }}
              type="number"
              className="bg-zinc-500 flex-grow"
            />
            <input
              value={selectedObject.y}
              onChange={(e) => {
                const newY =
                  e.target.value === "" ? 0 : parseInt(e.target.value);
                selectedObject.Translate(
                  { x: 0, y: newY - selectedObject.y },
                  0
                );
              }}
              type="number"
              className="bg-zinc-500 flex-grow"
            />
          </div>
          <input
            value={selectedObject.rotation}
            onChange={(e) => {
              var rot = e.target.value === "" ? 0 : parseInt(e.target.value);
              if (rot < 0) {
                rot += 360;
              }
              selectedObject.Translate(
                { x: 0, y: 0 },
                rot - selectedObject.rotation
              );
            }}
            type="number"
            className="bg-zinc-500"
          />
          <p className="opacity-0">{count}</p>
        </div>
      )}
    </div>
  );
}
