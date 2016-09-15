import viewport from 'viewport-event';
import tirLine, {setLineHighlight} from './tir-line';
import tirBar, {setBarHighlight} from './tir-bar';
import getData from './tirdata';
import {tirSelection, types, period, chartType, curve, highlight} from './helpers';


export default function(stop) {
  let targetWidth;
  let oldWidth;
  let targetHeight;
  let oldHeight;
  let oldHighlight = highlight;

  const amtMin = 10000000;
  const amtMax = 50000000;
  const maxDays = 90;

  const data = getData({maxDays, min: amtMin, max: amtMax});

  const draw = () => {
    document.querySelector('#d3-target').innerHTML = '';
    const options1 = document.createElement('div');
    options1.id = 'chart-options1';
    options1.className = 'chart-options';
    document.querySelector('#d3-target').appendChild(options1);
    const options2 = document.createElement('div');
    options2.id = 'chart-options2';
    options2.className = 'chart-options';
    document.querySelector('#options2-target').innerHTML = '';
    document.querySelector('#options2-target').appendChild(options2);
    let days = Math.min(period, maxDays);

    tirSelection(options1, options2, () => {
      if (highlight !== oldHighlight) {
        const seth = chartType !== 'line' ? setBarHighlight : setLineHighlight;
        seth(highlight);
        oldHighlight = highlight;
        return;
      }
      const svg = document.querySelector('#d3-target > svg:first-of-type');
      svg.parentElement.removeChild(svg);
      days = Math.min(period, maxDays);
      const drw = chartType !== 'line' ? tirBar : tirLine;
      drw(targetWidth, targetHeight,
        {amtMin, amtMax, days, data: data.slice(0 - days), types, chartType, curve, highlight});
    });
    const drw = chartType !== 'line' ? tirBar : tirLine;
    drw(targetWidth, targetHeight,
      {amtMin, amtMax, days, data: data.slice(0 - days), types, chartType, curve, highlight});
  };
  const getWidth = vp => {
    targetWidth = Math.floor(Math.max(Math.min(vp.clientWidth, 4000), 320) / 10) * 10;
    targetHeight = Math.floor(Math.max(Math.min(vp.clientHeight, 600), 320) / 10) * 10;
  };

  const newSize = vp => {
    getWidth(vp);
    if (targetWidth !== oldWidth || targetHeight !== oldHeight) {
      oldWidth = targetWidth;
      oldHeight = targetHeight;
      draw();
    }
  };

  if (stop) {
    viewport.removeAllListeners('viewport');
    targetWidth = 0;
    return;
  }

  newSize(viewport.getViewport());
  viewport.on('viewport', newSize);
}
