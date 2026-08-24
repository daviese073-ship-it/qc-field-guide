import type { ReactNode } from "react";

interface EmptySafeRendererProps<T> {
  value: T | null | undefined;
  children: (value: NonNullable<T>) => ReactNode;
}

const isEmpty = (value: unknown) =>
  value == null || (Array.isArray(value) && value.length === 0);

export function EmptySafeRenderer<T>({
  children,
  value
}: EmptySafeRendererProps<T>) {
  if (isEmpty(value)) return null;

  return <>{children(value as NonNullable<T>)}</>;
}
