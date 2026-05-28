// ============================================
// File:    UserAvatar.tsx
// Author:  OpenAI Codex
// Date:    May 2026
// Course:  CPRO306 - Capstone Project
// Desc:    Renders a deterministic local DiceBear avatar for a user.
// ============================================

import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { personas } from '@dicebear/collection';

type UserAvatarProps = {
  name: string;
  email?: string;
  size?: number;
  className?: string;
};

const avatarBackgrounds = ['1B2E55', '2A4575', 'EF9B28', 'D97706', '3B82F6', '0F766E'];

/**
 * Renders a deterministic avatar using the user's identity as a local DiceBear seed.
 * @param {UserAvatarProps} props - Display name, optional email seed, and sizing options.
 * @returns {JSX.Element} Inline avatar image with no external network dependency.
 */
export function UserAvatar({ name, email, size = 96, className = '' }: UserAvatarProps) {
  const seed = `${name.trim().toLowerCase()}|${email?.trim().toLowerCase() || 'guest'}`;
  const avatarDataUri = useMemo(
    () =>
      createAvatar(personas, {
        seed,
        size,
        radius: 999,
        backgroundColor: avatarBackgrounds,
      }).toDataUri(),
    [seed, size]
  );

  return (
    <img
      src={avatarDataUri}
      alt={`${name} avatar`}
      width={size}
      height={size}
      className={`rounded-full border border-slate-200 bg-white object-cover shadow-sm ${className}`.trim()}
      loading="lazy"
    />
  );
}
