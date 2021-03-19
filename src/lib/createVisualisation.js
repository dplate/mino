export default (elementId, width, height) => {
  const canvas = document.getElementById(elementId);
  canvas.width = width * 2;
  canvas.height = height * 2;
  const context = canvas.getContext('2d');
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  const randomColor = () => {
    context.fillStyle = `rgba(
      ${128+Math.floor(Math.random()*127)},
      ${128+Math.floor(Math.random()*127)},
      ${128+Math.floor(Math.random()*127)},
      1
    )`;
  };
  randomColor();

  return {
    drawConnection: (from, to, anchorValue) => {
      let oldFillStyle = context.fillStyle;
      if (anchorValue !== undefined) {
        context.fillStyle = 'rgba(255, 0, 0, 1)';
      }
      context.fillRect(to.x * 2, to.y * 2, 1, 1);
      context.fillRect(to.x + from.x, to.y + from.y, 1, 1);
      context.fillRect(from.x * 2, from.y * 2, 1, 1);
      context.fillStyle = oldFillStyle;
    },
    newSegment: () => randomColor()
  }
}