import * as Constants from '../constants/constants';

export const getInitialPlayerPos = (mapRows: number, mapCols: number, idx: number) => {
  const INITIAL_PLAYER_POSITION = [
    {
      x: Constants.PLAYER_WIDTH + Constants.PLAYER_WIDTH / 2,
      y: Constants.PLAYER_HEIGHT + Constants.PLAYER_HEIGHT / 2 + Constants.HEADER_HEIGHT,
    },
    {
      x: Constants.PLAYER_WIDTH * (mapCols - 2) + Constants.PLAYER_WIDTH / 2,
      y: Constants.PLAYER_HEIGHT + Constants.PLAYER_HEIGHT / 2 + Constants.HEADER_HEIGHT,
    },
    {
      x: Constants.PLAYER_WIDTH + Constants.PLAYER_WIDTH / 2,
      y:
        Constants.PLAYER_HEIGHT * (mapRows - 2) +
        Constants.PLAYER_HEIGHT / 2 +
        Constants.HEADER_HEIGHT,
    },
    {
      x: Constants.PLAYER_WIDTH * (mapCols - 2) + Constants.PLAYER_WIDTH / 2,
      y:
        Constants.PLAYER_HEIGHT * (mapRows - 2) +
        Constants.PLAYER_HEIGHT / 2 +
        Constants.HEADER_HEIGHT,
    },
  ];

  return INITIAL_PLAYER_POSITION[idx];
};
