import {
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Minus,
  Plus,
  Receipt,
  RefreshCcw,
  Search,
  Table2,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getBillingMenu,
  getBillingTables,
  getTableBill,
  addBillingItem,
  updateBillingItem,
  removeBillingItem,
  payTableBill,
} from "../../api/adminBillingApi";


function AdminDashboard() {
  const navigate = useNavigate();

  // ============================================================
  // STATE
  // ============================================================

  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] =
    useState(null);

  const [selectedBill, setSelectedBill] =
    useState(null);

  const [menu, setMenu] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [billLoading, setBillLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [menuSearch, setMenuSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("ALL");

  const [showAddItem, setShowAddItem] =
    useState(false);

  const [showPayConfirm, setShowPayConfirm] =
    useState(false);

  const [addingVariantId, setAddingVariantId] =
    useState(null);

  const [addedVariantId, setAddedVariantId] =
    useState(null);

  const [error, setError] =
    useState("");

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================


  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tablesData,
        menuData,
      ] = await Promise.all([
        getBillingTables(),
        getBillingMenu(),
      ]);

      setTables(tablesData);
      setMenu(menuData);

      if (tablesData.length > 0) {
        setSelectedTableId(
          (currentSelected) => {
            const stillExists =
              tablesData.some(
                (table) =>
                  table.id ===
                  currentSelected
              );

            return stillExists
              ? currentSelected
              : tablesData[0].id;
          }
        );
      } else {
        setSelectedTableId(null);
        setSelectedBill(null);
      }
    } catch (error) {
      console.error(
        "Failed to load dashboard:",
        error
      );

      setError(
        error.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================================
  // LOAD SELECTED TABLE BILL
  // ============================================================

  useEffect(() => {
    if (!selectedTableId) {
      setSelectedBill(null);
      return;
    }

    loadBill(selectedTableId);
  }, [selectedTableId]);

  const loadBill = async (tableId) => {
  try {
    setBillLoading(true);
    setError("");

    const bill = await getTableBill(tableId);

    setSelectedBill(
      bill || {
        id: null,
        tableId,
        tableNumber:
          tables.find((table) => table.id === tableId)?.tableNumber ?? null,
        status: "OPEN",
        totalAmount: 0,
        items: [],
      }
    );
  } catch (error) {
    console.error("Failed to load bill:", error);

    setError(
      error.message ||
        "Failed to load bill"
    );

    setSelectedBill({
      id: null,
      tableId,
      status: "OPEN",
      totalAmount: 0,
      items: [],
    });
  } finally {
    setBillLoading(false);
  }
};

  // ============================================================
  // REFRESH
  // ============================================================

  const refreshDashboard = async () => {
    await loadDashboard();

    if (selectedTableId) {
      await loadBill(
        selectedTableId
      );
    }
  };

  // ============================================================
  // SELECTED TABLE
  // ============================================================

  const selectedTable =
    tables.find(
      (table) =>
        table.id ===
        selectedTableId
    ) || null;

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = useMemo(() => {
    const map = new Map();

    menu.forEach((item) => {
      if (
        item.categoryId != null &&
        item.categoryName
      ) {
        map.set(
          String(item.categoryId),
          item.categoryName
        );
      }
    });

    return Array.from(
      map.entries()
    ).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [menu]);

  // ============================================================
  // FILTER MENU
  // ============================================================

  const filteredMenu = useMemo(() => {
    const query =
      menuSearch
        .trim()
        .toLowerCase();

    return menu.filter(
      (item) => {
        const matchesSearch =
          !query ||
          item.name
            ?.toLowerCase()
            .includes(query) ||
          item.variantName
            ?.toLowerCase()
            .includes(query);

        const matchesCategory =
          selectedCategory ===
            "ALL" ||
          String(
            item.categoryId
          ) ===
            String(
              selectedCategory
            );

        return (
          matchesSearch &&
          matchesCategory
        );
      }
    );
  }, [
    menu,
    menuSearch,
    selectedCategory,
  ]);

  // ============================================================
  // STATS
  // ============================================================

  const occupiedTables =
    tables.filter(
      (table) =>
        table.status ===
        "OCCUPIED"
    ).length;

  const activeBills =
    occupiedTables;

  const totalDineInRevenue =
    tables.reduce(
      (total, table) =>
        total +
        Number(
          table.bills?.find(
            (bill) =>
              bill.status ===
              "OPEN"
          )?.totalAmount || 0
        ),
      0
    );

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (
    amount
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }
    ).format(
      Number(amount || 0)
    );
  };

  // ============================================================
  // ADD ITEM
  // ============================================================

  const handleAddItem = async (item) => {
    if (!selectedTableId || addingVariantId != null) {
      return;
    }

    try {
      setAddingVariantId(item.variantId);
      setAddedVariantId(null);
      setError("");

      const bill = await addBillingItem(
        selectedTableId,
        item.variantId,
        1
      );

      setSelectedBill(bill);
      setAddedVariantId(item.variantId);

      await refreshTablesOnly();

      window.setTimeout(() => {
        setAddedVariantId((current) =>
          current === item.variantId ? null : current
        );
      }, 1200);
    } catch (error) {
      console.error("Failed to add item:", error);
      setError(error.message || "Failed to add item");
    } finally {
      setAddingVariantId(null);
    }
  };

  // ============================================================
  // REFRESH TABLES ONLY
  // ============================================================

  const refreshTablesOnly =
    async () => {
      try {
        const data =
          await getBillingTables();

        setTables(data);
      } catch (error) {
        console.error(
          "Failed to refresh tables:",
          error
        );
      }
    };

  // ============================================================
  // CHANGE QUANTITY
  // ============================================================

  const handleQuantityChange =
    async (
      item,
      change
    ) => {
      const newQuantity =
        item.quantity +
        change;

      if (
        newQuantity <= 0
      ) {
        await handleRemoveItem(
          item.id
        );

        return;
      }

      try {
        setActionLoading(true);
        setError("");

        const result =
          await updateBillingItem(
            item.id,
            newQuantity
          );

        await loadBill(
          selectedTableId
        );

        await refreshTablesOnly();
      } catch (error) {
        console.error(
          "Failed to update quantity:",
          error
        );

        setError(
          error.message ||
            "Failed to update quantity"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const handleRemoveItem =
    async (
      itemId
    ) => {
      try {
        setActionLoading(true);
        setError("");

        await removeBillingItem(
          itemId
        );

        await loadBill(
          selectedTableId
        );

        await refreshTablesOnly();
      } catch (error) {
        console.error(
          "Failed to remove item:",
          error
        );

        setError(
          error.message ||
            "Failed to remove item"
        );
      } finally {
        setActionLoading(false);
      }
    };

  // ============================================================
  // PAY BILL
  // ============================================================

  const handlePayBill = () => {
    if (
      !selectedTableId ||
      !selectedBill ||
      selectedBill.items?.length === 0
    ) {
      return;
    }

    setShowPayConfirm(true);
  };

  const confirmPayBill = async () => {
    if (!selectedTableId || !selectedBill) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setShowPayConfirm(false);

      await payTableBill(selectedTableId);
      await refreshTablesOnly();

      setSelectedBill({
        id: null,
        tableId: selectedTableId,
        tableNumber: selectedTable?.tableNumber,
        status: "OPEN",
        totalAmount: 0,
        items: [],
      });
    } catch (error) {
      console.error("Failed to pay bill:", error);
      setError(error.message || "Failed to pay bill");
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">
        <div className="text-center">
          <RefreshCcw
            size={28}
            className="mx-auto animate-spin text-[#D92323]"
          />

          <p className="mt-4 text-sm text-zinc-500">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b0b0b] px-3 py-4 text-white sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-[1500px]">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D92323]" />

              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ef4444]">
                Zoop Cafe
              </p>
            </div>

            <h1 className="heading-font mt-2 text-4xl uppercase tracking-wide text-white sm:text-5xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-400 sm:text-base">
              Manage dine-in tables,
              bills, orders, and menu
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={
              refreshDashboard
            }
            disabled={
              loading ||
              billLoading
            }
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
              disabled:opacity-50
              lg:self-auto
            "
          >
            <RefreshCcw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg hover:bg-red-500/10"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ======================================================
            STATS
        ====================================================== */}

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

          <DashboardStat
            title="Dine-in Tables"
            value={`${occupiedTables}/${tables.length}`}
            description="Currently occupied"
            icon={Table2}
          />

          <DashboardStat
            title="Active Bills"
            value={activeBills}
            description="Tables with pending bills"
            icon={Receipt}
          />

          <DashboardStat
            title="Dine-in Total"
            value={`₹${formatMoney(
              totalDineInRevenue
            )}`}
            description="Current open bills"
            icon={IndianRupee}
          />

          <DashboardStat
            title="Menu Variants"
            value={menu.length}
            description="Available billing items"
            icon={UtensilsCrossed}
          />

        </div>

        {/* ======================================================
            DINE-IN
        ====================================================== */}

        <section className="mt-8">

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D92323]">
                Dine-in
              </p>

              <h2 className="heading-font mt-1 text-3xl uppercase text-white">
                Table Billing
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Select a table and
                manage its active bill.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              {occupiedTables} active{" "}
              {occupiedTables === 1
                ? "table"
                : "tables"}
            </div>

          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_420px]">

            {/* ==================================================
                TABLES
            ================================================== */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {tables.map(
                (table) => {
                  const isSelected =
                    table.id ===
                    selectedTableId;

                  const occupied =
                    table.status ===
                    "OCCUPIED";

                  const openBill =
                    table.bills?.find(
                      (bill) =>
                        bill.status ===
                        "OPEN"
                    );

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() =>
                        setSelectedTableId(
                          table.id
                        )
                      }
                      className={`
                        relative
                        min-h-[140px]
                        rounded-2xl
                        border
                        p-3.5
                        sm:min-h-[155px]
                        sm:p-4
                        text-left
                        transition
                        ${
                          isSelected
                            ? "border-[#D92323] bg-[#D92323]/10 shadow-lg shadow-red-950/20"
                            : "border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#141414]"
                        }
                      `}
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                          <Table2
                            size={19}
                          />
                        </div>

                        <span
                          className={`
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            px-2
                            py-1
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wide
                            ${
                              occupied
                                ? "bg-red-500/10 text-red-300"
                                : "bg-emerald-500/10 text-emerald-300"
                            }
                          `}
                        >
                          <span
                            className={`
                              h-1.5
                              w-1.5
                              rounded-full
                              ${
                                occupied
                                  ? "bg-red-400"
                                  : "bg-emerald-400"
                              }
                            `}
                          />

                          {occupied
                            ? "Occupied"
                            : "Empty"}
                        </span>

                      </div>

                      <p className="mt-5 text-lg font-bold text-white">
                        Table{" "}
                        {
                          table.tableNumber
                        }
                      </p>

                      {openBill ? (
                        <>
                          <p className="mt-1 text-xs text-zinc-500">
                            {openBill.totalAmount
                              ? "Active bill"
                              : "No items"}
                          </p>

                          <p className="mt-3 text-lg font-bold text-[#ef4444]">
                            ₹
                            {formatMoney(
                              openBill.totalAmount
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="mt-1 text-xs text-zinc-600">
                          No active bill
                        </p>
                      )}

                    </button>
                  );
                }
              )}

              {tables.length ===
                0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-white/10 py-16 text-center">
                  <Table2
                    size={30}
                    className="mx-auto text-zinc-700"
                  />

                  <p className="mt-3 text-sm text-zinc-500">
                    No tables created.
                  </p>
                </div>
              )}

            </div>

            {/* ==================================================
                BILL
            ================================================== */}

            <div className="rounded-2xl border border-white/10 bg-[#111111] shadow-xl shadow-black/20">

              {/* Bill header */}

              <div className="border-b border-white/10 p-5">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#D92323]">
                      Current Bill
                    </p>

                    <h3 className="heading-font mt-1 text-2xl uppercase text-white">
                      Table{" "}
                      {selectedTable
                        ?.tableNumber ??
                        "—"}
                    </h3>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D92323]/10 text-[#ef4444]">
                    <Receipt
                      size={21}
                    />
                  </div>

                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">

                  <span>
                    {selectedBill?.items
                      ?.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          item.quantity,
                        0
                      ) || 0}{" "}
                    total items
                  </span>

                  <span
                    className={
                      selectedBill
                        ?.items
                        ?.length
                        ? "text-red-400"
                        : "text-emerald-400"
                    }
                  >
                    {selectedBill
                      ?.items
                      ?.length
                      ? "Bill active"
                      : "Table empty"}
                  </span>

                </div>

              </div>

              {/* Bill body */}

              <div className="max-h-[430px] overflow-y-auto">

                {billLoading ? (
                  <div className="flex min-h-[260px] items-center justify-center">
                    <RefreshCcw
                      size={24}
                      className="animate-spin text-[#D92323]"
                    />
                  </div>
                ) : !selectedTable ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">
                    <Table2
                      size={28}
                      className="text-zinc-700"
                    />

                    <p className="mt-3 text-sm text-zinc-500">
                      Create a table to
                      start billing.
                    </p>
                  </div>
                ) : selectedBill
                    ?.items
                    ?.length ===
                  0 ? (
                  <div className="flex min-h-[260px] flex-col items-center justify-center px-5 text-center">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
                      <Receipt
                        size={25}
                      />
                    </div>

                    <p className="mt-4 text-sm font-semibold text-zinc-300">
                      No items added
                    </p>

                    <p className="mt-1 max-w-[240px] text-xs leading-5 text-zinc-600">
                      Add food and drinks
                      to start this
                      table's bill.
                    </p>

                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">

                    {selectedBill?.items?.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-white">
                                {
                                  item.itemName
                                }
                              </p>

                              {item.variantName && (
                                <p className="mt-0.5 text-[11px] text-zinc-600">
                                  {
                                    item.variantName
                                  }
                                </p>
                              )}

                              <p className="mt-1 text-xs text-zinc-500">
                                ₹
                                {formatMoney(
                                  item.unitPrice
                                )}{" "}
                                each
                              </p>

                            </div>

                            <p className="shrink-0 text-sm font-bold text-white">
                              ₹
                              {formatMoney(
                                item.totalPrice
                              )}
                            </p>

                          </div>

                          <div className="mt-3 flex items-center justify-between">

                            <div className="flex items-center rounded-lg border border-white/10 bg-[#0b0b0b]">

                              <button
                                type="button"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    -1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:text-white disabled:opacity-30"
                              >
                                <Minus
                                  size={14}
                                />
                              </button>

                              <span className="w-8 text-center text-xs font-semibold text-white">
                                {
                                  item.quantity
                                }
                              </span>

                              <button
                                type="button"
                                disabled={
                                  actionLoading ||
                                  item.quantity >=
                                    100
                                }
                                onClick={() =>
                                  handleQuantityChange(
                                    item,
                                    1
                                  )
                                }
                                className="flex h-8 w-8 items-center justify-center text-zinc-500 transition hover:text-white disabled:opacity-30"
                              >
                                <Plus
                                  size={14}
                                />
                              </button>

                            </div>

                            <button
                              type="button"
                              disabled={
                                actionLoading
                              }
                              onClick={() =>
                                handleRemoveItem(
                                  item.id
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* Bill footer */}

              <div className="border-t border-white/10 p-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm text-zinc-500">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-white">
                    ₹
                    {formatMoney(
                      selectedBill
                        ?.totalAmount
                    )}
                  </span>

                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    disabled={
                      !selectedTable
                    }
                    onClick={() =>
                      setShowAddItem(
                        true
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-[#D92323]
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-[#ef2a2a]
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <Plus
                      size={17}
                    />
                    Add Items
                  </button>

                  <button
                    type="button"
                    disabled={
                      actionLoading ||
                      !selectedBill ||
                      selectedBill.items
                        ?.length ===
                        0
                    }
                    onClick={
                      handlePayBill
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      bg-[#161616]
                      px-4
                      py-3
                      text-sm
                      font-semibold
                      text-zinc-300
                      transition
                      hover:border-emerald-500/30
                      hover:bg-emerald-500/10
                      hover:text-emerald-300
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                  >
                    <CheckCircle2
                      size={17}
                    />

                    <span>
                      Paid
                    </span>
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ======================================================
            MANAGEMENT
        ====================================================== */}

        <section className="mt-10">

          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D92323]">
              Management
            </p>

            <h2 className="heading-font mt-1 text-2xl uppercase text-white">
              Cafe Management
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">

            <ManagementCard
              title="Manage Orders"
              description="View and update online customer orders."
              path="/admin/orders"
              navigate={navigate}
            />

            <ManagementCard
              title="Manage Menu"
              description="Add, edit, or remove menu items."
              path="/admin/menu"
              navigate={navigate}
            />

            <ManagementCard
              title="Manage Combos"
              description="Create and update food combos."
              path="/admin/combos"
              navigate={navigate}
            />

            <ManagementCard
              title="Manage Reviews"
              description="View and manage customer reviews."
              path="/admin/reviews"
              navigate={navigate}
            />

          </div>

        </section>

      </div>

      {/* ========================================================
          PAY CONFIRMATION MODAL
      ======================================================== */}

      {showPayConfirm && selectedBill && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5">
          <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#111111] shadow-2xl sm:rounded-3xl">
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D92323]">
                    Payment
                  </p>
                  <h2 className="heading-font mt-1 text-2xl uppercase text-white">
                    Mark as Paid?
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPayConfirm(false)}
                  disabled={actionLoading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b0b0b] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Table</span>
                  <span className="font-semibold text-white">{selectedTable?.tableNumber}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-zinc-500">Bill total</span>
                  <span className="text-xl font-bold text-white">
                    ₹{formatMoney(selectedBill.totalAmount)}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-500">
                This will close the current bill and make the table available again.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowPayConfirm(false)}
                  disabled={actionLoading}
                  className="rounded-xl border border-white/10 bg-[#161616] px-4 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmPayBill}
                  disabled={actionLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={17} />
                  {actionLoading ? "Processing..." : "Mark as Paid"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          ADD ITEM MODAL
      ======================================================== */}

      {showAddItem && (
        <AddItemModal
          menu={filteredMenu}
          categories={categories}
          loading={loading}
          search={menuSearch}
          setSearch={setMenuSearch}
          selectedCategory={
            selectedCategory
          }
          setSelectedCategory={
            setSelectedCategory
          }
          onAdd={handleAddItem}
          actionLoading={
            actionLoading
          }
          addingVariantId={
            addingVariantId
          }
          addedVariantId={
            addedVariantId
          }
          onClose={() => {
            setShowAddItem(
              false
            );
          }}
        />
      )}

    </main>
  );
}

export default AdminDashboard;


// ====================================================================
// DASHBOARD STAT
// ====================================================================

function DashboardStat({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-4 shadow-lg shadow-black/10 sm:p-5">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="text-xs font-medium text-zinc-500">
            {title}
          </p>

          <p className="heading-font mt-2 text-2xl text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D92323]/10 text-[#ef4444]">
          <Icon size={18} />
        </div>

      </div>

      <p className="mt-3 text-[11px] text-zinc-600">
        {description}
      </p>

    </div>
  );
}


// ====================================================================
// MANAGEMENT CARD
// ====================================================================

function ManagementCard({
  title,
  description,
  path,
  navigate,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        navigate(path)
      }
      className="
        group
        flex
        w-full
        items-center
        justify-between
        rounded-2xl
        border
        border-white/10
        bg-[#111111]
        p-5
        text-left
        transition
        hover:border-[#D92323]/40
        hover:bg-[#141414]
      "
    >

      <div>
        <p className="font-semibold text-white">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-zinc-600 transition group-hover:bg-[#D92323]/10 group-hover:text-[#ef4444]">
        <ArrowRight
          size={17}
          className="transition group-hover:translate-x-1"
        />
      </div>

    </button>
  );
}


// ====================================================================
// ADD ITEM MODAL
// ====================================================================

function AddItemModal({
  menu,
  categories,
  loading,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  onAdd,
  actionLoading,
  addingVariantId,
  addedVariantId,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-5">

      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#111111] shadow-2xl sm:rounded-3xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">

          <div>
            <p className="text-xs uppercase tracking-widest text-[#D92323]">
              Add to bill
            </p>

            <h2 className="heading-font mt-1 text-2xl uppercase text-white">
              Select Items
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <X size={18} />
          </button>

        </div>

        {/* Search */}

        <div className="border-b border-white/10 p-4">

          <div className="relative">

            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search menu..."
              autoFocus
              className="
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#0b0b0b]
                py-3
                pl-11
                pr-4
                text-sm
                text-white
                outline-none
                placeholder:text-zinc-700
                focus:border-red-500/40
              "
            />

          </div>

          {/* Categories */}

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">

            <CategoryButton
              active={
                selectedCategory ===
                "ALL"
              }
              onClick={() =>
                setSelectedCategory(
                  "ALL"
                )
              }
            >
              All
            </CategoryButton>

            {categories.map(
              (category) => (
                <CategoryButton
                  key={category.id}
                  active={
                    String(
                      selectedCategory
                    ) ===
                    String(
                      category.id
                    )
                  }
                  onClick={() =>
                    setSelectedCategory(
                      category.id
                    )
                  }
                >
                  {category.name}
                </CategoryButton>
              )
            )}

          </div>

        </div>

        {/* Items */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-5">

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center">
              <RefreshCcw
                size={24}
                className="animate-spin text-[#D92323]"
              />
            </div>
          ) : menu.length ===
            0 ? (
            <div className="py-16 text-center">

              <UtensilsCrossed
                size={30}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-3 text-sm text-zinc-500">
                No menu items found.
              </p>

            </div>
          ) : menu.length > 0 &&
            !menu.some(
              (item) =>
                filteredItem(
                  item,
                  search,
                  selectedCategory
                )
            ) ? (
            <div className="py-16 text-center">

              <Search
                size={30}
                className="mx-auto text-zinc-700"
              />

              <p className="mt-3 text-sm text-zinc-500">
                No matching items.
              </p>

            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {menu
                .filter(
                  (item) =>
                    filteredItem(
                      item,
                      search,
                      selectedCategory
                    )
                )
                .map(
                  (item) => (
                    <button
                      key={item.variantId}
                      type="button"
                      disabled={
                        addingVariantId ===
                        item.variantId
                      }
                      onClick={() =>
                        onAdd(item)
                      }
                      className="
                        group
                        rounded-2xl
                        border
                        border-white/10
                        bg-[#161616]
                        p-4
                        text-left
                        transition
                        hover:border-red-500/30
                        hover:bg-[#1a1a1a]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-white">
                            {item.name}
                          </p>

                          {item.variantName && (
                            <p className="mt-1 text-[11px] text-zinc-600">
                              {
                                item.variantName
                              }
                            </p>
                          )}

                        </div>

                        <div
                          className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg transition ${
                            addedVariantId === item.variantId
                              ? "bg-emerald-500/15 text-emerald-400"
                              : addingVariantId === item.variantId
                              ? "bg-[#D92323]/15 text-[#ef4444]"
                              : "bg-[#D92323]/10 text-[#ef4444] group-hover:bg-[#D92323] group-hover:text-white"
                          }`}
                        >
                          {addedVariantId === item.variantId ? (
                            <CheckCircle2 size={17} />
                          ) : addingVariantId === item.variantId ? (
                            <RefreshCcw size={16} className="animate-spin" />
                          ) : (
                            <Plus size={16} />
                          )}
                        </div>

                      </div>

                      <div className="mt-4 flex items-center justify-between">

                        <span className="text-sm font-bold text-white">
                          ₹
                          {new Intl.NumberFormat(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                              minimumFractionDigits: 2,
                            }
                          ).format(
                            Number(
                              item.price
                            )
                          )}
                        </span>

                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider ${
                            addedVariantId === item.variantId
                              ? "text-emerald-400"
                              : addingVariantId === item.variantId
                              ? "text-red-400"
                              : "text-zinc-700"
                          }`}
                        >
                          {addedVariantId === item.variantId
                            ? "Added"
                            : addingVariantId === item.variantId
                            ? "Adding..."
                            : item.type === "COMBO"
                            ? "Combo"
                            : "Add"}
                        </span>

                      </div>

                    </button>
                  )
                )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


// ====================================================================
// CATEGORY BUTTON
// ====================================================================

function CategoryButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        shrink-0
        rounded-full
        border
        px-3.5
        py-2
        text-xs
        font-semibold
        transition
        ${
          active
            ? "border-[#D92323] bg-[#D92323] text-white"
            : "border-white/10 bg-[#161616] text-zinc-500 hover:border-white/20 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}


// ====================================================================
// FILTER HELPER
// ====================================================================

function filteredItem(
  item,
  search,
  selectedCategory
) {
  const query =
    search
      .trim()
      .toLowerCase();

  const matchesSearch =
    !query ||
    item.name
      ?.toLowerCase()
      .includes(query) ||
    item.variantName
      ?.toLowerCase()
      .includes(query);

  const matchesCategory =
    selectedCategory ===
      "ALL" ||
    String(
      item.categoryId
    ) ===
      String(
        selectedCategory
      );

  return (
    matchesSearch &&
    matchesCategory
  );
}