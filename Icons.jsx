/* ── Icons.jsx — Lucide SVG icon set (MIT). 행정 시스템 톤. ──
 * 사용: <Icon name="file" size={16} />
 *      <Icon name="check" size={14} color="var(--color-status-done)" />
 */

const ICON_PATHS = {
  // --- 액션 ---
  check:        'M20 6 9 17l-5-5',
  x:            'M18 6 6 18M6 6l12 12',
  download:     'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  upload:       'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M17 8l-5-5-5 5 M12 3v12',
  plus:         'M12 5v14M5 12h14',
  trash:        'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6 M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2',
  // --- 방향 ---
  'arrow-left':    'M19 12H5 M12 19l-7-7 7-7',
  'arrow-right':   'M5 12h14 M12 5l7 7-7 7',
  'chevron-left':  'm15 18-6-6 6-6',
  'chevron-right': 'm9 18 6-6-6-6',
  'chevron-up':    'm18 15-6-6-6 6',
  'chevron-down':  'm6 9 6 6 6-6',
  // --- 객체 ---
  file:         'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'file-text':  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  image:        'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z m12.5 6-5-5L5 21',
  camera:       'M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  paperclip:    'm21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48',
  calendar:     'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18',
  // --- 상태 ---
  clock:        'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2',
  'alert-circle': 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 8v4 M12 16h.01',
  info:         'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01',
  search:       'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z m10 2-4.35-4.35',
  // --- 사람/조직 ---
  user:         'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  building:     'M3 21h18 M5 21V7l8-4v18 M19 21V11l-6-4',
  // --- 메뉴 ---
  menu:         'M3 6h18 M3 12h18 M3 18h18',
  'more-vertical': 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z m0-7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z m0 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  filter:       'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  'log-out':    'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
};

const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 2, style = {} }) => {
  const d = ICON_PATHS[name];
  if (!d) {
    console.warn(`Icon: unknown name "${name}"`);
    return null;
  }
  // path가 여러 개일 경우 공백 + 'M'으로 분리
  const segments = d.split(/(?=\s[Mm])/).map(s => s.trim()).filter(Boolean);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: '-2px', flexShrink: 0, ...style }}
      aria-hidden="true"
      focusable="false"
    >
      {segments.map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
};

window.Icon = Icon;
