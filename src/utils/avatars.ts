export const avatarOptions = [
  { key: 'fox', emoji: '🦊', label: 'Fox' },
  { key: 'lion', emoji: '🦁', label: 'Lion' },
  { key: 'owl', emoji: '🦉', label: 'Owl' },
  { key: 'rocket', emoji: '🚀', label: 'Rocket' },
  { key: 'star', emoji: '🌟', label: 'Star' },
  { key: 'spark', emoji: '✨', label: 'Spark' },
  { key: 'trophy', emoji: '🏆', label: 'Trophy' },
  { key: 'planet', emoji: '🪐', label: 'Planet' },
  { key: 'robot', emoji: '🤖', label: 'Robot' },
  { key: 'light', emoji: '💡', label: 'Light' }
] as const;

export function getAvatarOption(key?: string) {
  return avatarOptions.find((item) => item.key === key) ?? avatarOptions[0];
}
