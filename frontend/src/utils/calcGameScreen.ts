import * as Constants from '../../../backend/src/constants/constants';

export const calcGameScreen = (mapRows: number, mapCols: number) => {
  return {
    width: Constants.TILE_WIDTH * mapCols,
    height: Constants.TILE_HEIGHT * mapRows + Constants.HEADER_HEIGHT,
  };
};
