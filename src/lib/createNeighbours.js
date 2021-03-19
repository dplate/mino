const createNeighbour = (values, neighbourX, neighbourY, value) => {
  const neighbour = {
    x: neighbourX,
    y: neighbourY
  }
  if (value !== null) {
    const neighbourValue = values.get(neighbourX, neighbourY);
    const diffToLowerValue = Math.abs(neighbourValue - values.minus(value));
    const diffToHigherValue = Math.abs(neighbourValue - values.plus(value));
    neighbour.diff = Math.min(diffToLowerValue, diffToHigherValue);
    neighbour.plus = diffToHigherValue < diffToLowerValue
  }
  return neighbour;
};

const getPattern = (previousX, previousY, x, y) => {
  if (previousX < x) {
    return [{ x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
  }
  if (previousX > x) {
    return [{ x: -1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];
  }
  if (previousY < y) {
    return [{ x: 0, y: 1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
  }
  return [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
}

export default (previousX, previousY, x, y, values, value = null) => {
  let neighbours = [];
  getPattern(previousX, previousY, x, y).forEach((offset) => {
    const neighbourX = x + offset.x;
    const neighbourY = y + offset.y;
    if (!values.hasProcessed(neighbourX, neighbourY)) {
      neighbours.push(createNeighbour(values, neighbourX, neighbourY, value));
    }
  });
  return {
    get: (direction) => neighbours[direction],
    getBestDirection: () => {
      let bestDirection = 0;
      neighbours.forEach((neighbour, direction) => {
        if (neighbour.diff < neighbours[bestDirection].diff) {
          bestDirection = direction;
        }
      });
      return bestDirection;
    },
    countDirections: () => neighbours.length,
    removeProcessed: (values) => {
      neighbours = neighbours.filter((neighbour) => !values.hasProcessed(neighbour.x, neighbour.y));
    },
    hasTwoOpposite: () => neighbours.length === 2 && (
      Math.abs(neighbours[0].x - neighbours[1].x) === 2 ||
      Math.abs(neighbours[0].y - neighbours[1].y) === 2
    )
  };
};