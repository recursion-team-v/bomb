import * as Constants from '../constants/constants';

// クライアントとサーバー間で共通して利用する item のインターフェース
export default interface ItemInterface {
  removeItem: () => void;
  getType: () => Constants.ITEM_TYPES;
}
