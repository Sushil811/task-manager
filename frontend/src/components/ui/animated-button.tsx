"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Button } from "@/components/ui/button";

export interface AnimatedButtonProps extends React.ComponentProps<typeof Button> {
  motionProps?: HTMLMotionProps<"div">;
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, motionProps, ...props }, ref) => {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        {...motionProps}
        className="inline-block"
      >
        <Button ref={ref} className={className} {...props} />
      </motion.div>
    );
  }
);
AnimatedButton.displayName = "AnimatedButton";

