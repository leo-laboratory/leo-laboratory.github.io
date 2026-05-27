/**
 * Normalize an author name to a canonical "first-or-initial last" lowercase form.
 *
 * Handles surname-first comma form, initial periods, internal whitespace,
 * trailing periods, and Latin diacritics. Korean names are lowercased
 * (no-op for Hangul) and returned without restructuring.
 */
export function normalizeAuthorName(input: string): string {
  let s = input.trim()
  if (!s) return ''

  // Surname-first comma form: "Lee, Heetak" -> "Heetak Lee", "Lee, H." -> "H Lee"
  const commaIdx = s.indexOf(',')
  if (commaIdx !== -1) {
    const before = s.slice(0, commaIdx).trim()
    const after = s.slice(commaIdx + 1).trim()
    if (before && after) s = `${after} ${before}`
  }

  // Strip Latin diacritics; leave Hangul/CJK untouched.
  // After NFD decomposition, remove combining diacritical marks (U+0300–U+036F),
  // then recompose with NFC so Hangul jamo reassemble correctly.
  s = s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC')

  // Remove periods (initial punctuation).
  s = s.replace(/\./g, '')

  // Collapse hyphenated initials like "J-H Choi" -> "JH Choi".
  s = s.replace(/\b([A-Za-z])-([A-Za-z])\b/g, '$1$2')

  // Collapse consecutive single-letter tokens "J H Choi" -> "JH Choi".
  const tokens = s.split(/\s+/).filter(Boolean)
  const merged: string[] = []
  let initialsBuf = ''
  for (const tok of tokens) {
    if (tok.length === 1 && /[A-Za-z]/.test(tok)) {
      initialsBuf += tok
    } else {
      if (initialsBuf) {
        merged.push(initialsBuf)
        initialsBuf = ''
      }
      merged.push(tok)
    }
  }
  if (initialsBuf) merged.push(initialsBuf)

  return merged.join(' ').toLowerCase().trim()
}
