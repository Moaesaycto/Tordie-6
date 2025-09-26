import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const setCursor = (e: any, v: string) => {
  const el = e?.target?.getStage()?.container();
  if (el) el.style.cursor = v;
};
