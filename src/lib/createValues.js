export default (config, { depth, width, height }, sourceData = null) => {
  const compressMode = sourceData !== null;
  const values = new Array(width);
  for (let x = 0; x < width; x++) {
    values[x] = new Array(height);
    if (sourceData) {
      for (let y = 0; y < height; y++) {
        const pixelIndex = y * width * 4 + x * 4;
        values[x][y] = Math.floor((sourceData[pixelIndex] + sourceData[pixelIndex + 1] + sourceData[pixelIndex + 2]) / 3);
      }
    }
  }
  let processed = 0;

  const hasProcessed = (x, y) => !values[x] || (
    compressMode ? (values[x][y] === undefined) : (y < 0 || y >= height || values[x][y] !== undefined)
  );

  const setProcessed = (x, y, value= undefined) => {
    if (!hasProcessed(x, y)) {
      compressMode ? values[x][y] = undefined : values[x][y] = value
      processed++;
    }
  }

  const maxValue = Math.pow(2, depth) - 1;
  const clipValue = (value) => Math.min(Math.max(0, value), maxValue);
  const plus = (value) => clipValue(value + config.stepValue);
  const minus = (value) => clipValue(value - config.stepValue);

  return {
    debug: values,
    get: (x, y) => values[x][y],
    hasProcessed,
    setProcessed,
    hasAllProcessed: () => processed >= width * height,
    plus,
    minus,
    modify: (previousValue, doPlus, stepId, anchors, optimalValue) => {
      const modifiedValue = doPlus ? plus(previousValue) : minus(previousValue);
      if (optimalValue !== undefined) {
        if (Math.abs(optimalValue - modifiedValue) > config.maxError) {
          anchors[stepId] = optimalValue;
          return optimalValue;
        }
      } else if (anchors[stepId] !== undefined) {
        return anchors[stepId];
      }
      return modifiedValue;
    },
    stepValue: config.stepValue
  };
};