import { useState } from "react";

export const useTick = () => {
  const [tick, setTick] = useState(0);

  return {
    tick: () => setTick((t) => t + 1),
    count: tick,
  };
};
