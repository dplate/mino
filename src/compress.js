import createValues from './lib/createValues.js';
import createPositions from './lib/createPositions.js';
import createBuffer from './lib/createBuffer.js';

const createStep = (values, position) => {
  const bestDirection = position.neighbours.getBestDirection();
  return {
    direction: bestDirection,
    possibleDirections: position.neighbours.countDirections(),
    plus: position.neighbours.get(bestDirection).plus
  }
};

const createSteps = (values, visualisation) => {
  const anchors = { 0: values.get(0, 0) };


  const positions = createPositions();
  const steps = [];
  let position = positions.process(-1, 0, 0, 0, values);
  while (!values.hasAllProcessed()) {
    if (!position.neighbours.countDirections()) {
      visualisation.newSegment();
      position = positions.findBestWithNeighbour(values);
    }
    const step = createStep(values, position);
    steps.push(step);
    const stepId = steps.length - 1;

    const nextPosition = positions.doStep(position, step, stepId, values, anchors);
    visualisation.drawConnection(position, nextPosition, anchors[stepId]);

    position = nextPosition;
  }
  return { anchors, steps };
};

export default async (sourceContext, format, visualisation) => {
  const sourceData = sourceContext.getImageData(0, 0, format.width, format.height).data;
  const config = {
    stepValue: 3,
    maxError: 25,
  };
  const values = createValues(config, format, sourceData);
  const { anchors, steps } = createSteps(values, visualisation);

  const buffer = createBuffer();
  buffer.addConfig(config);
  buffer.addFormat(format);
  buffer.addAnchors(anchors, format);
  buffer.addSteps(steps);
  return buffer.generateBlob();
}