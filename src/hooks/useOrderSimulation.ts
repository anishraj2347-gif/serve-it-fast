import { useEffect } from "react";
import { useDashboard } from "@/store/useDashboard";
import { generateIncomingOrder } from "@/lib/demoData";

/** Simulates a new incoming order at random intervals (8-18s). */
export function useOrderSimulation() {
  const addOrder = useDashboard((s) => s.addOrder);
  const menu = useDashboard((s) => s.menu);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const delay = 8000 + Math.random() * 10_000;
      timer = setTimeout(() => {
        addOrder(generateIncomingOrder(menu));
        tick();
      }, delay);
    };
    tick();
    return () => clearTimeout(timer);
  }, [addOrder, menu]);
}
