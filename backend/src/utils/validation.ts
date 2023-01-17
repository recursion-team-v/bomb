import * as Constants from '../constants/constants';

export function validateAndFixUserName(name: string): string {
  // undefined 場合はデフォルトの名前を返す
  if (name === undefined) return Constants.DEFAULT_PLAYER_NAME;

  // 空白を削除
  name = name.replace(/\s+/g, '');

  // 改行を削除
  name = name.replace(/\r?\n/g, '');

  // 全角スペースを削除
  // eslint-disable-next-line no-irregular-whitespace
  name = name.replace(/　/g, '');

  if (name.length === 0) return Constants.DEFAULT_PLAYER_NAME;

  // 8文字以上の場合は6文字に切り詰める
  if (name.length > 6) return name.slice(0, 6);

  return name;
}
