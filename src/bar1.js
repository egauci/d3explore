import * as d3 from 'd3';
import getData from './tirdata';
import responsivefy from './responsivefy';

export default function () {

  const amtMin = 10000000;
  const amtMax = 50000000;
  const days = 7;

  const timeFmt = d3.timeFormat('%b %d');
  const data = getData({days, min: amtMin, max: amtMax}).map(d => Object.assign(d, {date: timeFmt(d.date)}));

  const margin = {top: 80, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const x0 = d3.scaleBand()
    .range([0, width], 0.1)
    .domain(data.map(d => d.date))
    // .paddingInner(0.2)
    // .paddingOuter(0.2)
    ;

  const x1 = d3.scaleBand()
    .domain(['steelblue', 'darkorange', 'purple'])
    .paddingOuter(0.1)
    ;

  const y = d3.scaleLinear()
    .range([height, 0])
    ;

  const xAxis = d3.axisBottom(x0)
    ;

  const yAxis = d3.axisLeft(y)
    .tickFormat(d3.formatPrefix('.0', 1000000))
    ;

  document.querySelector('#d3-target').innerHTML = '';

  x1.range([0, width / data.length]);
  y.domain([
    Math.min(amtMin, d3.min(data, d => Math.min(d.available, d.ledger, d.booked))),
    Math.max(amtMax, d3.max(data, d => Math.max(d.available, d.ledger, d.booked)))]);


  const itemList = [
    {lsymClass: 'available-symbol',
                   sym: d3.symbolSquare, dataKey: 'available', label: 'Open Available'},
    {symClass: 'ledger-symbol',
                   sym: d3.symbolSquare, dataKey: 'ledger', label: 'Closing Ledger'},
    {symClass: 'booked-symbol',
                   sym: d3.symbolSquare, dataKey: 'booked', label: 'Closing Collected'}
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
    let left = Math.max(0, x0(val.date) + margin.left / 2 - x0.bandwidth() / 2);
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
      .data(itemList)
      .append('path')
        .attr('transform', (d, i) => `translate(${left + 20}, ${20 * (i + 1) - 5})`)
        .attr('class', d => d.symClass)
        .attr('d', d => d3.symbol().type(d.sym).size(100)())
      ;
    legend.selectAll('.legend-line')
      .data(itemList)
      .append('text')
        .attr('transform', (d, i) => `translate(${left + 35}, ${20 * (i + 1)})`)
        .text(d => d.label)
      ;
    legend.append('line')
      .attr('x1', x0(val.date) + margin.left + x0.bandwidth() / 2)
      .attr('x2', x0(val.date) + margin.left + x0.bandwidth() / 2)
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

  svg.selectAll('.bar-group')
    .data(data)
    .enter()
      .append('g')
      .attr('class', 'bar-group')
      .attr('transform', d => `translate(${x0(d.date)}, 0)`)
      .on('mouseenter', showLegend)
      .on('mouseleave', hideLegend)
      .selectAll('.one-bar')
        .data(d => [d.available, d.ledger, d.booked])
        .enter()
        .append('rect')
        .attr('class', 'one-bar')
        .attr('height', d => height - y(d))
        .attr('width', x1.bandwidth())
        .attr('x', (d, i) => x1.bandwidth() * i + x1.bandwidth() * x1.paddingOuter())
        .attr('fill', (d, i) => x1.domain()[i])
        .attr('y', y)
      ;

  svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

  svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

}
