import { playActionFail } from './sfx.js'

// Trigger for the top-center ActionResult popup (components/hud/ActionResult.jsx).
// `id` increments on every call so the HUD's poll sees a fresh trigger even
// when back-to-back messages share the same text.
export const actionResultState = { text: '', success: true, id: 0 }

export function showActionResult(text, success) {
  actionResultState.text = text
  actionResultState.success = success
  actionResultState.id++
  if (!success) playActionFail()
}
