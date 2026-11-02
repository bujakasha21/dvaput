import { timeAgo } from "@/lib/utils";

/** Relativno vrijeme se razlikuje između servera i browsera, pa ignorišemo hydration razliku */
export function TimeAgo({ date, className }: { date: Date | string; className?: string }) {
  return (
    <time dateTime={new Date(date).toISOString()} className={className} suppressHydrationWarning>
      {timeAgo(date)}
    </time>
  );
}
