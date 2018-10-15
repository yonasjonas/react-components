/**
 * Filters component properties that are safe to use in the DOM.
 */
export function domProps(props = {}) {
  const safe = {};
  for (const name in props) {
    // Skip properties with uppercase letters (except for className)
    if (!/^([a-z-]+|className)$/.test(name))
      continue;
    // Skip non-string values
    const value = props[name];
    if (typeof value !== 'string')
      continue;
    // Keep all others
    safe[name] = value;
  }
  return safe;
}
