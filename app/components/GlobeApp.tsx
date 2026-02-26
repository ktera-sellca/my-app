"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { GlobeControls } from "./GlobeMap";
import { InfoPanel } from "./InfoPanel";
import { LayerPanel } from "./LayerPanel";
import { SearchBar } from "./SearchBar";
import { Toolbar } from "./Toolbar";

const GlobeMap = dynamic(
  () => import("./GlobeMap").then((m) => ({ default: m.GlobeMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">地球儀を読み込み中...</p>
        </div>
      </div>
    ),
  },
);

interface ClickInfo {
  lat: number;
  lng: number;
  height: number;
  name?: string;
}

const hasToken = Boolean(
  process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN &&
    process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN.length > 0,
);

export function GlobeApp() {
  const controlsRef = useRef<GlobeControls | null>(null);
  const [controls, setControls] = useState<GlobeControls | null>(null);
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [showTokenBanner, setShowTokenBanner] = useState(!hasToken);

  const handleReady = (c: GlobeControls) => {
    controlsRef.current = c;
    setControls(c);
  };

  const handleLocationClick = (lat: number, lng: number, height: number) => {
    setClickInfo({ lat, lng, height, name: searchName ?? undefined });
    setSearchName(null);
  };

  const handleSearchResult = (name: string) => {
    setSearchName(name);
    setClickInfo(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Globe canvas */}
      <GlobeMap onReady={handleReady} onLocationClick={handleLocationClick} />

      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-start gap-3 z-10 pointer-events-none">
        <div className="pointer-events-auto flex-1 max-w-md">
          <SearchBar controls={controls} onSearchResult={handleSearchResult} />
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          <LayerPanel controls={controls} hasToken={hasToken} />
        </div>
      </div>

      {/* Toolbar (zoom / home) */}
      <div className="absolute right-4 bottom-24 z-10">
        <Toolbar controls={controls} />
      </div>

      {/* Info panel */}
      <div className="absolute bottom-6 left-4 z-10">
        <InfoPanel info={clickInfo} onClose={() => setClickInfo(null)} />
      </div>

      {/* Cesium Ion token banner */}
      {showTokenBanner && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 w-full max-w-lg px-4">
          <div className="rounded-xl bg-amber-900/90 backdrop-blur-md border border-amber-500/30 shadow-2xl p-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-200">
                  Cesium Ion トークンが設定されていません
                </p>
                <p className="text-xs text-amber-300/80 mt-1">
                  衛星画像・3D地形・建物を有効にするには、
                  <a
                    href="https://ion.cesium.com/tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-amber-100"
                  >
                    cesium.com
                  </a>
                  で無料トークンを取得し、
                  <code className="bg-amber-900/60 px-1 rounded text-amber-200">
                    NEXT_PUBLIC_CESIUM_ION_TOKEN
                  </code>
                  を設定してください。現在は OpenStreetMap で表示しています。
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowTokenBanner(false)}
                className="text-amber-400 hover:text-amber-200 transition-colors shrink-0"
                aria-label="閉じる"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compass / coordinate indicator (bottom right) */}
      <div className="absolute bottom-6 right-4 z-10">
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-lg bg-gray-900/70 backdrop-blur-md border border-white/10 px-3 py-1.5">
            <p className="text-xs text-gray-400">
              {controls ? (
                <span>
                  左クリックで座標取得 · ドラッグで回転 · スクロールでズーム
                </span>
              ) : (
                <span className="animate-pulse">読み込み中...</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
