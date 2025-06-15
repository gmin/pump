import UAParser from 'ua-parser-js';

const BASE_FONT_SIZE = 37.5;
const parser = new UAParser();

export function isAndroid() {
  return parser.getOS().name === 'Android';
}

export function isMobile() {
  return parser.getDevice().type === 'mobile';
}

export function isWeChat() {
  return parser.getBrowser().name === 'WeChat';
}

export function getDocFontSize() {
  const computedStyle = document.defaultView.getComputedStyle(document.documentElement);

  return parseFloat(computedStyle.fontSize);
}

export function getRealSize(size) {
  const realSize = (getDocFontSize() / BASE_FONT_SIZE) * size;

  return parseFloat(realSize);
}
