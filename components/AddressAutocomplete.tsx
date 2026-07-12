"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MapPin } from "lucide-react";

export type SelectedPlace = {
  address: string;
  lat: number;
  lon: number;
};

type Suggestion = {
  formatted: string;
  lat: number;
  lon: number;
  placeId: string;
};

type GeoapifyFeature = {
  properties: {
    formatted: string;
    lat: number;
    lon: number;
    place_id: string;
  };
};

/**
 * Address autocomplete backed by the Geoapify Autocomplete API (free tier, no
 * credit card). Restricted to South Africa. Emits both the formatted address
 * and its coordinates so the fare step can measure real driving distance.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
}: {
  value: string;
  onChange: (text: string) => void;
  onSelect: (place: SelectedPlace) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

  const fetchSuggestions = useCallback(
    async (text: string) => {
      if (!apiKey || text.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const url =
          `https://api.geoapify.com/v1/geocode/autocomplete` +
          `?text=${encodeURIComponent(text)}` +
          `&filter=countrycode:za&limit=5&format=json&apiKey=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        const results: Suggestion[] = (data.results ?? data.features ?? []).map(
          (r: GeoapifyFeature["properties"] | GeoapifyFeature) => {
            const p = "properties" in r ? r.properties : r;
            return { formatted: p.formatted, lat: p.lat, lon: p.lon, placeId: p.place_id };
          }
        );
        setSuggestions(results);
        setOpen(results.length > 0);
        setActive(-1);
      } catch {
        setSuggestions([]);
      }
    },
    [apiKey]
  );

  const handleChange = (text: string) => {
    onChange(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const choose = (s: Suggestion) => {
    onChange(s.formatted);
    onSelect({ address: s.formatted, lat: s.lat, lon: s.lon });
    setOpen(false);
    setSuggestions([]);
  };

  // Close on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, suggestions.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" && active >= 0) { e.preventDefault(); choose(suggestions[active]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  return (
    <div className="relative" ref={boxRef}>
      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
      <input
        value={value}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pl-9 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1B3A6B] focus:ring-2 focus:ring-[#1B3A6B]/10"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li key={s.placeId}>
              <button
                type="button"
                onClick={() => choose(s)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 transition
                  ${i === active ? "bg-[#1B3A6B]/5 text-[#1B3A6B]" : "text-slate-700 hover:bg-slate-50"}`}
              >
                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" />
                <span>{s.formatted}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
