"use client";

import type { GlobeControls } from "./GlobeMap";

interface ToolbarProps {
  controls: GlobeControls | null;
}

export function Toolbar({ controls }: ToolbarProps) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 p-1 shadow-xl">
      <button
        type="button"
        onClick={() => controls?.zoomIn()}
        title="ズームイン"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      <button
        type="button"
        onClick={() => controls?.zoomOut()}
        title="ズームアウト"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M20 12H4"
          />
        </svg>
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      <button
        type="button"
        onClick={() => controls?.flyHome()}
        title="日本へ戻る"
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </button>

    </div>
  );
}
