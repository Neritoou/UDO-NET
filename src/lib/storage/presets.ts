export const IMAGE_PRESETS = {
  avatar: {
    maxSize: 500 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { width: 256, height: 256 },
    path: (id: string) => `users/${id}/avatar`,
    defaultUrl: '/defaults/avatar.svg',
  },
  userBanner: {
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { width: 1920, height: 384 },
    path: (id: string) => `users/${id}/banner`,
    defaultUrl: '/udo-arch.jpg',
  },
  communityIcon: {
    maxSize: 500 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { width: 256, height: 256 },
    path: (id: string) => `communities/${id}/icon`,
    defaultUrl: '/defaults/community_icon.svg',
  },
  communityBanner: {
    maxSize: 500 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    dimensions: { width: 1920, height: 384 },
    path: (id: string) => `communities/${id}/banner`,
    defaultUrl: '/defaults/community_banner.svg',
  },
  postImage: {
    maxSize: 3 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    dimensions: { width: 1200, height: 675 },
    path: (id: string) => `posts/${id}/image`,
    defaultUrl: '/defaults/post_placeholder.svg',
  },
} as const

export type ImagePreset = keyof typeof IMAGE_PRESETS