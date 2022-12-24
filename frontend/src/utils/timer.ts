// second を 00:00 形式の文字列に変換する
export default function convertSecondsToMMSS(seconds: number): string {
  const minutes = zeroPadding(Math.floor(seconds / 60), 2);
  const remainingSeconds = zeroPadding(Math.floor(seconds % 60), 2);
  return `${minutes}:${remainingSeconds}`;
}

// 数字を 0埋めする
function zeroPadding(num: number, digit: number): string {
  return `0000000000${num}`.slice(-digit);
}
