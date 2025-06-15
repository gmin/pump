export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function getQueryString(name, url) {
  const res = (url || location.href).match(new RegExp('[?&]' + name + '=([^&#]+)', 'i'));

  if (res === null || res.length < 1) {
    return null;
  }

  return decodeURIComponent(res[1]);
}

export function shuffle(array) {
  const items = array.slice();
  let t, r, i;

  for (i = items.length - 1; i > 0; i--) {
    r = Math.round(Math.random() * i);

    t = items[i];
    items[i] = items[r];
    items[r] = t;
  }

  return items;
}

export function getUUID() {
  const s = [];
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4';
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid.slice(0, 8);
}

export function formatWallet(walletAddress, length = 4) {
  if (!walletAddress) {
    return;
  }

  return (
    walletAddress.substring(0, length) +
    '...' +
    walletAddress.substring(walletAddress.length - length)
  );
}
