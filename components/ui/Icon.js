import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const PATHS = {
  'arrow-left':   <Path d="M15 18l-6-6 6-6" />,
  'chevron-right':<Path d="m9 18 6-6-6-6" />,
  'chevron-up':   <Path d="m18 15-6-6-6 6" />,
  'chevron-down': <Path d="m6 9 6 6 6-6" />,
  plus:           <><Path d="M12 5v14" /><Path d="M5 12h14" /></>,
  x:              <><Path d="M18 6 6 18" /><Path d="M6 6l12 12" /></>,
  send:           <><Path d="M22 2 11 13" /><Path d="M22 2l-7 20-4-9-9-4z" /></>,
  message:        <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  bookmark:       <Path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  flag:           <Path d="M4 22V4h13l-1.5 4L17 12H4" />,
  check:          <Path d="M20 6 9 17l-5-5" />,
  search:         <><Circle cx="11" cy="11" r="7" /><Path d="m21 21-4-4" /></>,
  heart:          <Path d="M12 21s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9z" />,
  'shield-alert': <><Path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z" /><Path d="M12 8v4" /><Path d="M12 16h.01" /></>,
  'shield-check': <><Path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z" /><Path d="m9 12 2 2 4-4" /></>,
  link:           <><Path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><Path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></>,
  share:          <><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Path d="m8.6 13.5 6.8 4" /><Path d="M15.4 6.5 8.6 10.5" /></>,
  dots:           <><Circle cx="12" cy="5" r="1.3" /><Circle cx="12" cy="12" r="1.3" /><Circle cx="12" cy="19" r="1.3" /></>,
  external:       <><Path d="M7 17 17 7" /><Path d="M9 7h8v8" /></>,
  reply:          <Path d="M9 17H7A4 4 0 0 1 7 9h1M15 7h2a4 4 0 0 1 0 8h-1" />,
  image:          <><Rect x="3" y="3" width="18" height="18" rx="2" /><Circle cx="9" cy="9" r="2" /><Path d="m21 15-5-5L5 21" /></>,
  help:           <><Path d="M9.1 9a3 3 0 1 1 4.5 2.6c-.9.5-1.6 1.2-1.6 2.4" /><Path d="M12 17h.01" /></>,
  info:           <><Circle cx="12" cy="12" r="9" /><Path d="M12 8v4" /><Path d="M12 16h.01" /></>,
};

export default function Icon({ name, size = 18, color = '#fff', fill = 'none', strokeWidth = 2 }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
         strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {body}
    </Svg>
  );
}
