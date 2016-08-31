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
      const drw = chartType === 'bar' ? tirBar : tirLine;
      drw(targetWidth, targetHeight, {amtMin, amtMax, days, data: data.slice(0 - days), types});
    });
    const drw = chartType === 'bar' ? tirBar : tirLine;
    drw(targetWidth, targetHeight, {amtMin, amtMax, days, data: data.slice(0 - days), types});
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
    } else if (winWidth > 400) {
      targetWidth = 400;
    } else {
      targetWidth = 320;
    }
    targetHeight = Math.floor(Math.max(Math.min(vp.clientHeight, 500), 320) / 10) * 10;
    console.log(targetHeight);
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
