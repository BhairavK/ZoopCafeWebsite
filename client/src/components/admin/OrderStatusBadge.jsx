function OrderStatusBadge({ status }) {
  const styles = {
    PENDING:
      "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",

    CONFIRMED:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",

    PREPARING:
      "border-orange-500/20 bg-orange-500/10 text-orange-400",

    READY:
      "border-purple-500/20 bg-purple-500/10 text-purple-400",

    COMPLETED:
      "border-green-500/20 bg-green-500/10 text-green-400",

    CANCELLED:
      "border-red-500/20 bg-red-500/10 text-red-400",
  };

  const label =
    status?.charAt(0) +
    status?.slice(1).toLowerCase();

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-medium
        ${styles[status] ||
          "border-white/10 bg-white/5 text-white/60"}
      `}
    >
      {label}
    </span>
  );
}

export default OrderStatusBadge;