import compress from './compress.js';
import decompress from './decompress.js';
import createVisualisation from './lib/createVisualisation.js';

const compressDemo = async ({ target }) => {
  const sourceCanvas = document.getElementById('source');
  sourceCanvas.width = target.width;
  sourceCanvas.height = target.height;
  const sourceContext = sourceCanvas.getContext('2d');
  sourceContext.drawImage(target, 0, 0);

  const visualisation = createVisualisation('visualisation', target.width, target.height);
  const format = {depth: 8, width: target.width, height: target.height};
  const blob = await compress(sourceContext, format, visualisation);
  console.log('Compression done')
  console.log('bytes', blob.size);
  document.getElementById('download').href = URL.createObjectURL(blob);

  await decompress(blob, document.getElementById('compressResult'));
  console.log('Decompression done');
};

const decompressDemo = async (blob) => {
  await decompress(blob, document.getElementById('decompressResult'));
  console.log('Decompression done');
}

const start = () => {
  document.getElementById('uploadImage').addEventListener('change', ({ target }) => {
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const sourceImage = new Image();
      sourceImage.addEventListener('load', compressDemo);
      sourceImage.src = fileReader.result;
      document.getElementById('compressOutput').style.display = 'block';
    });
    fileReader.readAsDataURL(target.files[0]);
  });

  document.getElementById('uploadMino').addEventListener('change', ({ target }) => {
    document.getElementById('decompressOutput').style.display = 'block';
    decompressDemo(target.files[0]);
  });
}

start();