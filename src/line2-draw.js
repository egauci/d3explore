import * as d3 from 'd3';
import viewport from 'viewport-event';

export default function(targetWidth, {amtMin, amtMax, days, data}) {

  const margin = {top: 80, right: 20, bottom: 30, left: 40},
    width = targetWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const x = d3.scaleTime()
    .range([0, width])
    .domain(d3.extent(data.map(d => d.date)))
    ;

  const y = d3.scaleLinear()
    .range([height, 0])
    ;

  let interval = 1;
  while (width / (days - 1) * interval < 60) {
    interval += 1;
  }

  const xValues = data.filter((d, i) => i % interval === 0).map(d => d.date);

  const xAxis = d3.axisBottom(x)
    .tickFormat(d3.timeFormat('%b %d'))
    .tickValues(xValues)
    ;

  const yAxis = d3.axisLeft(y)
    .tickFormat(d3.formatPrefix('.0', 1000000))
    ;

  document.querySelector('#d3-target').innerHTML = '';

  y.domain([
    Math.min(amtMin, d3.min(data, d => Math.min(d.available, d.ledger, d.booked))),
    Math.max(amtMax, d3.max(data, d => Math.max(d.available, d.ledger, d.booked)))]);

  const availableLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.available));

  const ledgerLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.ledger));

  const bookedLine = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.booked));

  const itemList = [
    {lineClass: 'available-line', symClass: 'available-symbol', line: availableLine,
                   sym: d3.symbolSquare, dataKey: 'available', label: 'Open Available'},
    {lineClass: 'ledger-line', symClass: 'ledger-symbol', line: ledgerLine,
                   sym: d3.symbolTriangle, dataKey: 'ledger', label: 'Closing Ledger'},
    {lineClass: 'booked-line', symClass: 'booked-symbol', line: bookedLine,
                   sym: d3.symbolCircle, dataKey: 'booked', label: 'Closing Collected'}
  ];

  const svgTop = d3.select('#d3-target')
      .append('svg')
      .attr('class', 'chart-1 line-1 line-2')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      ;
  const svg = svgTop
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  let legend;

  const showLegend = function(val) {
    const legendWidth = 300;
    const legendHeight = 70;
    let left = Math.max(0, x(val.date) + margin.left - legendWidth / 2);
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
      .selectAll('.legend-line')
        .data(itemList)
        .enter().append('g')
          .attr('class', 'legend-line')
            .append('text')
              .attr('transform', (d, i) => `translate(${left + 160}, ${20 * (i + 1)})`)
              .text(d => d3.format('10,.2f')(val[d.dataKey]) + ' USD')
    ;
    legend.selectAll('.legend-line')
      .append('path')
        .attr('transform', (d, i) => `translate(${left + 20}, ${20 * (i + 1) - 5})`)
        .attr('class', d => d.symClass)
        .attr('d', d => d3.symbol().type(d.sym).size(100)())
      ;
    legend.selectAll('.legend-line')
      .append('text')
        .attr('transform', (d, i) => `translate(${left + 35}, ${20 * (i + 1)})`)
        .text(d => d.label)
      ;
    legend.append('line')
      .attr('x1', x(val.date) + margin.left)
      .attr('x2', x(val.date) + margin.left)
      .attr('y1', legendHeight)
      .attr('y2', height + margin.top)
      .attr('stroke', 'lightblue')
      .attr('stroke-width', 2)
    ;
  };

  const hideLegend = function() {
    if (legend) {
      legend.remove();
      legend = null;
    }
  };

  itemList.forEach(({lineClass: cls, line}) => {
    svg.append('path')
      .data([data])
      .attr('class', cls)
      .attr('d', line)
      ;
  });

  itemList.forEach(({symClass: cls, sym, dataKey}) => {
    svg.selectAll(cls)
      .data(targetWidth >= 600 ? data : [data[0], data[data.length - 1]])
      .enter().append('path')
      .attr('class', cls)
      .attr('d', d3.symbol().type(sym).size(100))
      .attr('transform', d => `translate(${x(d.date)}, ${y(d[dataKey])})`)
      ;
  });

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
  const getXoffset = function(vp) {
    xoffset = margin.left - vp.scrollX;
    const half = width / (data.length - 1) / 2;
    buckets = data.map((d, i) => i < (data.length - 1) ? x(d.date) + half : 10000);
  };
  getXoffset(viewport.getViewport());
  viewport.on('viewport', getXoffset);
  domsvg.addEventListener('mousemove', e => {
    const pos = e.clientX - xoffset;
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
  });

}
