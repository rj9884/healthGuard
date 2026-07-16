import { AVATAR_COLORS } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

export function MemberAvatar({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const bg = AVATAR_COLORS[color] ?? AVATAR_COLORS.blue;
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const sizeCls = size === "lg" ? "h-14 w-14 text-lg" : size === "md" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white", sizeCls)}
      style={{ backgroundColor: bg }}
    >
      {initials}
    </span>
  );
}
