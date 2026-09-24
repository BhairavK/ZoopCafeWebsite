function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}) {
  const alignment =
    align === "left"
      ? "items-start text-left"
      : "items-center text-center";

  return (
    <div className={`flex flex-col ${alignment}`}>
      {eyebrow && (
        <span className="mb-2 text-sm font-medium uppercase tracking-[0.35em] text-[#D92323]">
          {eyebrow}
        </span>
      )}

      <h2 className="heading-font text-5xl uppercase tracking-wide text-white sm:text-6xl">
        {title}
      </h2>

      <div className="mt-4 flex items-center gap-3">
        <span className="h-px w-10 bg-[#D92323]" />

        <span className="h-2 w-2 rotate-45 bg-[#D92323]" />

        <span className="h-px w-10 bg-[#D92323]" />
      </div>

      {description && (
        <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;