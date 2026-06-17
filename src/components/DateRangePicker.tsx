"use client";

import React from "react";

export type DateRangeValue = {
  from: string; // "YYYY-MM-DD"
  to: string;   // "YYYY-MM-DD"
};

export type DateRangePickerProps = {
  value?: DateRangeValue;
  onChange?: (value: DateRangeValue) => void;
  /** Optional label used as the empty-state placeholder. */
  placeholder?: string;
  /** Extra class on the trigger button. */
  className?: string;
};

// ─── Helpers ────────────────────────────────────────────────────

const pad = (n: number) => n.toString().padStart(2, "0");

/** Format Date → "YYYY-MM-DD" (the value shape `<input type=date>` uses). */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Format "YYYY-MM-DD" → "D/M/YYYY" (Lao-style display). */
function displayDate(iso: string | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}/${Number(m)}/${y}`;
}

/** Monday-anchored week. Returns [Mon..Fri] for the given date. */
function weekRange(base: Date, weeksOffset = 0): DateRangeValue {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  // JS getDay(): 0=Sun..6=Sat. Convert so Monday = 0.
  const dow = (d.getDay() + 6) % 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - dow + weeksOffset * 7);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { from: toISODate(monday), to: toISODate(friday) };
}

function monthRange(base: Date, monthsOffset = 0): DateRangeValue {
  const start = new Date(base.getFullYear(), base.getMonth() + monthsOffset, 1);
  const end = new Date(base.getFullYear(), base.getMonth() + monthsOffset + 1, 0);
  return { from: toISODate(start), to: toISODate(end) };
}

function yearRange(base: Date, yearsOffset = 0): DateRangeValue {
  const y = base.getFullYear() + yearsOffset;
  return { from: toISODate(new Date(y, 0, 1)), to: toISODate(new Date(y, 11, 31)) };
}

function singleDay(date: Date): DateRangeValue {
  return { from: toISODate(date), to: toISODate(date) };
}

/** Returns the default value used when none is provided — current week (Mon–Fri). */
export function defaultThisWeek(): DateRangeValue {
  return weekRange(new Date(), 0);
}

// ─── Component ──────────────────────────────────────────────────

export default function DateRangePicker({
  value,
  onChange,
  placeholder = "ເລືອກວັນທີ",
  className = "",
}: DateRangePickerProps) {
  const initial = value ?? defaultThisWeek();
  const [open, setOpen] = React.useState(false);
  const [draftFrom, setDraftFrom] = React.useState(initial.from);
  const [draftTo, setDraftTo] = React.useState(initial.to);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  // Whenever the parent value changes, sync the draft.
  React.useEffect(() => {
    if (value) {
      setDraftFrom(value.from);
      setDraftTo(value.to);
    }
  }, [value]);

  // On first mount, if no external value, push the default up so the parent
  // is in sync. (Skip when controlled.)
  React.useEffect(() => {
    if (!value && onChange) onChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = () => {
    setDraftFrom(value?.from ?? initial.from);
    setDraftTo(value?.to ?? initial.to);
    setActivePreset(null);
    setOpen(true);
  };

  const apply = () => {
    if (!draftFrom || !draftTo) return;
    onChange?.({ from: draftFrom, to: draftTo });
    setOpen(false);
  };

  const cancel = () => setOpen(false);

  const applyPreset = (key: string, r: DateRangeValue) => {
    setActivePreset(key);
    setDraftFrom(r.from);
    setDraftTo(r.to);
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const triggerLabel = value
    ? `${displayDate(value.from)} - ${displayDate(value.to)}`
    : placeholder;

  const presets: { key: string; label: string; range: () => DateRangeValue }[] = [
    { key: "today", label: "ມື້ນີ້", range: () => singleDay(new Date()) },
    {
      key: "yesterday",
      label: "ມື້ວານນີ້",
      range: () => {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return singleDay(d);
      },
    },
    { key: "this_week", label: "ອາທິດນີ້", range: () => weekRange(new Date(), 0) },
    { key: "last_week", label: "ອາທິດກ່ອນ", range: () => weekRange(new Date(), -1) },
    { key: "this_month", label: "ເດືອນນີ້", range: () => monthRange(new Date(), 0) },
    { key: "last_month", label: "ເດືອນກ່ອນ", range: () => monthRange(new Date(), -1) },
    { key: "this_year", label: "ປີນີ້", range: () => yearRange(new Date(), 0) },
    { key: "last_year", label: "ປີທີ່ແລ້ວ", range: () => yearRange(new Date(), -1) },
  ];

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={openModal}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M16 3v4M8 3v4M3 11h18" />
        </svg>
        <span>{triggerLabel}</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={cancel}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 text-center">
              <div className="text-base font-semibold text-gray-900">
                {displayDate(draftFrom)} - {displayDate(draftTo)}
              </div>
            </div>

            {/* From/To inputs */}
            <div className="px-6 pb-4 flex items-center gap-2">
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => {
                  setDraftFrom(e.target.value);
                  setActivePreset(null);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="px-2 text-gray-500 text-sm">ຫາ</span>
              <input
                type="date"
                value={draftTo}
                onChange={(e) => {
                  setDraftTo(e.target.value);
                  setActivePreset(null);
                }}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Presets */}
            <div className="px-6 pb-4 grid grid-cols-4 gap-2">
              {presets.map((p) => {
                const isActive = activePreset === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p.key, p.range())}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-800 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={cancel}
                className="px-4 py-3 rounded-lg bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300"
              >
                ຍົກເລີກ
              </button>
              <button
                type="button"
                onClick={apply}
                className="px-4 py-3 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
              >
                ຍືນຍັນ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
