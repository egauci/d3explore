import viewport from 'viewport-event';
import tirLine, {setLineHighlight} from './tir-line';
import tirBar, {setBarHighlight} from './tir-bar';
import getData from './tirdata';
import {tirSelection, types, period, chartType, curve, highlight, chartDescription, resetHighlight} from './helpers';


export default function(stop) {
  let targetWidth;
  let oldWidth;
  let targetHeight;
  let oldHeight;
  let oldHighlight = highlight;
  let oldChartType = chartType;

  const amtMin = 10000000;
  const amtMax = 50000000;
  const maxDays = 90;

  const fullData = getData({maxDays, min: amtMin, max: amtMax});

  const fillChartInfo = data => {
    document.querySelector('#main-chart-desc').innerHTML = `<pre>${chartDescription(data)}</pre>`;
  };

  const draw = () => {
    document.querySelector('#d3-target').innerHTML = '';
    const options1 = document.createElement('div');
    options1.id = 'chart-options1';
    options1.className = 'chart-options';
    document.querySelector('#d3-target').appendChild(options1);
    const chartInfo = document.createElement('div');
    chartInfo.id = 'main-chart-desc';
    chartInfo.setAttribute('tabindex', '0');
    chartInfo.className = 'main-chart-desc';
    document.querySelector('#d3-target').appendChild(chartInfo);
    const options2 = document.createElement('div');
    options2.id = 'chart-options2';
    options2.className = 'chart-options';
    document.querySelector('#options2-target').innerHTML = '';
    document.querySelector('#options2-target').appendChild(options2);
    let days = Math.min(period, maxDays);
    let data = fullData.slice(0 - days);
    fillChartInfo(data);
    tirSelection(options1, options2, () => {
      if (chartType === oldChartType && highlight !== oldHighlight) {
        const seth = chartType !== 'line' ? setBarHighlight : setLineHighlight;
        if (seth) {
          seth(highlight);
          oldHighlight = highlight;
          return;
        }
      }
      oldChartType = chartType;
      oldHighlight = highlight;
      for (let [k, v] of types) {
        const dtype = v.checked ? '' : 'none';
        document.querySelector(`#${k}-highlight-option`).style.display = dtype;
        if (!v.checked && k === highlight) {
          document.querySelector('#highlight-select').value = 'none';
          oldHighlight = null;
          resetHighlight();
        }
      }
      const svg = document.querySelector('#d3-target > svg:first-of-type');
      svg.parentElement.removeChild(svg);
      days = Math.min(period, maxDays);
      const drw = chartType !== 'line' ? tirBar : tirLine;
      data = fullData.slice(0 - days);
      fillChartInfo(data);
      drw(targetWidth, targetHeight,
        {amtMin, amtMax, days, data, types, chartType, curve, highlight});
    });
    const drw = chartType !== 'line' ? tirBar : tirLine;
    drw(targetWidth, targetHeight,
      {amtMin, amtMax, days, data, types, chartType, curve, highlight});
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
