// クライアントとサーバー間で共通して利用する player のインターフェース
export default interface PlayerInterface {
  getBombStrength: () => number;
  getSpeed: () => number;
  setBombStrength: (bombStrength: number) => void;
  setSpeed: (speed: number) => void;
  increaseMaxBombCount: () => void;
}
