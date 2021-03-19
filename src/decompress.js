import createPositions from './lib/createPositions.js';
import createValues from './lib/createValues.js';
import createBuffer from './lib/createBuffer.js';

const repeatSteps = (buffer, anchors, values) => {
  const positions = createPositions();
  let position = positions.process(-1, 0, 0, 0, values, anchors[0]);
  let stepId = 0;
  while (!values.hasAllProcessed()) {
    if (!position.neighbours.countDirections()) {
      position = positions.findBestWithNeighbour(values);
    }
    const step = buffer.nextStep(position.neighbours.countDirections());
    position = positions.doStep(position, step, stepId, values, anchors);
    stepId++;
  }
}

export default async (blob, resultCanvas) => {
  const buffer = createBuffer();
  await buffer.fromBlob(blob);
  const config = buffer.getConfig();
  const format = buffer.getFormat();
  const anchors = buffer.getAnchors(format);

  resultCanvas.width = format.width;
  resultCanvas.height = format.height;
  const resultContext = resultCanvas.getContext('2d');
  resultContext.fillStyle = 'black';
  resultContext.fillRect(0, 0, format.width, format.height);

  const values = createValues(config, format);
  repeatSteps(buffer, anchors, values);

  for (let x = 0; x < format.width; x++) {
    for (let y = 0; y < format.height; y++) {
      if (values.hasProcessed(x, y)) {
        const value = values.get(x, y);
        resultContext.fillStyle = `rgba(${value},${value},${value},1)`;
        resultContext.fillRect(x, y, 1, 1);
      }
    }
  }
}
