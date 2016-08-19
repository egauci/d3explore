import * as d3 from 'd3';
import getData from './tirdata';
import responsivefy from './responsivefy';

export default function () {

  const amtMin = 10000000;
  const amtMax = 50000000;
  const days = 7;

  const data = getData({days, min: amtMin, max: amtMax});

  const margin = {top: 80, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const x = d3.scaleTime()
    .range([0, width])
    ;

  const y = d3.scaleLinear()
    .range([height, 0])
    ;

  const xAxis = d3.axisBottom(x)
    // .ticks(d3.timeDay.every(1))
    .tickFormat(d3.timeFormat('%b %d'))
    ;

  if (days < 10) {
    xAxis.ticks(d3.timeDay.every(1));
  }

  const yAxis = d3.axisLeft(y)
    .tickFormat(d3.formatPrefix('.0', 1000000))
    ;

  document.querySelector('#d3-target').innerHTML = '';

  x.domain(d3.extent(data.map(d => d.date)));
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

  const dataMap = [
    {lineClass: 'available-line', symClass: 'available-symbol', line: availableLine,
                   sym: d3.symbolSquare, val: 'available', label: 'Open Available'},
    {lineClass: 'ledger-line', symClass: 'ledger-symbol', line: ledgerLine,
                   sym: d3.symbolTriangle, val: 'ledger', label: 'Closing Ledger'},
    {lineClass: 'booked-line', symClass: 'booked-symbol', line: bookedLine,
                   sym: d3.symbolCircle, val: 'booked', label: 'Closing Collected'}
  ];

  const svgTop = d3.select('#d3-target')
      .append('svg')
      .attr('class', 'chart-1 line-1')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .call(responsivefy);
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
        .data(dataMap)
        .enter().append('g')
          .attr('class', 'legend-line')
            .append('text')
              .attr('transform', (d, i) => `translate(${left + 160}, ${20 * (i + 1)})`)
              .text(d => d3.format('10,.2f')(val[d.val]) + ' USD')
    ;
    legend.selectAll('.legend-line')
      .data(dataMap)
      .append('path')
        .attr('transform', (d, i) => `translate(${left + 20}, ${20 * (i + 1) - 5})`)
        .attr('class', d => d.symClass)
        .attr('d', d => d3.symbol().type(d.sym).size(100)())
      ;
    legend.selectAll('.legend-line')
      .data(dataMap)
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

  dataMap.forEach(({lineClass: cls, line}) => {
    svg.append('path')
      .data([data])
      .attr('class', cls)
      .attr('d', line);
  });

  dataMap.forEach(({symClass: cls, sym, val}) => {
    svg.selectAll(cls)
      .data(data)
      .enter().append('path')
      .attr('class', cls)
      .attr('d', d3.symbol().type(sym).size(100))
      .attr('transform', d => `translate(${x(d.date)}, ${y(d[val])})`)
      .on('mouseenter', showLegend)
      .on('mouseleave', hideLegend)
      ;
  });

  svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

  svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

}
