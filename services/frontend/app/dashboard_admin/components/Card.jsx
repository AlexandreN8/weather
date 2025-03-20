export default function Card({
  title,
  description,
  badgeCount,
  Icon, 
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className="
        relative
        flex
        justify-center
        items-center
        bg-white
        border border-gray-200
        shadow
        rounded-lg
        w-[330px] h-[210px]
        p-4
        cursor-pointer
        hover:shadow-lg
        transition-shadow
        flex flex-col
        hover:border-none
      "
    >
      {/* Notifications */}
      {badgeCount && (
        <span className="
          absolute top-0 right-0
          rounded-tr-lg
          rounded-bl-lg
          bg-[#4785DD]
          text-white
          text-xs
          font-semibold
          px-3 py-1
        ">
          {badgeCount}
        </span>
      )}

      {/* Icon */}
      {Icon && (
        <Icon className="w-[55px] h-[55px] text-[#327EE8]" />
      )}

      {/* Title */}
      <h2 className="mt-4 text-[22px] font-semibold text-[#18202E]">
        {title}
      </h2>

      {/* Description */}
      <p className="text-[16px] text-[#6B7280]">
        {description}
      </p>
    </div>
  );
}
