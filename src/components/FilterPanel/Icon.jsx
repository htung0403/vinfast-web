// src/components/filter-panel/Icon.jsx
export default function Icon({ children, className = "" }) {
  return (
    <div
      className={`w-4 h-4 rounded-lg flex items-center justify-center text-slate-500 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}