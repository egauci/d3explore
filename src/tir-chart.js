import viewport from 'viewport-event';
import tirLine from './tir-line';
import tirBar from './tir-bar';
import getData from './tirdata';
import {tirSelection, types, period, chartType} from './helpers';


export default function(stop) {
  let targetWidth;
  let oldWidth;
  let targetHeight;
  let oldHeight;

  const amtMin = 10000000;
  const amtMax = 50000000;
  const maxDays = 90;

  const data = getData({maxDays, min: amtMin, max: amtMax});

  const draw = () => {
    document.querySelector('#d3-target').innerHTML = '';
    const options = document.createElement('div');
    options.id = 'chart-options';
    options.className = 'chart-options';
    document.querySelector('#d3-target').appendChild(options);
    let days = Math.min(period, maxDays);

    tirSelection(options, () => {
      const svg = document.querySelector('#d3-target > svg:first-of-type');
      svg.parentElement.removeChild(svg);
      days = Math.min(period, maxDays);
      const drw = chartType !== 'line' ? tirBar : tirLine;
      drw(targetWidth, targetHeight, {amtMin, amtMax, days, data: data.slice(0 - days), types, chartType});
    });
    const drw = chartType !== 'line' ? tirBar : tirLine;
    drw(targetWidth, targetHeight, {amtMin, amtMax, days, data: data.slice(0 - days), types, chartType});
  };
  const getWidth = vp => {
    targetWidth = Math.floor(Math.max(Math.min(vp.clientWidth, 960), 320) / 10) * 10;
    targetHeight = Math.floor(Math.max(Math.min(vp.clientHeight, 500), 320) / 10) * 10;
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

  getWidth(viewport.getViewport());
  oldWidth = targetWidth;
  oldHeight = targetHeight;
  draw();
  viewport.on('viewport', newSize);
}
