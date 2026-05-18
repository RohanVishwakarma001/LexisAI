import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge tailwind classes with conditional clsx support
 * @param {...(string|object|undefined|null|false)} inputs
 * @returns {string} merged classnames
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
