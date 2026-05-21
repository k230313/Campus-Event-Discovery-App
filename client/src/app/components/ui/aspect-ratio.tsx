// ============================================
// File:    aspect-ratio.tsx
// Author:  Navroop Kaur
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders the aspect ratio frontend component.
// ============================================

"use client";

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

/**
 * Renders the AspectRatio component for the application interface.
 * @param {object} props - Component props.
 * @returns {JSX.Element} Renders the component output.
 */
function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
