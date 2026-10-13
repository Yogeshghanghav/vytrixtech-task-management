import { initials } from '../utils/format'

const tones = [
  'bg-[#dbe7f2] text-[#25496d]',
  'bg-[#e6e0f0] text-[#47397a]',
  'bg-[#f2e3d6] text-[#7a4a22]',
  'bg-[#dcebe0] text-[#2f5f3c]',
  'bg-[#f0dde3] text-[#7a3348]',
]

// Same name always gets the same colour, so people are easy to spot across screens.
function toneFor(name = '') {
  let sum = 0
  for (const char of name) sum += char.charCodeAt(0)
  return tones[sum % tones.length]
}

function Avatar({ name, size = 'md' }) {
  const sizes = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
  }

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${sizes[size]} ${toneFor(name)}`}
    >
      {initials(name)}
    </span>
  )
}

export default Avatar
