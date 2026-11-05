/** Read resolved values for canvas APIs, which do not accept CSS var() colors. */
export function getChartTheme() {
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  return {
    palette: Array.from({ length: 14 }, (_, index) => token(`--chart-color-${index}`)),
    surface: token("--color-surface"),
    muted: token("--color-muted"),
    ink: token("--color-ink"),
    fontFamily: token("--font-sans"),
    // Canvas font sizes and padding are pixels; CSS tokens use root-relative units.
    fontSize: parseFloat(token("--text-sm")) * parseFloat(styles.fontSize),
    spacing: parseFloat(token("--spacing")) * parseFloat(styles.fontSize),
  };
}
