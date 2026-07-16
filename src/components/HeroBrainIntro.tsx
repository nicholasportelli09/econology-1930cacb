import { motion, useReducedMotion } from "framer-motion";
import brainLogo from "@/assets/econology-logo.png";

export const HeroBrainIntro = () => {
  const reduce = useReducedMotion();

  if (reduce) {
    return null;
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 flex items-start justify-center pt-10 md:pt-16 z-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        initial={{ y: -220, rotate: 0, opacity: 0 }}
        animate={{
          y: [-220, 0, 0, 0, 0, 0],
          rotate: [0, 0, -12, 8, -4, 0],
          opacity: [0, 1, 1, 1, 1, 1],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.35, 0.55, 0.75, 0.9, 1],
          ease: "easeOut",
        }}
        style={{ transformOrigin: "50% 100%" }}
      >
        <img
          src={brainLogo}
          alt=""
          width={220}
          height={220}
          className="object-contain w-[160px] h-[160px] md:w-[220px] md:h-[220px] drop-shadow-2xl"
        />
      </motion.div>
    </motion.div>
  );
};

export default HeroBrainIntro;