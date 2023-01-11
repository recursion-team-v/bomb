export default interface PlacementObjectInterface {
  createdAt: number;
  removedAt: number;

  // 以下のメソッドは、フロントエンドでは使用できないので気をつける
  isCreatedTime: () => boolean;
  isRemovedTime: () => boolean;
}
