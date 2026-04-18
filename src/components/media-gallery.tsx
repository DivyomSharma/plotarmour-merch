"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

// Hardcoded explicit distribution of files to ensure consistent React hydration matches DOM.
const row1 = [
  { type: "img", src: "/media/img_1.jpeg" },
  { type: "vid", src: "/media/vid_1.mp4" },
  { type: "img", src: "/media/img_2.jpeg" },
  { type: "img", src: "/media/img_3.jpeg" },
  { type: "vid", src: "/media/vid_2.mp4" },
  { type: "img", src: "/media/img_4.jpeg" },
  { type: "img", src: "/media/img_5.jpeg" },
  { type: "vid", src: "/media/vid_3.mp4" },
  { type: "img", src: "/media/img_6.jpeg" },
  { type: "vid", src: "/media/vid_4.mp4" },
  { type: "img", src: "/media/img_7.jpeg" },
  { type: "img", src: "/media/img_8.jpeg" },
  { type: "vid", src: "/media/vid_5.mp4" },
  { type: "img", src: "/media/img_9.jpeg" },
  { type: "img", src: "/media/img_10.jpeg" },
  { type: "vid", src: "/media/vid_6.mp4" },
  { type: "img", src: "/media/img_11.jpeg" },
  { type: "img", src: "/media/img_12.jpeg" },
  { type: "vid", src: "/media/vid_7.mp4" },
  { type: "img", src: "/media/img_13.jpeg" },
  { type: "img", src: "/media/img_14.jpeg" },
  { type: "vid", src: "/media/vid_8.mp4" },
  { type: "img", src: "/media/img_15.jpeg" },
  { type: "img", src: "/media/img_16.jpeg" },
  { type: "vid", src: "/media/vid_9.mp4" },
  { type: "img", src: "/media/img_17.jpeg" },
  { type: "vid", src: "/media/vid_10.mp4" },
  { type: "img", src: "/media/img_18.jpeg" },
];

const row2 = [
  { type: "img", src: "/media/img_19.jpeg" },
  { type: "vid", src: "/media/vid_11.mp4" },
  { type: "img", src: "/media/img_20.jpeg" },
  { type: "img", src: "/media/img_21.jpeg" },
  { type: "img", src: "/media/img_22.jpeg" },
  { type: "vid", src: "/media/vid_12.mp4" },
  { type: "img", src: "/media/img_23.jpeg" },
  { type: "img", src: "/media/img_24.jpeg" },
  { type: "vid", src: "/media/vid_13.mp4" },
  { type: "img", src: "/media/img_25.jpeg" },
  { type: "img", src: "/media/img_26.jpeg" },
  { type: "vid", src: "/media/vid_14.mp4" },
  { type: "img", src: "/media/img_27.jpeg" },
  { type: "img", src: "/media/img_28.jpeg" },
  { type: "vid", src: "/media/vid_15.mp4" },
  { type: "img", src: "/media/img_29.jpeg" },
  { type: "img", src: "/media/img_30.jpeg" },
  { type: "img", src: "/media/img_31.jpeg" },
  { type: "vid", src: "/media/vid_16.mp4" },
  { type: "img", src: "/media/img_32.jpeg" },
  { type: "img", src: "/media/img_33.jpeg" },
  { type: "vid", src: "/media/vid_17.mp4" },
  { type: "img", src: "/media/img_34.jpeg" },
  { type: "img", src: "/media/img_35.jpeg" },
  { type: "vid", src: "/media/vid_18.mp4" },
  { type: "img", src: "/media/img_36.jpeg" },
  { type: "vid", src: "/media/vid_19.mp4" },
  { type: "img", src: "/media/img_37.jpeg" },
  { type: "vid", src: "/media/vid_20.mp4" },
  { type: "vid", src: "/media/vid_21.mp4" },
];

function MediaCard({ item }: { item: { type: string; src: string } }) {
  return (
    <div className="relative h-60 w-48 shrink-0 overflow-hidden border-[3px] border-foreground bg-neutral-200 dark:bg-neutral-900 md:h-80 md:w-60">
      {item.type === "img" ? (
        <Image
          src={item.src}
          alt="Our work showcase"
          fill
          unoptimized
          className="object-cover transition-transform duration-500 hover:scale-110"
        />
      ) : (
        <video
          src={item.src}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />
      )}
    </div>
  );
}

export function MediaGallery() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col gap-6 py-6 pb-2">
      {/* Row 1: Left */}
      <div className="relative flex w-full">
        <motion.div
          animate={shouldReduceMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 90, ease: "linear", repeat: Infinity }
          }
          className="flex shrink-0 gap-6 px-3"
          style={{ width: "fit-content" }}
        >
          {/* Duplicate map for infinite scroll effect */}
          {[...row1, ...row1].map((item, i) => (
            <MediaCard key={i} item={item} />
          ))}
        </motion.div>
      </div>

      {/* Row 2: Right - Hidden on incredibly weak mobile devices to prevent DOM overload */}
      <div className="relative hidden md:flex w-full">
        <motion.div
          animate={shouldReduceMotion ? undefined : { x: ["-50%", "0%"] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 100, ease: "linear", repeat: Infinity }
          }
          className="flex shrink-0 gap-6 px-3"
          style={{ width: "fit-content" }}
        >
          {/* Duplicate map for infinite scroll effect */}
          {[...row2, ...row2].map((item, i) => (
            <MediaCard key={i} item={item} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
