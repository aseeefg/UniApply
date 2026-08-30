import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";

// Button + checkbox-list panel, click-outside closes it.
export default function MultiSelectDropdown({ label, options, selected, onChange, panelAlign = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const toggleValue = (value) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  };

  const summary = selected.length ? `${label}: ${selected.join(", ")}` : label;

  return (
    <div className="dropdown" ref={ref}>
      <button
        type="button"
        className={`dropdown-trigger${selected.length ? " active" : ""}`}
        onClick={() => setOpen((p) => !p)}
      >
        {summary}
        {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      {open && (
        <div className={`dropdown-panel${panelAlign === "right" ? " dropdown-panel-right" : ""}`}>
          {options.map((value) => (
            <label className="dropdown-option" key={value}>
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => toggleValue(value)}
              />
              {value}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
