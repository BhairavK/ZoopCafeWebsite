import {
  X,
  LoaderCircle,
  User,
  Mail,
  Calendar,
  Package,
  IndianRupee,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import OrderStatusBadge from
  "../../components/admin/OrderStatusBadge";

import apiFetch from
  "../../api/apiClient";


const ALLOWED_TRANSITIONS = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
  ],

  CONFIRMED: [
    "PREPARING",
    "CANCELLED",
  ],

  PREPARING: [
    "READY",
  ],

  READY: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};


function AdminOrderDetails({
  orderId,
  onClose,
  onOrderUpdated,
}) {
  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingStatus, setUpdatingStatus] =
    useState(false);


  /*
  |------------------------------------------------------------------
  | FETCH ORDER
  |------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await apiFetch(
            `/admin/orders/${orderId}`
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Failed to fetch order"
          );
        }

        setOrder(
          result.data
        );
      } catch (error) {
        console.error(
          "Failed to fetch order:",
          error
        );

        setError(
          error.message ||
          "Failed to fetch order"
        );
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);


  /*
  |------------------------------------------------------------------
  | UPDATE ORDER STATUS
  |------------------------------------------------------------------
  */

  const handleStatusChange =
    async (newStatus) => {
      if (!order) {
        return;
      }

      if (
        newStatus === order.status
      ) {
        return;
      }

      try {
        setUpdatingStatus(true);

        const response =
          await apiFetch(
            `/admin/orders/${order.id}/status`,
            {
              method: "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                status: newStatus,
              }),
            }
          );

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Failed to update order status"
          );
        }

        setOrder(
          (currentOrder) => ({
            ...currentOrder,

            status:
              result.data.status,

            updatedAt:
              result.data.updatedAt,

            totalAmount:
              result.data.totalAmount,
          })
        );

        onOrderUpdated?.(
          result.data
        );
      } catch (error) {
        console.error(
          "Failed to update order status:",
          error
        );

        alert(
          error.message ||
          "Failed to update order status"
        );
      } finally {
        setUpdatingStatus(false);
      }
    };


  /*
  |------------------------------------------------------------------
  | FORMAT DATE
  |------------------------------------------------------------------
  */

  const formatDate =
    (dateString) => {
      if (!dateString) {
        return "-";
      }

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle: "medium",

          timeStyle: "short",
        }
      ).format(
        new Date(dateString)
      );
    };


  /*
  |------------------------------------------------------------------
  | FORMAT MONEY
  |------------------------------------------------------------------
  */

  const formatMoney =
    (amount) => {
      return new Intl.NumberFormat(
        "en-IN",
        {
          minimumFractionDigits: 2,

          maximumFractionDigits: 2,
        }
      ).format(
        Number(amount || 0)
      );
    };


  /*
  |------------------------------------------------------------------
  | GET AVAILABLE TRANSITIONS
  |------------------------------------------------------------------
  */

  const availableTransitions =
    ALLOWED_TRANSITIONS[
      order?.status
    ] || [];


  /*
  |------------------------------------------------------------------
  | MODAL
  |------------------------------------------------------------------
  */

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-sm
      "
    >

      <div
        className="
          max-h-[90vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-2xl
          border
          border-white/10
          bg-[#111111]
          shadow-2xl
        "
      >

        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}

        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-start
            justify-between
            border-b
            border-white/10
            bg-[#111111]
            p-6
          "
        >

          <div>

            <p
              className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-[#D92323]
              "
            >
              Order Details
            </p>

            <h2
              className="
                heading-font
                mt-2
                text-3xl
                uppercase
                text-white
              "
            >
              Order #{orderId}
            </h2>

          </div>


          <button
            type="button"

            onClick={onClose}

            className="
              rounded-xl
              border
              border-white/10
              p-2
              text-white/60
              transition
              hover:bg-white/5
              hover:text-white
            "
          >

            <X size={20} />

          </button>

        </div>


        {/* ============================================================ */}
        {/* LOADING */}
        {/* ============================================================ */}

        {loading && (

          <div
            className="
              flex
              min-h-[400px]
              items-center
              justify-center
            "
          >

            <LoaderCircle
              className="
                animate-spin
                text-[#D92323]
              "
              size={32}
            />

          </div>

        )}


        {/* ============================================================ */}
        {/* ERROR */}
        {/* ============================================================ */}

        {!loading &&
          error && (

          <div className="p-6">

            <div
              className="
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                p-4
                text-sm
                text-red-400
              "
            >
              {error}
            </div>

          </div>

        )}


        {/* ============================================================ */}
        {/* CONTENT */}
        {/* ============================================================ */}

        {!loading &&
          !error &&
          order && (

          <div className="p-6">


            {/* ======================================================== */}
            {/* CUSTOMER + STATUS */}
            {/* ======================================================== */}

            <div
              className="
                grid
                gap-5
                md:grid-cols-2
              "
            >


              {/* CUSTOMER */}

              <section
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-5
                "
              >

                <div
                  className="
                    mb-5
                    flex
                    items-center
                    gap-2
                    text-[#D92323]
                  "
                >

                  <User size={18} />

                  <span
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                    "
                  >
                    Customer
                  </span>

                </div>


                <p className="text-lg text-white">

                  {order.customer?.name ||
                    "Unknown Customer"}

                </p>


                <div
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-white/45
                  "
                >

                  <Mail size={15} />

                  <span>

                    {order.customer?.email ||
                      "No email available"}

                  </span>

                </div>

              </section>


              {/* STATUS */}

              <section
                className="
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.02]
                  p-5
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                    text-[#D92323]
                  "
                >
                  Order Status
                </p>


                <div className="mt-4">

                  <OrderStatusBadge
                    status={order.status}
                  />

                </div>


                <select
                  value=""

                  disabled={
                    updatingStatus ||
                    availableTransitions.length === 0
                  }

                  onChange={
                    (event) => {
                      const newStatus =
                        event.target.value;

                      if (!newStatus) {
                        return;
                      }

                      handleStatusChange(
                        newStatus
                      );
                    }
                  }

                  className="
                    mt-4
                    w-full
                    rounded-lg
                    border
                    border-white/10
                    bg-[#0b0b0b]
                    px-3
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-[#D92323]/60
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  <option value="">

                    {availableTransitions.length ===
                    0
                      ? "No further actions"
                      : "Change order status"}

                  </option>


                  {availableTransitions.map(
                    (status) => (

                      <option
                        key={status}
                        value={status}
                      >

                        Mark as {status}

                      </option>

                    )
                  )}

                </select>


                {updatingStatus && (

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-white/40
                    "
                  >

                    <LoaderCircle
                      size={14}
                      className="
                        animate-spin
                      "
                    />

                    Updating status...

                  </div>

                )}

              </section>

            </div>


            {/* ======================================================== */}
            {/* ORDER DATE */}
            {/* ======================================================== */}

            <section
              className="
                mt-5
                rounded-xl
                border
                border-white/10
                bg-white/[0.02]
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[#D92323]
                "
              >

                <Calendar size={18} />

                <span
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                  "
                >
                  Order Date
                </span>

              </div>


              <p
                className="
                  mt-3
                  text-sm
                  text-white/70
                "
              >

                {formatDate(
                  order.createdAt
                )}

              </p>

            </section>


            {/* ======================================================== */}
            {/* ORDER ITEMS */}
            {/* ======================================================== */}

            <section className="mt-7">

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[#D92323]
                "
              >

                <Package size={18} />

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-widest
                  "
                >
                  Ordered Items
                </p>

              </div>


              <div className="mt-4 space-y-3">

                {order.items?.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/[0.02]
                        p-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-4
                        "
                      >

                        <div>

                          <p
                            className="
                              font-medium
                              text-white
                            "
                          >

                            {item.name}

                          </p>


                          {item.variantName && (

                            <p
                              className="
                                mt-1
                                text-sm
                                text-white/45
                              "
                            >

                              {item.variantName}

                            </p>

                          )}


                          <p
                            className="
                              mt-2
                              text-xs
                              text-white/35
                            "
                          >

                            ₹
                            {formatMoney(
                              item.unitPrice
                            )}

                            {" × "}

                            {item.quantity}

                          </p>

                        </div>


                        <p
                          className="
                            whitespace-nowrap
                            text-sm
                            font-medium
                            text-white
                          "
                        >

                          ₹
                          {formatMoney(
                            item.totalPrice
                          )}

                        </p>

                      </div>


                      {/* ================================================= */}
                      {/* COMBO CHOICES */}
                      {/* ================================================= */}

                      {item.choices?.length > 0 && (

                        <div
                          className="
                            mt-4
                            border-t
                            border-white/10
                            pt-4
                          "
                        >

                          <p
                            className="
                              text-xs
                              uppercase
                              tracking-wider
                              text-white/35
                            "
                          >
                            Selected Choices
                          </p>


                          <div className="mt-3 space-y-2">

                            {item.choices.map(
                              (choice) => (

                                <div
                                  key={choice.id}
                                  className="
                                    flex
                                    justify-between
                                    gap-4
                                    text-sm
                                  "
                                >

                                  <span
                                    className="
                                      text-white/45
                                    "
                                  >

                                    {
                                      choice.choiceGroupName
                                    }

                                  </span>


                                  <span
                                    className="
                                      text-right
                                      text-white
                                    "
                                  >

                                    {
                                      choice.optionName
                                    }

                                    {choice.optionVariantName &&
                                      ` (${choice.optionVariantName})`
                                    }

                                  </span>

                                </div>

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  )
                )}

              </div>

            </section>


            {/* ======================================================== */}
            {/* TOTAL */}
            {/* ======================================================== */}

            <section
              className="
                mt-7
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-[#D92323]/20
                bg-[#D92323]/5
                p-5
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-white/60
                "
              >

                <IndianRupee size={18} />

                <span>
                  Total Amount
                </span>

              </div>


              <p
                className="
                  heading-font
                  text-3xl
                  text-white
                "
              >

                ₹
                {formatMoney(
                  order.totalAmount
                )}

              </p>

            </section>

          </div>

        )}

      </div>

    </div>
  );
}


export default AdminOrderDetails;