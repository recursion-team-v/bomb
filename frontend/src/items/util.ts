import * as Constants from '../../../backend/src/constants/constants';

export function getDepth(label: Constants.OBJECT_LABELS): number {
  const hash = { ...Constants.OBJECT_DEPTH };
  return hash[label];
}
