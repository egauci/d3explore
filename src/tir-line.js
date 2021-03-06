import * as d3 from 'd3';
import viewport from 'viewport-event';
import {dateAriaLabel} from './helpers/';

let oldListener;

let setHilight;

/* eslint max-statements: 0 */
export default function(targetWidth, targetHeight, {amtMin, amtMax, days, data: odata, types, highlight}) {

  const itemList = [
    {lineClass: 'available-line', symClass: 'available-symbol',
                   sym: d3.symbolSquare, dataKey: 'available', label: 'Open Available'},
    {lineClass: 'ledger-line', symClass: 'ledger-symbol',
                   sym: d3.symbolTriangle, dataKey: 'ledger', label: 'Closing Ledger'},
    {lineClass: 'booked-line', symClass: 'booked-symbol',
                   sym: d3.symbolCircle, dataKey: 'booked', label: 'Closing Collected'},
    {lineClass: 'imaginary-line', symClass: 'imaginary-symbol',
                  sym: d3.symbolDiamond, dataKey: 'imaginary', label: 'Offset'}
  ];

  let keys = [];
  let inuseItemList = [];
  itemList.forEach(({dataKey}, i) => {
    if (types.get(dataKey).checked) {
      keys = [...keys, dataKey];
      inuseItemList = [...inuseItemList, itemList[i]];
    }
  });

  const margin = {top: 160 - (25 * (4 - keys.length)), right: 40, bottom: 30, left: 50},
    width = targetWidth - margin.left - margin.right,
    height = targetHeight - margin.top - margin.bottom;

  const data = odata.map(d => {
    const o = Object.assign({}, d);
    o.average = keys.reduce((p, v) => d[v] + p, 0) / keys.length;
    return o;
  });

  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(data.map(d => d.date)))
    ;

  const y = d3.scaleLinear()
    .range([height, 0])
    ;

  let interval = 1;
  while (width / (days - 1) * interval < 70) {
    interval += 1;
  }

  const xValues = data.filter((d, i) => i % interval === 0).map(d => d.date);

  const xAxis = d3.axisBottom(x)
    .tickFormat(d3.timeFormat('%b %d'))
    .tickValues(xValues)
    ;

  const yMin = Math.min(amtMin, d3.min(data, d => Math.min(d.available, d.ledger, d.booked, d.imaginary))) * 0.9;
  const yMax = Math.max(amtMax, d3.max(data, d => Math.max(d.available, d.ledger, d.booked, d.imaginary)));
  let yValues = [];
  for (let i = amtMin; i <= yMax; i += 5000000) {
    yValues = [...yValues, i];
  }
  y.domain([yMin, yMax]);

  const yAxis = d3.axisLeft(y)
    .tickFormat(d3.formatPrefix('.0', 1000000))
    .tickValues(yValues)
    ;

  const availableLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.available));

  const ledgerLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.ledger));

  const bookedLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.booked));

  const imaginaryLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.imaginary));

  const thelines = {
    available: availableLine,
    ledger: ledgerLine,
    booked: bookedLine,
    imaginary: imaginaryLine
  };

  // const area = curve === 'none' ? null : d3.area()
  //   .x(d => x(d.date))
  //   .y0(() => y(yMin))
  //   .y1(d => y(d.average))
  //   .curve(d3[curve])
  //   ;

  const container = d3.select('#d3-target');
  const svgTop = container
      .append('svg')
      .attr('class', 'chart-1 line-1 line-2')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', 'white')
      ;

  svgTop
    .append('rect')
    .attr('fill', '#f8f5ed')
    .attr('width', width + margin.right)
    .attr('height', height + margin.top)
    .attr('transform', `translate(${margin.left}, 0)`)
  ;

  // the "down-line" from the legend to the Y axis. Draw it here so it is
  // behind the chart.
  const legLine = svgTop.append('line')
    .attr('x1', 0)
    .attr('x2', 0)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', '#6da003')
    .attr('stroke-width', 2)
    .attr('opacity', 0)
  ;

  const svg = svgTop
      .append('g')
      .attr('id', 'main-chart')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  yValues.forEach((yval, i) => {
    svg.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', y(yval))
      .attr('y2', y(yval))
      .attr('class', i === 0 ? 'x axis line' : 'y-horizontal')
      ;
  });

  let highlighted = false;

  const mouseUp = () => {
    if (highlighted) {
      d3.selectAll('.chart-line')
        .style('opacity', 1);
      highlighted = false;
    }
  };

  const highLight = notincluded => {
    if (!notincluded || (highlighted && highlighted === notincluded)) {
      mouseUp();
      return;
    }
    d3.selectAll(`.chart-line:NOT([data-type="${notincluded}"])`)
      .style('opacity', 0.3);
    d3.select(`.chart-line[data-type="${notincluded}"]`)
      .style('opacity', 1);
    highlighted = notincluded;
  };

  setHilight = highLight;

  const mouseDown = () => { // dim "other" lines
    highLight(d3.event.target.getAttribute('data-type'));
  };

  let legend;

  const legendTimeFmt = d3.timeFormat('%B %e');

  const hideLegend = function() {
    if (legend) {
      legend.remove();
      legend = null;
      legLine.attr('opacity', 0);
    }
  };

  const dateAriaId = d => `g-${legendTimeFmt(d.date)}`.replace(/ /g, '-');

  const showLegend = function(val) {
    hideLegend();
    const legendWidth = 300;
    const legendHeight = margin.top - 15;
    let left = Math.max(0, x(val.date) + margin.left - legendWidth / 2);
    left = Math.min(width + margin.left + margin.right - (legendWidth + 2), left);
    legend = svgTop.insert('g', 'g')
      .attr('class', 'legend');
    legend
      .append('rect')
        .attr('class', 'legend-rect')
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .attr('transform', `translate(${left}, 0)`)
        ;
    legend.append('g')
      .attr('class', 'legend-dateline')
      .append('text')
        .attr('transform', `translate(${left + 12}, 25)`)
        .style('font-weight', 'bold')
        .text(legendTimeFmt(val.date))
        ;
    legend.append('g')
      .selectAll('.legend-line')
        .data(inuseItemList)
        .enter().append('g')
          .attr('class', 'legend-line')
            .append('text')
              .attr('transform', (d, i) => `translate(${left + 160}, ${25 * (i + 2)})`)
              .text(d => d3.format('10,.2f')(val[d.dataKey]) + ' USD')
    ;
    legend.selectAll('.legend-line')
      .append('path')
        .attr('transform', (d, i) => `translate(${left + 20}, ${25 * (i + 2) - 5})`)
        .attr('class', d => types.get(d.dataKey).checked ? d.symClass : 'hidden')
        .attr('d', d => d3.symbol().type(d.sym).size(180)())
        .attr('data-type', d => d.dataKey)
      ;
    legend.selectAll('.legend-line')
      .append('text')
        .attr('transform', (d, i) => `translate(${left + 35}, ${25 * (i + 2)})`)
        .text(d => d.label)
      ;
    legLine.attr('opacity', 1)
      .attr('x1', x(val.date) + margin.left)
      .attr('x2', x(val.date) + margin.left)
      .attr('y1', legendHeight)
      .attr('y2', height + margin.top)
    ;
  };

  // showLegend(data[0]);

  svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

  svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

  itemList.forEach(({lineClass: cls, dataKey}) => {
    if (types.get(dataKey).checked) {
      svg.append('path')
        .data([data])
        .attr('class', `${cls} chart-line`)
        .attr('data-type', dataKey)
        .attr('d', thelines[dataKey])
        .on('click', mouseDown)
        ;
    }
  });

  let lines = document.querySelectorAll('.chart-line');
  let lengths = [...lines].map(line => line.getTotalLength());

  d3.selectAll('.chart-line')
    .attr('stroke-dasharray', (d, i) => `${lengths[i]} ${lengths[i]}`)
    .attr('stroke-dashoffset', (d, i) => `${lengths[i]}`)
    // .attr('stroke-dashoffset', (d, i) => lengths[i])
    .transition()
      .duration(2500)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0)
    ;

  let opacityVal = 1 / (width / (days - 1) > 20 ? data.length : 2);
  let firstSet = true;
  itemList.forEach(({symClass: cls, sym, dataKey}) => {
    if (types.get(dataKey).checked) {
      const tabindex = firstSet ? '0' : '-1';
      // const setAriaLabel = firstSet ? dateAriaLabel : null;
      firstSet = false;
      svg.selectAll(`.${cls}`)
        .data(width / (days - 1) > 20 ? data : [data[0], data[data.length - 1]])
        .enter().append('path')
        .attr('class', cls)
        .attr('tabindex', tabindex)
        // .attr('aria-label', setAriaLabel)
        .attr('role', 'img')
        .attr('aria-labelledby', dateAriaId)
        .style('outline', 'none')
        .attr('d', d3.symbol().type(sym).size(120))
        .attr('transform', d => `translate(${x(d.date)}, ${y(d[dataKey])})`)
        .attr('data-type', dataKey)
        .on('focus', showLegend)
        .on('blur', hideLegend)
        .on('click', mouseDown)
        .attr('opacity', (d, i) => Math.max(0, 0.8 - (opacityVal * i)))
        .transition()
          .duration(2000)
          .delay(800)
          .ease(d3.easeCubicIn)
          .attr('opacity', 1)
        ;
    }
  });

  svg.selectAll('.datedesc')
    .data(data)
    .enter()
      .append('desc')
        .attr('id', dateAriaId)
        .attr('class', '.datedesc')
        .text(dateAriaLabel)
  ;

  // if (area) {
  //   svg.append('path')
  //     .data([data])
  //     .attr('class', 'average-area')
  //     .attr('d', area)
  //     ;
  // }

  const domsvg = document.querySelector('#d3-target > svg');
  let xoffset;
  let buckets;
  let last = -1;
  const getXoffset = function() {
    const vpleft = domsvg.getBoundingClientRect().left;
    xoffset = margin.left + vpleft;
    const half = width / (data.length - 1) / 2;
    buckets = data.map((d, i) => i < (data.length - 1) ? x(d.date) + half : 10000);
  };

  if (oldListener) {
    viewport.removeListener('viewport', oldListener);
  }
  oldListener = getXoffset;

  getXoffset();
  viewport.on('viewport', getXoffset);

  const mainChart = document.querySelector('#main-chart');

  const handleHover = (clientX, clientY) => {
    if (clientY < mainChart.getBoundingClientRect().top) {
      return;
    }
    const pos = clientX - xoffset;
    buckets.some((v, i) => {
      if (pos < v) {
        if (i !== last) {
          showLegend(data[i]);
        }
        return true;
      }
      return false;
    });
  };

  const handleMove = e => {
    let clientY, clientX;

    if (e.clientY === undefined) {
      if (e.touches) {
        clientY = e.touches[0].clientY;
        clientX = e.touches[0].clientX;
      } else {
        return;
      }
    } else {
      clientY = e.clientY;
      clientX = e.clientX;
    }
    handleHover(clientX, clientY);
  };

  domsvg.addEventListener('mousemove', handleMove);
  domsvg.addEventListener('touchmove', handleMove);
  domsvg.addEventListener('mouseleave', hideLegend);
  if (highlight) {
    setHilight(highlight);
  }
}

export {setHilight as setLineHighlight};
