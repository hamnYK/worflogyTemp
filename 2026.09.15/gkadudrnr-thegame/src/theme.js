export function themeColor(name) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim();
  if (!value) throw new Error(`Missing design token: ${name}`);
  return value;
}
