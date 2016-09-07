import * as d3 from 'd3';
import viewport from 'viewport-event';

let oldListener;

/* eslint max-statements: 0 */
export default function (targetWidth, targetHeight, {amtMax, days, data: odata, types, chartType}) {

// use the same data source as line chart, however bars work better with
// scaleBand rather than
// the continuous timeBand. Convert the date property to String.
  const timeFmt = d3.timeFormat('%b %d');
  const data = odata.map(d => Object.assign({}, d, {date: timeFmt(d.date), odate: d.date}));

  const margin = {top: 130, right: 30, bottom: 30, left: 40},
    width = targetWidth - margin.left - margin.right,
    height = targetHeight - margin.top - margin.bottom;

// x0 is the main x axis, with one band per day
  const x0 = d3.scaleBand()
    .range([0, width], 0.1)
    .domain(data.map(d => d.date))
    ;

  const itemList = [
    {symClass: 'available-symbol', sym: d3.symbolSquare, dataKey: 'available', label: 'Open Available'},
    {symClass: 'ledger-symbol', sym: d3.symbolSquare, dataKey: 'ledger', label: 'Closing Ledger'},
    {symClass: 'booked-symbol', sym: d3.symbolSquare, dataKey: 'booked', label: 'Closing Collected'}
  ];

  let x1Domain = [];
  let keys = [];
  itemList.forEach(({dataKey}) => {
    if (types.get(dataKey).checked) {
      x1Domain = [...x1Domain, types.get(dataKey).color];
      keys = [...keys, dataKey];
    }
  });

// The x1 scale is for each group of three
  const x1 = d3.scaleBand()
    .domain(x1Domain)
    .paddingOuter(0.5)
    .paddingInner(0.1)
    ;

  const y = d3.scaleLinear()
    .range([height, 0])
    ;

  let interval = 1;
  while (width / days * interval < 50) {
    interval += 1;
  }

  const xValues = data.filter((d, i) => i % interval === 0).map(d => d.date);

  const xAxis = d3.axisBottom(x0)
    .tickValues(xValues)
    ;

  x1.range([0, width / data.length]);

  // const yMin = Math.min(amtMin, d3.min(data, d => Math.min(d.available, d.ledger, d.booked)));
  const yMin = 0;
  const yMax = Math.max(amtMax, d3.max(data, d => Math.max(d.available, d.ledger, d.booked)));
  let yValues = [];
  for (let i = 0; i <= yMax; i += 5000000) {
    yValues = [...yValues, i];
  }
  y.domain([yMin, yMax]);

  const yAxis = d3.axisLeft(y)
    .tickFormat(d3.formatPrefix('.0', 1000000))
    .tickValues(yValues)
    ;

  const container = d3.select('#d3-target');
  const svgTop = container
      .append('svg')
      .attr('class', 'chart-1 line-1 tbar-1')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('background', '#f8f5ed')
      ;

  const defs = svgTop.append('defs');
  defs.append('pattern')
      .attr('id', 'pattern-available')
      .attr('width', '3')
      .attr('height', '3')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(45)')
      .append('rect')
        .attr('width', '2')
        .attr('height', '3')
        .attr('transform', 'translate(0,0)')
        .attr('fill', 'white')
      ;
  defs.append('mask')
      .attr('id', 'mask-available')
      .append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#pattern-available)')
      ;
  defs.append('pattern')
      .attr('id', 'pattern-ledger')
      .attr('width', '3')
      .attr('height', '3')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(90)')
      .append('rect')
        .attr('width', '2')
        .attr('height', '3')
        .attr('transform', 'translate(0,0)')
        .attr('fill', 'white')
      ;
  defs.append('mask')
      .attr('id', 'mask-ledger')
      .append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#pattern-ledger)')
      ;
  defs.append('pattern')
      .attr('id', 'pattern-booked')
      .attr('width', '3')
      .attr('height', '3')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('patternTransform', 'rotate(135)')
      .append('rect')
        .attr('width', '2')
        .attr('height', '3')
        .attr('transform', 'translate(0,0)')
        .attr('fill', 'white')
      ;
  defs.append('mask')
      .attr('id', 'mask-booked')
      .append('rect')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('fill', 'url(#pattern-booked)')
      ;

  // the "down-line" from the legend to the Y axis. Draw it here so it is
  // behind the chart.
  const legLine = svgTop.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', 'lightblue')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      ;

  const svg = svgTop
      .append('g')
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
      d3.selectAll('.one-bar')
        .style('opacity', 1);
      highlighted = false;
    }
  };

  const mouseDown = () => { // dim "other" lines
    const notincluded = d3.event.target.getAttribute('data-type');
    if (highlighted && highlighted === notincluded) {
      mouseUp();
      return;
    }
    d3.selectAll(`.one-bar:NOT([data-type="${notincluded}"])`)
      .style('opacity', 0.3);
    d3.selectAll(`.one-bar[data-type="${notincluded}"]`)
      .style('opacity', 1);
    highlighted = notincluded;
  };

  let legend;

  const legendTimeFmt = d3.timeFormat('%B %e');

  const showLegend = function(val) {
    const legendWidth = 300;
    const legendHeight = 120;
    let left = Math.max(0, x0(val.date) + margin.left + x0.bandwidth() / 2 - legendWidth / 2);
    left = Math.min(width + margin.left + margin.right - legendWidth, left);
    legend = svgTop.append('g')
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
        .attr('transform', `translate(${left + 37}, 25)`)
        .text(legendTimeFmt(val.odate))
        ;
    legend.append('g')
      .selectAll('.legend-line')
        .data(itemList)
        .enter().append('g')
          .attr('class', 'legend-line')
            .append('text')
              .attr('transform', (d, i) => `translate(${left + 160}, ${25 * (i + 2)})`)
              .text(d => d3.format('10,.2f')(val[d.dataKey]) + ' USD')
    ;
    legend.selectAll('.legend-line')
      .append('rect')
        .attr('transform', (d, i) => `translate(${left + 12}, ${25 * (i + 2) - 13})`)
        .attr('class', d => types.get(d.dataKey).checked ? d.symClass : 'hidden')
        .attr('data-type', d => d.dataKey)
        .attr('x', '0')
        .attr('y', '0')
        .attr('height', '15')
        .attr('width', '15')
        .attr('mask', d => chartType === 'bar' ? 'none' : `url(#mask-${d.dataKey})`)
        .on('click', mouseDown)
      ;
    legend.selectAll('.legend-line')
      .append('text')
        .attr('transform', (d, i) => `translate(${left + 35}, ${25 * (i + 2)})`)
        .text(d => d.label)
      ;
    legLine.attr('opacity', 1)
      .attr('x1', x0(val.date) + margin.left + x0.bandwidth() / 2)
      .attr('x2', x0(val.date) + margin.left + x0.bandwidth() / 2)
      .attr('y1', legendHeight)
      .attr('y2', height + margin.top)
    ;
  };

  const hideLegend = function() {
    if (legend) {
      legend.remove();
      legend = null;
      legLine.attr('opacity', 0);
    }
  };

  showLegend(data[0]);

  const retBarData = d => keys.map(k => d[k]);

  svg.selectAll('.bar-group')
    .data(data)
    .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${x0(d.date)}, 0)`)
      .selectAll('.one-bar')
        .data(d => retBarData(d))
        .enter()
        .append('rect')
        .attr('class', 'one-bar')
        .attr('data-type', (d, i) => keys[i])
        .attr('height', d => height - y(d))
        .attr('width', x1.bandwidth())
        .attr('x', (d, i) => x1.step() * i + x1.step() * x1.paddingOuter())
        .attr('fill', (d, i) => x1.domain()[i])
        .attr('y', y)
        .attr('mask', (d, i) => chartType === 'bar' ? 'none' : `url(#mask-${keys[i]})`)
        .on('click', mouseDown)
      ;

  svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

  svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

  const domsvg = document.querySelector('#d3-target > svg');
  let xoffset;
  let buckets;
  let last = -1;
  const getXoffset = function() {
    const vpleft = domsvg.getBoundingClientRect().left;
    xoffset = margin.left + vpleft;
    buckets = data.map((d, i) => i < (data.length - 1) ? x0(d.date) + x0.bandwidth() : 10000);
  };

  if (oldListener) {
    viewport.removeListener('viewport', oldListener);
  }
  oldListener = getXoffset;

  getXoffset();
  viewport.on('viewport', getXoffset);

  const mainChart = document.querySelector('svg > g:first-of-type');

  const handleHover = (clientX, clientY) => {
    if (clientY < mainChart.getBoundingClientRect().top) {
      return;
    }
    const pos = clientX - xoffset;
    buckets.some((v, i) => {
      if (pos < v) {
        if (i !== last) {
          hideLegend();
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
}
