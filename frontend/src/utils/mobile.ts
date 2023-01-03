// https://www.site-convert.com/archives/2188
export default function isMobile(): boolean {
  if (navigator.userAgent.match(/iPhone|iPad|Android/) != null) {
    return true;
  } else {
    return false;
  }
}
