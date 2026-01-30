import { useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const BackgroundBeams = ({ className }: { className?: string }) => {
    const beams = [
        {
            initialX: 10,
            translateX: 10,
            duration: 7,
            repeatDelay: 3,
            delay: 2,
        },
        {
            initialX: 600,
            translateX: 600,
            duration: 3,
            repeatDelay: 3,
            delay: 4,
        },
        {
            initialX: 100,
            translateX: 100,
            duration: 7,
            repeatDelay: 7,
            className: "h-6",
        },
        {
            initialX: 400,
            translateX: 400,
            duration: 5,
            repeatDelay: 14,
            delay: 4,
        },
        {
            initialX: 800,
            translateX: 800,
            duration: 11,
            repeatDelay: 2,
            className: "h-20",
        },
        {
            initialX: 1000,
            translateX: 1000,
            duration: 4,
            repeatDelay: 2,
            className: "h-12",
        },
        {
            initialX: 1200,
            translateX: 1200,
            duration: 6,
            repeatDelay: 4,
            delay: 2,
            className: "h-6",
        },
    ];

    return (
        <div
            className={cn(
                "absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden [mask-image:radial-gradient(circle,white,transparent)]",
                className
            )}
        >
            {beams.map((beam, idx) => (
                <CollisionMechanism
                    key={`beam-${idx}`}
                    beamOptions={beam}
                />
            ))}
        </div>
    );
};

const CollisionMechanism = ({
    beamOptions = {},
}: {
    beamOptions?: {
        initialX?: number;
        translateX?: number;
        initialY?: number;
        translateY?: number;
        rotate?: number;
        className?: string;
        duration?: number;
        delay?: number;
        repeatDelay?: number;
    };
}) => {
    const beamRef = useRef<HTMLDivElement>(null);
    const {
        initialX = 0,
        translateX = 0,
        initialY = 0,
        translateY = -200,
        rotate = 0,
        className = "",
        duration = 2,
        delay = 0,
        repeatDelay = 0,
    } = beamOptions;

    return (
        <motion.div
            ref={beamRef}
            animate={{
                translateY: [initialY, translateY],
                translateX: [initialX, translateX],
                rotate: [rotate, rotate],
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                delay: delay,
                repeatDelay: repeatDelay,
            }}
            className={cn(
                "absolute left-0 top-20 m-auto h-14 w-px rounded-full bg-gradient-to-t from-emerald-500 via-purple-500 to-transparent",
                className
            )}
        />
    );
};
