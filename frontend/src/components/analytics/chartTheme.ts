export const CHART_THEME = {
  grid: '#273244',
  axis: '#64748b',
  text: '#cbd5e1',
  primary: '#f97316', // boost-500
  secondary: '#38bdf8', // sky-400
  tertiary: '#a78bfa', // violet-400
  baseline: '#64748b',
  tooltip: {
    bg: '#0e1218',
    border: '#273244',
  },
}

export const tooltipStyle = {
  backgroundColor: CHART_THEME.tooltip.bg,
  border: `1px solid ${CHART_THEME.tooltip.border}`,
  borderRadius: '8px',
  color: CHART_THEME.text,
  fontSize: '12px',
}

export const axisStyle = {
  fontSize: 11,
  fill: CHART_THEME.axis,
}
