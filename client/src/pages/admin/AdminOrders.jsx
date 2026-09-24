import {
  Search,
  LoaderCircle,
  Package,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CheckCircle2,
  ChefHat,
  CircleCheck,
  XCircle,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

import { useEffect, useState } from "react";

import AdminOrderDetails from "./AdminOrderDetails";
import OrderStatusBadge from "../../components/admin/OrderStatusBadge";
import apiFetch from "../../api/apiClient";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_META = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    classes:
      "border-amber-500/20 bg-amber-500/10 text-amber-300 hover:border-amber-500/40 hover:bg-amber-500/15",
    activeClasses:
      "border-amber-500/40 bg-amber-500/20 text-amber-200 shadow-sm",
    dot: "bg-amber-400",
  },

  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    classes:
      "border-blue-500/20 bg-blue-500/10 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/15",
    activeClasses:
      "border-blue-500/40 bg-blue-500/20 text-blue-200 shadow-sm",
    dot: "bg-blue-400",
  },

  PREPARING: {
    label: "Preparing",
    icon: ChefHat,
    classes:
      "border-orange-500/20 bg-orange-500/10 text-orange-300 hover:border-orange-500/40 hover:bg-orange-500/15",
    activeClasses:
      "border-orange-500/40 bg-orange-500/20 text-orange-200 shadow-sm",
    dot: "bg-orange-400",
  },

  READY: {
    label: "Ready",
    icon: CircleCheck,
    classes:
      "border-violet-500/20 bg-violet-500/10 text-violet-300 hover:border-violet-500/40 hover:bg-violet-500/15",
    activeClasses:
      "border-violet-500/40 bg-violet-500/20 text-violet-200 shadow-sm",
    dot: "bg-violet-400",
  },

  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    classes:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/15",
    activeClasses:
      "border-emerald-500/40 bg-emerald-500/20 text-emerald-200 shadow-sm",
    dot: "bg-emerald-400",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    classes:
      "border-red-500/20 bg-red-500/10 text-red-300 hover:border-red-500/40 hover:bg-red-500/15",
    activeClasses:
      "border-red-500/40 bg-red-500/20 text-red-200 shadow-sm",
    dot: "bg-red-400",
  },
};

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.set("page", page);
      params.set("limit", 20);

      if (status) {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const response = await apiFetch(
        `/admin/orders?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch orders"
        );
      }

      setOrders(result.data || []);
      setPagination(result.pagination || null);
    } catch (error) {
      console.error(
        "Failed to fetch admin orders:",
        error
      );

      setError(
        error.message || "Failed to fetch orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, status, search]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (newStatus) => {
    setPage(1);
    setStatus(newStatus);
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === updatedOrder.id
          ? {
              ...order,
              status: updatedOrder.status,
              updatedAt: updatedOrder.updatedAt,
              totalAmount:
                updatedOrder.totalAmount,
            }
          : order
      )
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(Number(amount || 0));
  };

  const getStatusCount = (targetStatus) => {
    return orders.filter(
      (order) => order.status === targetStatus
    ).length;
  };

  const totalOrders =
    pagination?.totalItems ?? orders.length;

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-4 py-6 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1500px]">

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D92323]" />

              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ef4444]">
                Zoop Cafe
              </p>
            </div>

            <h1 className="heading-font mt-2 text-4xl uppercase tracking-wide text-white sm:text-5xl">
              Orders
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
              Manage incoming orders, track their progress,
              and quickly open any order for more details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              self-start
              rounded-xl
              border
              border-white/10
              bg-[#111111]
              px-4
              py-3
              text-sm
              font-medium
              text-zinc-300
              transition
              hover:border-red-500/30
              hover:bg-red-500/10
              hover:text-red-300
              disabled:cursor-not-allowed
              disabled:opacity-50
              lg:self-auto
            "
          >
            <RefreshCcw
              size={16}
              className={
                loading ? "animate-spin" : ""
              }
            />

            Refresh orders
          </button>
        </div>

        {/* ============================================================
            SUMMARY CARDS
        ============================================================ */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <SummaryCard
            label="Total"
            value={totalOrders}
            icon={ShoppingBag}
            accent="red"
          />

          <SummaryCard
            label="Pending"
            value={getStatusCount("PENDING")}
            icon={Clock3}
            accent="amber"
          />

          <SummaryCard
            label="Preparing"
            value={getStatusCount("PREPARING")}
            icon={ChefHat}
            accent="orange"
          />

          <SummaryCard
            label="Ready"
            value={getStatusCount("READY")}
            icon={CircleCheck}
            accent="violet"
          />

          <SummaryCard
            label="Completed"
            value={getStatusCount("COMPLETED")}
            icon={CheckCircle2}
            accent="emerald"
          />
        </div>

        {/* ============================================================
            SEARCH + FILTERS
        ============================================================ */}

        <div className="mt-7 rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-lg shadow-black/10 sm:p-5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-3 lg:flex-row"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-zinc-500
                "
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search customer, email, or order ID..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#0b0b0b]
                  py-3.5
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-zinc-600
                  focus:border-red-500/50
                  focus:ring-4
                  focus:ring-red-500/10
                "
              />
            </div>

            <button
              type="submit"
              className="
                inline-flex
                items-center
                justify-center
                rounded-xl
                bg-[#D92323]
                px-6
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-red-950/20
                transition
                hover:bg-[#ef2a2a]
                active:scale-[0.98]
              "
            >
              Search
            </button>
          </form>

          {/* STATUS FILTERS */}

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() =>
                handleStatusChange("")
              }
              className={`
                shrink-0
                rounded-full
                border
                px-4
                py-2
                text-xs
                font-semibold
                transition
                ${
                  status === ""
                    ? "border-[#D92323] bg-[#D92323] text-white shadow-lg shadow-red-950/20"
                    : "border-white/10 bg-[#161616] text-zinc-400 hover:border-white/20 hover:bg-[#1b1b1b] hover:text-white"
                }
              `}
            >
              All orders
            </button>

            {ORDER_STATUSES.map((statusOption) => {
              const meta =
                STATUS_META[statusOption];

              const Icon = meta.icon;

              const isActive =
                status === statusOption;

              return (
                <button
                  key={statusOption}
                  type="button"
                  onClick={() =>
                    handleStatusChange(
                      statusOption
                    )
                  }
                  className={`
                    inline-flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    px-3.5
                    py-2
                    text-xs
                    font-semibold
                    transition
                    ${
                      isActive
                        ? meta.activeClasses
                        : meta.classes
                    }
                  `}
                >
                  <Icon size={13} />

                  {meta.label}

                  {isActive && (
                    <span className="ml-0.5 opacity-80">
                      ({getStatusCount(statusOption)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================================================
            ERROR
        ============================================================ */}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <XCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-semibold text-red-200">
                Couldn't load orders
              </p>

              <p className="mt-1 text-red-300/80">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ============================================================
            LOADING
        ============================================================ */}

        {loading && (
          <div className="mt-6">
            <DesktopSkeleton />
          </div>
        )}

        {/* ============================================================
            EMPTY STATE
        ============================================================ */}

        {!loading &&
          !error &&
          orders.length === 0 && (
            <EmptyOrdersState
              hasFilters={
                Boolean(search.trim()) ||
                Boolean(status)
              }
              onClear={() => {
                setSearchInput("");
                setSearch("");
                setStatus("");
                setPage(1);
              }}
            />
          )}

        {/* ============================================================
            ORDERS
        ============================================================ */}

        {!loading &&
          !error &&
          orders.length > 0 && (
            <>
              {/* DESKTOP TABLE */}

              <div className="mt-6 hidden overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/20 lg:block">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Recent orders
                    </h2>

                    <p className="mt-0.5 text-xs text-zinc-500">
                      Click any order to view full details.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
                    Live order data
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#161616]/80 text-left">
                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Order
                        </th>

                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Customer
                        </th>

                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Items
                        </th>

                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Amount
                        </th>

                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Status
                        </th>

                        <th className="px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          Created
                        </th>

                        <th className="w-12 px-4 py-3.5" />
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <DesktopOrderRow
                          key={order.id}
                          order={order}
                          onClick={() =>
                            setSelectedOrderId(
                              order.id
                            )
                          }
                          formatTime={formatTime}
                          formatMoney={formatMoney}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MOBILE */}

              <div className="mt-5 space-y-3 lg:hidden">
                {orders.map((order) => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onClick={() =>
                      setSelectedOrderId(
                        order.id
                      )
                    }
                    formatTime={formatTime}
                    formatMoney={formatMoney}
                  />
                ))}
              </div>
            </>
          )}

        {/* ============================================================
            PAGINATION
        ============================================================ */}

        {!loading &&
          !error &&
          pagination &&
          pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              page={page}
              setPage={setPage}
            />
          )}
      </div>

      {/* ==============================================================
          ORDER DETAILS
      ============================================================== */}

      {selectedOrderId && (
        <AdminOrderDetails
          orderId={selectedOrderId}
          onClose={() =>
            setSelectedOrderId(null)
          }
          onOrderUpdated={
            handleOrderUpdated
          }
        />
      )}
    </main>
  );
}

export default AdminOrders;

/* ====================================================================
   SUMMARY CARD
==================================================================== */

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent,
}) {
  const styles = {
    red: {
      icon: "bg-red-500/10 text-red-400",
      value: "text-red-400",
    },

    amber: {
      icon: "bg-amber-500/10 text-amber-400",
      value: "text-amber-400",
    },

    orange: {
      icon: "bg-orange-500/10 text-orange-400",
      value: "text-orange-400",
    },

    violet: {
      icon: "bg-violet-500/10 text-violet-400",
      value: "text-violet-400",
    },

    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400",
      value: "text-emerald-400",
    },
  };

  const style =
    styles[accent] || styles.red;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-lg shadow-black/10 transition hover:border-white/15 hover:bg-[#131313] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {label}
          </p>

          <p
            className={`
              mt-2
              text-2xl
              font-bold
              tracking-tight
              ${style.value}
            `}
          >
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${style.icon}
          `}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   DESKTOP ORDER ROW
==================================================================== */

function DesktopOrderRow({
  order,
  onClick,
  formatTime,
  formatMoney,
}) {
  const itemCount =
    order.items?.length || 0;

  const customerName =
    order.customer?.name ||
    "Unknown customer";

  const customerEmail =
    order.customer?.email ||
    "No email available";

  return (
    <tr
      onClick={onClick}
      className="
        group
        cursor-pointer
        border-b
        border-white/[0.06]
        transition
        last:border-none
        hover:bg-white/[0.025]
      "
    >
      {/* Order */}

      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-sm font-bold text-red-400 transition group-hover:bg-[#D92323] group-hover:text-white">
            #
          </div>

          <div>
            <p className="font-semibold text-white">
              #{order.id}
            </p>

            <p className="mt-0.5 text-xs text-zinc-600">
              Order ID
            </p>
          </div>
        </div>
      </td>

      {/* Customer */}

      <td className="px-6 py-5">
        <p className="max-w-[190px] truncate text-sm font-medium text-zinc-200">
          {customerName}
        </p>

        <p className="mt-1 max-w-[210px] truncate text-xs text-zinc-500">
          {customerEmail}
        </p>
      </td>

      {/* Items */}

      <td className="px-6 py-5">
        <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0b0b0b] px-2.5 py-1.5">
          <Package
            size={14}
            className="text-zinc-500"
          />

          <span className="text-xs font-semibold text-zinc-400">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </span>
        </div>
      </td>

      {/* Amount */}

      <td className="px-6 py-5">
        <p className="text-sm font-bold text-white">
          ₹{formatMoney(order.totalAmount)}
        </p>
      </td>

      {/* Status */}

      <td className="px-6 py-5">
        <OrderStatusBadge
          status={order.status}
        />
      </td>

      {/* Created */}

      <td className="px-6 py-5">
        <p className="text-sm font-medium text-zinc-300">
          {formatTime(order.createdAt)}
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          {new Intl.DateTimeFormat("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(
            new Date(order.createdAt)
          )}
        </p>
      </td>

      {/* Arrow */}

      <td className="px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 transition group-hover:bg-red-500/10 group-hover:text-red-400">
          <ArrowRight size={17} />
        </div>
      </td>
    </tr>
  );
}

/* ====================================================================
   MOBILE ORDER CARD
==================================================================== */

function MobileOrderCard({
  order,
  onClick,
  formatTime,
  formatMoney,
}) {
  const itemCount =
    order.items?.length || 0;

  const customerName =
    order.customer?.name ||
    "Unknown customer";

  const customerEmail =
    order.customer?.email ||
    "No email available";

  const meta =
    STATUS_META[order.status];

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        rounded-2xl
        border
        border-white/10
        bg-[#111111]
        p-4
        text-left
        shadow-lg
        shadow-black/10
        transition
        active:scale-[0.99]
        hover:border-red-500/30
        hover:bg-[#131313]
      "
    >
      {/* Top row */}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-sm font-bold text-red-400">
            #
          </div>

          <div>
            <p className="text-sm font-bold text-white">
              #{order.id}
            </p>

            <p className="text-[11px] text-zinc-600">
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div
          className={`
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            px-2.5
            py-1
            text-[11px]
            font-semibold
            ${meta?.classes || ""}
          `}
        >
          <span
            className={`
              h-1.5
              w-1.5
              rounded-full
              ${meta?.dot || "bg-zinc-500"}
            `}
          />

          {meta?.label || order.status}
        </div>
      </div>

      {/* Customer */}

      <div className="mt-4">
        <p className="truncate text-sm font-semibold text-zinc-200">
          {customerName}
        </p>

        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {customerEmail}
        </p>
      </div>

      {/* Bottom information */}

      <div className="mt-4 flex items-end justify-between border-t border-white/[0.06] pt-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            Order total
          </p>

          <p className="mt-1 text-lg font-bold text-white">
            ₹{formatMoney(order.totalAmount)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
            Items
          </p>

          <p className="mt-1 text-sm font-semibold text-zinc-400">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b0b0b] text-zinc-600 transition group-hover:bg-red-500/10 group-hover:text-red-400">
          <ArrowRight size={16} />
        </div>
      </div>
    </button>
  );
}

/* ====================================================================
   EMPTY STATE
==================================================================== */

function EmptyOrdersState({
  hasFilters,
  onClear,
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-white/10 bg-[#111111] px-5 py-16 text-center shadow-lg shadow-black/10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#161616] text-zinc-600">
        <Package size={28} />
      </div>

      <h2 className="mt-5 text-lg font-bold text-white">
        {hasFilters
          ? "No matching orders"
          : "No orders yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        {hasFilters
          ? "Try changing your search or status filter to find other orders."
          : "Orders placed by customers will appear here automatically."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-5
            rounded-xl
            bg-[#D92323]
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-[#ef2a2a]
          "
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

/* ====================================================================
   LOADING SKELETON
==================================================================== */

function DesktopSkeleton() {
  return (
    <>
      {/* Desktop */}

      <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-lg shadow-black/10 lg:block">
        <div className="border-b border-white/10 bg-[#161616] px-6 py-4">
          <div className="h-4 w-32 animate-pulse rounded bg-white/10" />
        </div>

        <div className="divide-y divide-white/[0.06]">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1.2fr_1.5fr_1fr_1fr_1.2fr_1.2fr_40px] items-center gap-5 px-6 py-5"
              >
                <SkeletonBlock width="100px" />
                <SkeletonBlock width="150px" />
                <SkeletonBlock width="70px" />
                <SkeletonBlock width="80px" />
                <SkeletonBlock width="95px" />
                <SkeletonBlock width="100px" />
                <SkeletonBlock width="25px" />
              </div>
            )
          )}
        </div>
      </div>

      {/* Mobile */}

      <div className="space-y-3 lg:hidden">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-lg shadow-black/10"
            >
              <div className="flex justify-between">
                <SkeletonBlock width="100px" />
                <SkeletonBlock width="80px" />
              </div>

              <div className="mt-5">
                <SkeletonBlock width="150px" />

                <div className="mt-2">
                  <SkeletonBlock width="190px" />
                </div>
              </div>

              <div className="mt-5 flex justify-between">
                <SkeletonBlock width="80px" />
                <SkeletonBlock width="55px" />
                <SkeletonBlock width="35px" />
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

function SkeletonBlock({ width }) {
  return (
    <div
      className="h-4 animate-pulse rounded-md bg-white/[0.07]"
      style={{ width }}
    />
  );
}

/* ====================================================================
   PAGINATION
==================================================================== */

function Pagination({
  pagination,
  page,
  setPage,
}) {
  const currentPage =
    pagination.page || page;

  const totalPages =
    pagination.totalPages || 1;

  return (
    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111111] px-4 py-4 shadow-lg shadow-black/10 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="text-sm font-medium text-zinc-300">
          Page {currentPage} of{" "}
          {totalPages}
        </p>

        {pagination.totalItems != null && (
          <p className="mt-0.5 text-xs text-zinc-600">
            {pagination.totalItems} total orders
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={
            !pagination.hasPreviousPage
          }
          onClick={() =>
            setPage((currentPage) =>
              Math.max(
                1,
                currentPage - 1
              )
            )
          }
          className="
            inline-flex
            h-10
            items-center
            gap-1.5
            rounded-xl
            border
            border-white/10
            bg-[#161616]
            px-3
            text-sm
            font-medium
            text-zinc-400
            transition
            hover:border-white/20
            hover:bg-[#1b1b1b]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronLeft size={16} />

          <span className="hidden sm:inline">
            Previous
          </span>
        </button>

        <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-[#D92323] px-3 text-sm font-semibold text-white shadow-lg shadow-red-950/20">
          {currentPage}
        </div>

        <button
          type="button"
          disabled={
            !pagination.hasNextPage
          }
          onClick={() =>
            setPage(
              (currentPage) =>
                currentPage + 1
            )
          }
          className="
            inline-flex
            h-10
            items-center
            gap-1.5
            rounded-xl
            border
            border-white/10
            bg-[#161616]
            px-3
            text-sm
            font-medium
            text-zinc-400
            transition
            hover:border-white/20
            hover:bg-[#1b1b1b]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <span className="hidden sm:inline">
            Next
          </span>

          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}