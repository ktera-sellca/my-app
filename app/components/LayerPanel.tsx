"use client";

import { useState } from "react";
import type { GlobeControls } from "./GlobeMap";

interface LayerState {
  satellite: boolean;
  terrain: boolean;
  buildings: boolean;
  atmosphere: boolean;
  nightLights: boolean;
}

interface LayerPanelProps {
  controls: GlobeControls | null;
  hasToken: boolean;
}

export function LayerPanel({ controls, hasToken }: LayerPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [layers, setLayers] = useState<LayerState>({
    satellite: true,
    terrain: true,
    buildings: true,
    atmosphere: true,
    nightLights: false,
  });

  const toggle = (key: keyof LayerState) => {
    const newVal = !layers[key];
    setLayers((prev) => ({ ...prev, [key]: newVal }));

    if (!controls) return;
    if (key === "satellite") controls.toggleSatellite(newVal);
    if (key === "terrain") controls.toggleTerrain(newVal);
    if (key === "buildings") controls.toggleBuildings(newVal);
    if (key === "atmosphere") controls.toggleAtmosphere(newVal);
    if (key === "nightLights") controls.toggleNightLights(newVal);
  };

  const layerItems = [
    {
      key: "satellite" as const,
      label: "衛星画像",
      icon: (
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
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
          />
        </svg>
      ),
      requiresToken: false,
    },
    {
      key: "terrain" as const,
      label: "3D地形",
      icon: (
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
            d="M5 3l7 14 7-14"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 17h18"
          />
        </svg>
      ),
      requiresToken: true,
    },
    {
      key: "buildings" as const,
      label: "3D建物",
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
      requiresToken: true,
    },
    {
      key: "atmosphere" as const,
      label: "大気効果",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
          />
        </svg>
      ),
      requiresToken: false,
    },
    {
      key: "nightLights" as const,
      label: "夜景モード",
      icon: (
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
            d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
          />
        </svg>
      ),
      requiresToken: true,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 text-white text-sm hover:bg-gray-800/80 transition-all"
        title="レイヤー設定"
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
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <span className="hidden sm:inline">レイヤー</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-52 rounded-xl bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-2.5 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              レイヤー
            </p>
          </div>
          <div className="py-1">
            {layerItems.map((item) => {
              const disabled = item.requiresToken && !hasToken;
              const active = layers[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => !disabled && toggle(item.key)}
                  disabled={disabled}
                  className={`w-full flex items-center justify-between px-4 py-2.5 transition-colors ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={
                        active && !disabled ? "text-blue-400" : "text-gray-500"
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="text-sm text-gray-200">{item.label}</span>
                    {disabled && (
                      <span className="text-xs text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                        Ion必要
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-9 h-5 rounded-full transition-colors relative ${
                      active && !disabled ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        active && !disabled
                          ? "translate-x-4"
                          : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
