import Matter from 'matter-js';

import * as Constants from '../../constants/constants';
import GameEngine from '../../rooms/GameEngine';
import { playerToItem } from './player';
import { blastToBomb, blastToPlayer } from './blast';

export default function collisionHandler(
  engine: GameEngine,
  bodyA: Matter.Body,
  bodyB: Matter.Body
) {
  const labelA = bodyA.label as Constants.OBJECT_LABELS;
  const labelB = bodyB.label as Constants.OBJECT_LABELS;

  const isSpecificLabel = (
    a: Constants.OBJECT_LABELS,
    b: Constants.OBJECT_LABELS,
    label: Constants.OBJECT_LABELS
  ) => {
    return label === a || label === b;
  };

  const isBomb = isSpecificLabel(labelA, labelB, Constants.OBJECT_LABEL.BOMB);
  const isBlast = isSpecificLabel(labelA, labelB, Constants.OBJECT_LABEL.BLAST);
  const isItem = isSpecificLabel(labelA, labelB, Constants.OBJECT_LABEL.ITEM);
  const isPlayer = isSpecificLabel(labelA, labelB, Constants.OBJECT_LABEL.PLAYER);
  const isBlock = isSpecificLabel(labelA, labelB, Constants.OBJECT_LABEL.BLOCK);

  // // PLAYER & ITEM
  if (isPlayer && isItem) {
    const playerBody = labelA === Constants.OBJECT_LABEL.PLAYER ? bodyA : bodyB;
    const itemBody = labelA === Constants.OBJECT_LABEL.ITEM ? bodyA : bodyB;
    const sessionId = engine.sessionIdByBodyId.get(playerBody.id);
    const itemId = engine.itemIdByBodyId.get(itemBody.id);
    if (sessionId === undefined || itemId === undefined) return;
    const player = engine.state.players.get(sessionId);
    if (player === undefined) return;
    const item = engine.state.items.get(itemId);
    if (item === undefined) return;
    playerToItem(player, item, engine);
  }

  // PLAYER & BLAST
  else if (isPlayer && isBlast) {
    const playerBody = labelA === Constants.OBJECT_LABEL.PLAYER ? bodyA : bodyB;
    const sessionId = engine.sessionIdByBodyId.get(playerBody.id);
    if (sessionId === undefined) return;

    const player = engine.state.getPlayer(sessionId);
    if (player === undefined) return;

    // TODO: 爆風に当たると30hitぐらいしちゃうので、回復アイテムを入れるならヒット後は数秒無敵にした方がいい
    blastToPlayer(player);
  }

  // BLAST & BOMB
  else if (isBlast && isBomb) {
    const bombBody = labelA === Constants.OBJECT_LABEL.BOMB ? bodyA : bodyB;
    const bombId = engine.sessionIdByBodyId.get(bombBody.id);
    if (bombId === undefined) return;

    const bomb = engine.state.bombs.get(bombId);
    if (bomb === undefined) return;

    blastToBomb(engine.bombService, bomb.id);
  }

  // BLAST & BLOCK
  else if (isBlast && isBlock) {
    const blockBody = labelA === Constants.OBJECT_LABEL.BLOCK ? bodyA : bodyB;
    const blockId = blockBody.id.toString();
    const block = engine.state.blocks.get(blockId);
    if (block === undefined) return;
    engine.mapService.destroyBlock(block);
  }
}
