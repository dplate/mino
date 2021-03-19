import createNeighbours from './createNeighbours.js';

export default () => {
  const indexes = [
    {
      positions: [],
      isOk: (neighbours) => neighbours.hasTwoOpposite()
    },
    {
      positions: [],
      isOk: (neighbours) => neighbours.countDirections() >= 2
    },
    {
      positions: [],
      isOk: (neighbours) => neighbours.countDirections() >= 1
    }
  ];

  const process = (previousX, previousY, x, y, values, value = values.get(x, y)) => {
    values.setProcessed(x, y, value);
    const position = {
      x,
      y,
      value,
      neighbours: createNeighbours(previousX, previousY, x, y, values, value)
    }
    indexes.forEach(index => index.positions.push(position));
    return position;
  };

  const findBestWithNeighbour = (values) => {
    for (let index of indexes) {
      const positions = index.positions;
      for (let i = positions.length - 1; i >= 0; i--) {
        const position = positions[i];
        position.neighbours.removeProcessed(values);
        if (index.isOk(position.neighbours)) {
          return position;
        }
        positions.pop();
      }
    }
    return null;
  };

  return {
    process,
    doStep: (position, step, stepId, values, anchors) => {
      const neighbour = position.neighbours.get(step.direction);
      const newValue = values.modify(position.value, step.plus, stepId, anchors, values.get(neighbour.x, neighbour.y));
      return process(position.x, position.y, neighbour.x, neighbour.y, values, newValue);
    },
    findBestWithNeighbour
  };
};