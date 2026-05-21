// ============================================
// File:    utils.ts
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the utils frontend component.
// ============================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Executes the cn logic.
 * @param {*} inputs - Represents the inputs input.
 * @returns {*} Returns the resulting value.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
