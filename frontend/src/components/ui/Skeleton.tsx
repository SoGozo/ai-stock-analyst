import { clsx } from "clsx";

interface Props {
  className?: string;
}

export function Skeleton({ className }: Props) {
  return (
    <div
      className={clsx(
        "animate-pulse rounded bg-gray-800",
        className
      )}
    />
  );
}
