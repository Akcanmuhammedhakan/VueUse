import { describe, expect, it } from 'vitest'
import { classifyGesture, type HandPoint } from './gestures'

// Synthetische Hand (Bildkoordinaten 0..1, y wächst nach unten), Handfläche zur Kamera
type FingerState = 'out' | 'in'

function hand(fingers: { index: FingerState; middle: FingerState; ring: FingerState; pinky: FingerState }, thumbTip: HandPoint): HandPoint[] {
  const lm: HandPoint[] = new Array(21)
  lm[0] = { x: 0.5, y: 0.9 } // Handgelenk
  lm[1] = { x: 0.42, y: 0.84 }
  lm[2] = { x: 0.36, y: 0.77 }
  lm[3] = { x: 0.32, y: 0.71 }
  lm[4] = thumbTip
  const finger = (base: number, x: number, state: FingerState) => {
    lm[base] = { x, y: 0.62 } // Grundgelenk
    if (state === 'out') {
      lm[base + 1] = { x, y: 0.5 }
      lm[base + 2] = { x, y: 0.42 }
      lm[base + 3] = { x, y: 0.35 }
    } else {
      lm[base + 1] = { x, y: 0.55 }
      lm[base + 2] = { x, y: 0.62 }
      lm[base + 3] = { x, y: 0.68 }
    }
  }
  finger(5, 0.42, fingers.index)
  finger(9, 0.5, fingers.middle)
  finger(13, 0.57, fingers.ring)
  finger(17, 0.63, fingers.pinky)
  return lm
}

const alleOffen = { index: 'out', middle: 'out', ring: 'out', pinky: 'out' } as const
const alleZu = { index: 'in', middle: 'in', ring: 'in', pinky: 'in' } as const

describe('classifyGesture', () => {
  it('erkennt die offene Hand', () => {
    expect(classifyGesture(hand(alleOffen, { x: 0.28, y: 0.66 }))).toBe('open_palm')
  })

  it('erkennt den Zeigefinger', () => {
    expect(classifyGesture(hand({ ...alleZu, index: 'out' }, { x: 0.45, y: 0.68 }))).toBe('pointing')
  })

  it('erkennt Daumen und Zeigefinger zusammen (Pinch)', () => {
    const lm = hand({ ...alleZu, index: 'out' }, { x: 0.43, y: 0.37 })
    expect(classifyGesture(lm)).toBe('pinch')
  })

  it('erkennt Daumen hoch', () => {
    expect(classifyGesture(hand(alleZu, { x: 0.3, y: 0.4 }))).toBe('thumbs_up')
  })

  it('erkennt die Faust', () => {
    expect(classifyGesture(hand(alleZu, { x: 0.45, y: 0.68 }))).toBe('fist')
  })

  it('liefert none ohne vollständige Hand', () => {
    expect(classifyGesture([])).toBe('none')
  })
})
