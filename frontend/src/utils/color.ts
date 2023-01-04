export default function ToString(colorCode: number) {
  return `#${colorCode.toString(16).padStart(6, '0')}`;
}
