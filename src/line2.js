import viewport from 'viewport-event';
import line2Draw from './line2-draw';
import getData from './tirdata';

export default function(stop) {
  let targetWidth;
  let oldWidth;

  const amtMin = 10000000;
  const amtMax = 50000000;
  const days = 7;

  const data = getData({days, min: amtMin, max: amtMax});

  const draw = () => {
    line2Draw(targetWidth, {amtMin, amtMax, days, data});
  };
  const getWidth = vp => {
    const winWidth = vp.clientWidth;
    if (winWidth > 960) {
      targetWidth = 960;
    } else if (winWidth > 800) {
      targetWidth = 800;
    } else if (winWidth > 700) {
      targetWidth = 700;
    } else if (winWidth > 600) {
      targetWidth = 600;
    } else if (winWidth > 500) {
      targetWidth = 500;
    } else {
      targetWidth = 320;
    }
  };

  const newSize = vp => {
    getWidth(vp);
    if (targetWidth !== oldWidth) {
      oldWidth = targetWidth;
      draw();
    }
  };

  if (stop) {
    viewport.removeAllListeners('viewport');
    targetWidth = 0;
    return;
  }

  getWidth(viewport.getViewport());
  oldWidth = targetWidth;
  draw();
  viewport.on('viewport', newSize);
}
