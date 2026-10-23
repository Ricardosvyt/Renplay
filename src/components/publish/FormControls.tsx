import React from "react";

export const inputClass = "mt-2 w-full rounded-xl border border-[#29292F] bg-[#090A0F] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FFDE00] focus:ring-2 focus:ring-[#FFDE00]/10";
export const panelClass = "rounded-3xl border border-[#29292F] bg-[#12141D] p-5 shadow-xl sm:p-7";

export function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-[#29292F] pb-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-xs text-zinc-400">{description}</p>
    </div>
  );
}

export function Field({
  label,
  wide,
  required,
  type = "text",
  value,
  onChange,
  placeholder
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className={`block text-xs font-bold text-zinc-400 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        className={inputClass}
        placeholder={placeholder}
      />
    </label>
  );
}

export function TextArea({
  label,
  wide,
  required,
  rows,
  value,
  onChange,
  placeholder
}: {
  label: string;
  wide?: boolean;
  required?: boolean;
  rows: number;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
}) {
  return (
    <label className={`block text-xs font-bold text-zinc-400 ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <textarea
        required={required}
        rows={rows}
        value={value}
        onChange={onChange}
        className={`${inputClass} resize-y`}
        placeholder={placeholder}
      />
    </label>
  );
}

export function ChipEditor({
  title,
  values,
  setValues,
  input: value,
  setInput,
  add,
  placeholder
}: {
  title: string;
  values: string[];
  setValues: (values: string[]) => void;
  input: string;
  setInput: (value: string) => void;
  add: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-zinc-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setValues(values.filter((current) => current !== item))}
            className="rounded-lg border border-[#FFDE00]/30 bg-[#FFDE00]/10 px-3 py-2 text-xs font-bold text-[#FFDE00]"
          >
            {item} ×
          </button>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), add())}
          className={inputClass.replace("mt-2 ", "flex-1 ")}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={add}
          className="mt-2 rounded-xl border border-[#29292F] px-4 text-xs font-black text-white hover:border-[#FFDE00]"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}

export function StatusButton({
  active,
  title,
  description,
  onClick
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        active ? "border-[#FFDE00] bg-[#FFDE00]/10" : "border-[#29292F] bg-[#090A0F] hover:border-zinc-600"
      }`}
    >
      <span className={`block text-xs font-black ${active ? "text-[#FFDE00]" : "text-zinc-300"}`}>{title}</span>
      <span className="mt-1 block text-[11px] text-zinc-500">{description}</span>
    </button>
  );
}
