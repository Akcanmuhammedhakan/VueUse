// Reine Logik: aus 21 Hand-Punkten (MediaPipe) eine Geste ableiten.
// Kein Vue, kein Browser → mit Vitest direkt testbar.
//
// Punkte: 0 = Handgelenk, 4 = Daumenspitze, 5 = Zeigefinger-Grundgelenk,
// 6/8 = Zeigefinger Mittelgelenk/Spitze, 9 = Mittelfinger-Grundgelenk,
// 10/12, 14/16, 18/20 = Mittel-, Ring-, kleiner Finger (Mittelgelenk/Spitze)

export interface HandPoint {
  x: number
  y: number
}

export type Gesture = 'none' | 'pinch' | 'thumbs_up' | 'open_palm' | 'pointing' | 'fist'

const dist = (a: HandPoint, b: HandPoint) => Math.hypot(a.x - b.x, a.y - b.y)

// previous: zuletzt erkannte Geste. Ist schon ein Pinch aktiv, darf der Abstand
// etwas größer werden, bevor er endet (Hysterese) – sonst flackert der Klick.
export function classifyGesture(lm: HandPoint[], previous: Gesture = 'none'): Gesture {
  if (lm.length < 21) return 'none'

  const wrist = lm[0]
  // Handgröße als Maßstab, damit die Erkennung unabhängig vom Abstand zur Kamera ist
  const size = dist(wrist, lm[9]) || 1e-6

  // Finger gestreckt = Spitze deutlich weiter vom Handgelenk entfernt als das Mittelgelenk
  const extended = (tip: number, pip: number) => dist(lm[tip], wrist) > dist(lm[pip], wrist) * 1.15
  const index = extended(8, 6)
  const middle = extended(12, 10)
  const ring = extended(16, 14)
  const pinky = extended(20, 18)

  const thumbIndexGap = dist(lm[4], lm[8]) / size
  const indexReachesOut = dist(lm[8], wrist) > dist(lm[5], wrist) * 1.1
  const thumbOut = dist(lm[4], lm[9]) / size > 0.8
  const thumbAbove = lm[4].y < lm[5].y - 0.3 * size

  const pinchGrenze = previous === 'pinch' ? 0.45 : 0.3
  if (thumbIndexGap < pinchGrenze && indexReachesOut) return 'pinch'
  if (!index && !middle && !ring && !pinky && thumbOut && thumbAbove) return 'thumbs_up'
  if (index && middle && ring && pinky) return 'open_palm'
  if (index && !middle && !ring && !pinky) return 'pointing'
  if (!index && !middle && !ring && !pinky) return 'fist'
  return 'none'
}
