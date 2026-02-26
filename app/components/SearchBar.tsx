"use client";

import { useEffect, useRef, useState } from "react";
import type { GlobeControls } from "./GlobeMap";

interface SearchResult {
  name: string;
  lat: number;
  lng: number;
  type: string;
}

interface SearchBarProps {
  controls: GlobeControls | null;
  onSearchResult: (name: string) => void;
}

export function SearchBar({ controls, onSearchResult }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    if (controls) {
      const flyHeight =
        result.type === "country"
          ? 2000000
          : result.type === "city"
            ? 80000
            : 30000;
      controls.flyTo(result.lng, result.lat, flyHeight);
    }
    const shortName = result.name.split(",")[0].trim();
    onSearchResult(shortName);
    setQuery(shortName);
    setIsOpen(false);
    setResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <svg
            className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="場所を検索..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-900/80 backdrop-blur-md border border-white/10 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
          />
          {isLoading && (
            <div className="absolute right-3">
              <div className="w-4 h-4 border-2 border-blue-400/40 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
          {!isLoading && query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 text-gray-400 hover:text-white transition-colors"
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
          )}
        </div>
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden z-50">
          {results.map((result, i) => (
            <button
              key={`${result.lat}-${result.lng}-${i}`}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
            >
              <svg
                className="w-4 h-4 text-blue-400 mt-0.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-sm text-gray-200 line-clamp-2 leading-tight">
                {result.name}
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen &&
        results.length === 0 &&
        !isLoading &&
        query.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl bg-gray-900/95 backdrop-blur-md border border-white/10 shadow-2xl z-50">
            <p className="px-4 py-3 text-sm text-gray-400">
              結果が見つかりませんでした
            </p>
          </div>
        )}
    </div>
  );
}
