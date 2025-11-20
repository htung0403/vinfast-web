import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import CheckboxFilter from "./FilterPanel/CheckboxFilter";
import { ref, get } from "firebase/database";
import { database } from "../firebase/config";

export default function FilterPanel({
  activeTab,
  filters,
  handleFilterChange,
  quickSelectValue,
  handleQuickDateSelect,
  availableFilters,
  userRole,
  hasActiveFilters,
  clearAllFilters,
  showMarkets = true,
  showPaymentMethodSearch = false,
}) {
  const panelRef = useRef(null);
  const [, forceUpdate] = useState({});

  // Refs cho các nút filter (declare hooks at top level to follow Rules of Hooks)
  const productsRef = useRef(null);
  const paymentRef = useRef(null);
  const teamsRef = useRef(null); // used as anchorRef for departments checkbox
  const marketsRef = useRef(null);
  const refs = useMemo(
    () => ({
      products: productsRef,
      payment: paymentRef,
      teams: teamsRef,
      markets: marketsRef,
    }),
    // refs themselves are stable refs, empty deps ok
    []
  );

  // local state for departments: if parent doesn't provide availableFilters.departments,
  // we will fetch unique departments from the `employees` node in RTDB
  const [localDepartments, setLocalDepartments] = useState(() => {
    const deps = availableFilters?.departments || [];
    // normalize to array of strings: availableFilters may supply objects {value,label}
    if (deps.length > 0 && typeof deps[0] === "object")
      return deps.map((d) => d.value ?? d.label ?? "");
    return deps;
  });

  useEffect(() => {
    // Don't fetch departments if on HopDong page (activeTab === "hopdong")
    if (activeTab === "hopdong") {
      return;
    }

    // if parent already supplies departments, don't fetch
    if (
      availableFilters &&
      Array.isArray(availableFilters.departments) &&
      availableFilters.departments.length > 0
    ) {
      setLocalDepartments(availableFilters.departments);
      return;
    }

    let cancelled = false;
    async function loadDepartments() {
      try {
        const snap = await get(ref(database, "employees"));
        if (!snap.exists()) return;
        const items = Object.values(snap.val());
        const unique = [
          ...new Set(
            items
              .map(
                (i) =>
                  i.phongBan || i["Phòng Ban"] || i.department || i["Bộ phận"]
              )
              .filter(Boolean)
          ),
        ].sort();

        if (!cancelled) {
          // store as array of strings to match CheckboxFilter expectation
          setLocalDepartments(unique);
        }
      } catch (err) {
        // fail silently; keep localDepartments as-is
        console.error("Error loading departments for filter panel:", err);
      }
    }

    loadDepartments();

    return () => {
      cancelled = true;
    };
  }, [availableFilters, activeTab]);

  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current?.contains(e.target) ||
        e.target.closest(".filter-panel-portal")
      )
        return;
      window.filterPanelState.setOpenDropdown(null);
    };
    const updateHandler = () => forceUpdate({});
    document.addEventListener("mousedown", handler);
    document.addEventListener("filter-panel-update", updateHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("filter-panel-update", updateHandler);
    };
  }, []);

  const handleToggle = useCallback(
    (key, value) => {
      const current = filters[key] || [];
      const newVal = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      handleFilterChange(key, newVal);
    },
    [filters, handleFilterChange]
  );

  return (
    <div className="w-full">
      <div
        ref={panelRef}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Bộ lọc</h3>
          </div>
          {hasActiveFilters?.() && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Horizontal Layout for Filters - All in one row */}
        <div className="flex flex-nowrap gap-4 items-center overflow-x-auto pb-2">
          {/* Tìm kiếm */}
          {activeTab !== "market" && (
            <div className="flex-shrink-0 flex items-center gap-2">
              <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                Tìm kiếm:
              </label>
              <div className="relative" style={{ minWidth: '200px' }}>
                <input
                  type="text"
                  value={filters.searchText || ""}
                  onChange={(e) =>
                    handleFilterChange("searchText", e.target.value)
                  }
                  placeholder="Tìm kiếm"
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Ngày tháng */}
          {activeTab !== "users" && (
            <div className="flex-shrink-0 flex items-center gap-2" style={{ minWidth: '500px' }}>
              <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                Ngày tháng:
              </label>
              <div className="flex gap-2 items-center flex-1">
                <div className="flex-1">
                  <select
                    onChange={handleQuickDateSelect}
                    value={quickSelectValue || ""}
                    className="appearance-none w-full px-3 py-2 pr-8 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white shadow-sm hover:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Chọn nhanh --</option>
                    <optgroup label="Ngày">
                      <option value="today">Hôm nay</option>
                      <option value="yesterday">Hôm qua</option>
                    </optgroup>
                    <optgroup label="Tuần">
                      <option value="this-week">Tuần này</option>
                      <option value="last-week">Tuần trước</option>
                      <option value="next-week">Tuần sau</option>
                    </optgroup>
                    <optgroup label="Tháng">
                      <option value="this-month">Tháng này</option>
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={`month-${i + 1}`}>
                          Tháng {i + 1}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Quý">
                      {[1, 2, 3, 4].map((q) => (
                        <option key={q} value={`q${q}`}>
                          Quý {q}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    Từ:
                  </label>
                  <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      handleFilterChange("startDate", e.target.value)
                    }
                    className="px-2 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1">
                  <label className="text-xs font-medium text-gray-600 whitespace-nowrap">
                    Đến:
                  </label>
                  <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      handleFilterChange("endDate", e.target.value)
                    }
                    className="px-2 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Checkbox Filters */}
          <CheckboxFilter
            id="products"
            title="Dòng xe"
            anchorRef={refs.products}
            items={availableFilters.products || []}
            selected={filters.products || []}
            onToggle={(v) => handleToggle("products", v)}
            visible={activeTab !== "users"}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            }
          />

          <CheckboxFilter
            id="markets"
            title="Phương thức thanh toán"
            anchorRef={refs.markets}
            items={availableFilters.markets || []}
            selected={filters.markets || []}
            onToggle={(v) => handleToggle("markets", v)}
            visible={showMarkets && activeTab !== "users"}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />

          <CheckboxFilter
            id="paymentMethods"
            title="Thanh toán"
            anchorRef={refs.payment}
            items={availableFilters.paymentMethods || []}
            selected={
              Array.isArray(filters.paymentMethod) ? filters.paymentMethod : []
            }
            onToggle={(v) => handleToggle("paymentMethod", v)}
            visible={showPaymentMethodSearch}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            }
          />

          <CheckboxFilter
            id="departments"
            title="Phòng ban"
            anchorRef={refs.teams}
            items={
              localDepartments && localDepartments.length
                ? localDepartments
                : availableFilters?.departments || []
            }
            selected={filters.departments || []}
            onToggle={(v) => handleToggle("departments", v)}
            visible={userRole === "admin" && activeTab !== "hopdong" && activeTab !== "hopdongdaxuat"}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
