import { createFileRoute } from "@tanstack/react-router";
import { StarMapScene } from "@/components/StarMapScene";
import { StarMapUI } from "@/components/StarMapUI";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Local Star Map" },
      { name: "description", content: "Retro-futuristic interactive 3D star map." },
    ],
  }),
});

function Index() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <div className="absolute inset-0">
        <StarMapScene />
      </div>
      <div className="pointer-events-none absolute inset-0">
        <StarMapUI />
      </div>
    </div>
  );
}
