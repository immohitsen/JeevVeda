"use client";
import { AsciiArt } from "@/components/ui/ascii-art";
import mohit from "../../public/images/mohit.png"
import anurag from "../../public/images/anurag.png"

export function AsciiArtDemo() {
    return (
        <div className="flex">
            <AsciiArt
                src={mohit.src}
                resolution={100}
                color="var(--color-neutral-200)"
                animationStyle="fade"
                animationDuration={1.5}
                animateOnView={false}
                className="aspect-square w-[400px] max-w-lg bg-neutral-950"
            />
            <AsciiArt
                src={anurag.src}
                resolution={100}
                color="var(--color-neutral-200)"
                animationStyle="fade"
                animationDuration={1.5}
                animateOnView={false}
                className="aspect-square w-[400px] max-w-lg bg-neutral-950 ml-[-50px]"
            />
        </div>
    );
}
