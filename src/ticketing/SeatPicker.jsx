import { useState } from 'react'
import { ROW_LETTERS } from '../../shared/seats.js'

// Seat plan for one section. States differ by fill and pattern, never by
// hue: available is an outline, selected is solid ink, unavailable is grey
// with a strike through it.
export default function SeatPicker({ rows, blocked = [], taken = [], selected, onToggle, labels, allowBlocked = false }) {
  const [focusId, setFocusId] = useState('A1')
  const off = new Set([...taken, ...(allowBlocked ? [] : blocked)])

  // One tab stop for the whole plan, arrows inside it.
  function onKeyDown(e) {
    const delta = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]
    if (!delta) return
    const match = (e.target.dataset.seat || '').match(/^([A-Z])(\d+)$/)
    if (!match) return
    e.preventDefault()
    const r = Math.min(rows.length - 1, Math.max(0, ROW_LETTERS.indexOf(match[1]) + delta[0]))
    const n = Math.min(rows[r], Math.max(1, Number(match[2]) + delta[1]))
    const id = `${ROW_LETTERS[r]}${n}`
    setFocusId(id)
    e.currentTarget.querySelector(`[data-seat="${id}"]`)?.focus()
  }

  return (
    <div className="seatmap">
      <ul className="seatmap__legend" aria-hidden="true">
        <li><span className="seat seat--sample" />{labels.available}</li>
        <li><span className="seat seat--sample is-selected" />{labels.selected}</li>
        <li><span className="seat seat--sample is-sold" />{labels.sold}</li>
      </ul>
      <p className="tix-sr" id="seatmap-help">{labels.help}</p>
      <div className="seatmap__scroll">
        <div className="seatmap__plan" role="group" aria-label={labels.title} aria-describedby="seatmap-help" onKeyDown={onKeyDown}>
          <div className="seatmap__stage">{labels.stage}</div>
          {rows.map((count, r) => (
            <div className="seatmap__row" key={ROW_LETTERS[r]}>
              <span className="seatmap__rowlabel" aria-hidden="true">{ROW_LETTERS[r]}</span>
              <div className="seatmap__seats">
                {Array.from({ length: count }, (_, i) => {
                  const id = `${ROW_LETTERS[r]}${i + 1}`
                  const isOff = off.has(id)
                  const isSelected = selected.includes(id)
                  const state = isOff ? labels.sold : isSelected ? labels.selected : labels.available
                  return (
                    <button
                      key={id}
                      type="button"
                      data-seat={id}
                      className={`seat${isOff ? ' is-sold' : ''}${isSelected ? ' is-selected' : ''}`}
                      aria-pressed={isOff ? undefined : isSelected}
                      aria-disabled={isOff || undefined}
                      aria-label={`${labels.row} ${ROW_LETTERS[r]} ${labels.seat} ${i + 1}, ${state}`}
                      tabIndex={id === focusId ? 0 : -1}
                      onFocus={() => setFocusId(id)}
                      onClick={() => {
                        if (!isOff) onToggle(id)
                      }}
                    >
                      <span aria-hidden="true">{isOff ? '' : i + 1}</span>
                    </button>
                  )
                })}
              </div>
              <span className="seatmap__rowlabel" aria-hidden="true">{ROW_LETTERS[r]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
