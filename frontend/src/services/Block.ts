import ServerBlock from '../../../backend/src/rooms/schema/Block';
import { getGameScene } from '../utils/globalGame';
import * as Constants from '../../../backend/src/constants/constants';

export function removeBlock(block: ServerBlock) {
  const game = getGameScene();
  const id = block.id;

  const currBlocks = game.getCurrBlocks();
  if (currBlocks === undefined) return;

  const blockBody = currBlocks.get(id);
  if (blockBody === undefined) return;
  currBlocks.delete(id);

  const juice = game.getJuice();

  // ブロック破壊のアニメーション
  const timer = setInterval(() => {
    juice.flash(blockBody, 30, Constants.RED.toString());
  }, 30);

  setTimeout(() => {
    clearInterval(timer);
    blockBody.destroy();
  }, 200);
}
