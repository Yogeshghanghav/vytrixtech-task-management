import { useState } from 'react'

function Field({ id, label, type = 'text', hint, ...inputProps }) {
  const [shown, setShown] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((value) => !value)}
            aria-pressed={shown}
            className="text-xs font-semibold text-brand hover:text-brand-deep"
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        )}
      </div>

      <input
        id={id}
        required
        type={isPassword && shown ? 'text' : type}
        className="h-11 w-full rounded-md border border-line bg-paper px-3.5 text-sm placeholder:text-ink-faint focus:border-brand"
        {...inputProps}
      />

      {hint && <p className="mt-1.5 text-xs text-ink-soft">{hint}</p>}
    </div>
  )
}

export default Field