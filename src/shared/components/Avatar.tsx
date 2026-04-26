import { THEME } from '../../lib/theme'
import { useAvatarStore } from '../store/useAvatarStore'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function Avatar({
  id,
  name,
  size = 44,
  fallbackColor,
  src,
}: {
  id: string
  name: string
  size?: number
  fallbackColor: string
  src?: string
}) {
  const override = useAvatarStore((s) => s.overrides[id])
  const url = override ?? src ?? null

  if (url) {
    return (
      <img
        src={url}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full border object-cover"
        style={{ borderColor: THEME.border }}
      />
    )
  }

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full text-[14px] font-semibold"
      style={{
        width: size,
        height: size,
        background: `${fallbackColor}18`,
        color: fallbackColor,
        fontFamily: THEME.fontMono,
        border: `1px solid ${THEME.border}`,
      }}
    >
      {initials(name)}
    </div>
  )
}

