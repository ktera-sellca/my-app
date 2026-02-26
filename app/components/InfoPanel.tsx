"use client";

interface ClickInfo {
  lat: number;
  lng: number;
  height: number;
  name?: string;
}

interface InfoPanelProps {
  info: ClickInfo | null;
  onClose: () => void;
}

function formatDMS(
  decimal: number,
  posLabel: string,
  negLabel: string,
): string {
  const sign = decimal >= 0 ? posLabel : negLabel;
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(1);
  return `${deg}° ${min}' ${sec}" ${sign}`;
}

function formatHeight(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${m.toFixed(0)} m`;
}

export function InfoPanel({ info, onClose }: InfoPanelProps) {
  if (!info) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-300 rounded-2xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden w-72">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm font-semibold text-white">
            {info.name ? info.name : "選択した場所"}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-0.5"
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

      <div className="px-4 py-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-gray-400 mt-0.5 shrink-0">緯度</span>
          <span className="text-xs text-gray-200 font-mono text-right">
            {formatDMS(info.lat, "N", "S")}
            <span className="text-gray-500 ml-1">({info.lat.toFixed(6)}°)</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-gray-400 mt-0.5 shrink-0">経度</span>
          <span className="text-xs text-gray-200 font-mono text-right">
            {formatDMS(info.lng, "E", "W")}
            <span className="text-gray-500 ml-1">({info.lng.toFixed(6)}°)</span>
          </span>
        </div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs text-gray-400 mt-0.5 shrink-0">標高</span>
          <span className="text-xs text-gray-200 font-mono">
            {formatHeight(info.height)}
          </span>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="text-xs text-gray-500 bg-white/5 rounded-lg px-3 py-2 font-mono">
          {info.lat.toFixed(6)}, {info.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
}
