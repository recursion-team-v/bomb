// クライアントとサーバー間で共通して利用する bomb のインターフェース
export default interface BombInterface {
  // 誘爆された時に呼ばれる
  detonated: (id: string) => void;
}
