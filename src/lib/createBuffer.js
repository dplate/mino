const BLOCK_SIZE = 32; // Also change Uint32Array when changing

const stepSerializeMap = {
  1: {
    0: { false: '0', true: '1' }
  },
  2: {
    0: { false: '00', true: '01' },
    1: { false: '10', true: '11' }
  },
  3: {
    0: { false: '00',  true: '01' },
    1: { false: '100', true: '101' },
    2: { false: '110', true: '111' }
  }
};

const stepDeserializeMap = {
  1: {
    '0': { direction: 0, plus: false },
    '1': { direction: 0, plus: true }
  },
  2: {
    '0': {
      '0': { direction: 0, plus: false },
      '1': { direction: 0, plus: true }
    },
    '1': {
      '0': { direction: 1, plus: false },
      '1': { direction: 1, plus: true }
    }
  },
  3: {
    '0': {
      '0': { direction: 0, plus: false },
      '1': { direction: 0, plus: true }
    },
    '1': {
      '0': {
        '0': { direction: 1, plus: false },
        '1': { direction: 1, plus: true }
      },
      '1': {
        '0': { direction: 2, plus: false },
        '1': { direction: 2, plus: true }
      }
    }
  }
};

export default () => {
  let buffer = '';
  let currentPos = 0;

  const addNumber = (number, blockSize = BLOCK_SIZE) => {
    buffer += Number(number).toString(2).padStart(blockSize, '0');
  }

  const getNumber = (blockSize = BLOCK_SIZE) => {
    const number = parseInt(buffer.substr(currentPos, blockSize), 2);
    currentPos += blockSize;
    return number;
  }

  const calcBlockSizeForStepId = (format) => (format.width * format.height).toString(2).length;

  return {
    addConfig: ({ stepValue }) => {
      addNumber(stepValue);
    },
    getConfig: () => ({
      stepValue: getNumber()
    }),
    addFormat: ({ depth, width, height }) => {
      addNumber(depth);
      addNumber(width);
      addNumber(height);
    },
    getFormat: () => ({
      depth: getNumber(),
      width: getNumber(),
      height: getNumber()
    }),
    addAnchors: (anchors, format) => {
      const stepIds = Object.keys(anchors);
      addNumber(stepIds.length);

      const blockSizeForStepId = calcBlockSizeForStepId(format);
      stepIds.forEach(stepId => {
        addNumber(stepId, blockSizeForStepId);
        addNumber(anchors[stepId], format.depth);
      });
    },
    getAnchors: (format) => {
      const anchorsLength = getNumber();
      const anchors = {};
      const blockSizeForStepId = calcBlockSizeForStepId(format);
      for (let i = 0; i < anchorsLength; i++) {
        anchors[getNumber(blockSizeForStepId)] = getNumber(format.depth);
      }
      return anchors;
    },
    addSteps: (steps) => {
      steps.forEach(step => buffer += stepSerializeMap[step.possibleDirections][step.direction][step.plus]);
    },
    nextStep: (countDirections) => {
      let map = stepDeserializeMap[countDirections];
      let bit = undefined;
      while ((bit = buffer[currentPos++]) !== undefined)  {
        map = map[bit];
        if (map.direction !== undefined) {
          return map;
        }
      }
    },
    get: () => buffer,
    generateBlob: () => {
      const byteArray = new Uint32Array(Math.ceil(buffer.length / BLOCK_SIZE));
      for (let i = 0; i < byteArray.length; i++) {
        const byteAsBitString = buffer.substr(i * BLOCK_SIZE, BLOCK_SIZE).padEnd(BLOCK_SIZE, '0');
        byteArray[i] = parseInt(byteAsBitString, 2);
      }
      return new Blob([byteArray], {type: 'application/octet-stream'});
    },
    fromBlob: async (blob) => {
      buffer = '';
      currentPos = 0;

      const byteArray = new Uint32Array(await blob.arrayBuffer());
      for (let i = 0; i < byteArray.length; i++) {
        const byteAsBitString = byteArray[i].toString(2).padStart(BLOCK_SIZE, '0');
        buffer += byteAsBitString;
      }
    }
  }
}