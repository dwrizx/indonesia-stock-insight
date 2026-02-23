import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (val: number) => string;
}

const AnimatedCounter = ({
  value,
  duration = 1.5,
  className = "",
  format,
}: AnimatedCounterProps) => {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0,
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplay(
        format
          ? format(latest)
          : latest.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
      );
    });
    return unsubscribe;
  }, [spring, format]);

  return <span className={className}>{display}</span>;
};

export default AnimatedCounter;
