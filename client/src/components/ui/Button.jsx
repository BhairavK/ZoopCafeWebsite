import { motion } from "framer-motion";

function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  onClick,
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 heading-font text-lg uppercase tracking-wide transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary:
      "bg-[#D92323] text-white hover:bg-[#b91c1c] hover:shadow-[0_0_20px_rgba(217,35,35,0.25)]",

    outline:
      "border border-[#D92323] bg-transparent text-white hover:bg-[#D92323]",

    ghost:
      "bg-transparent text-white hover:bg-white/5",
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

export default Button;