import * as d3 from 'd3';
import data from './data';

const margin = {top: 20, right: 20, bottom: 30, left: 40},
  width = 960 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const x = d3.scaleBand()
  .domain(data.map(d => d.letter))
  .range([0, width]);

const y = d3.scaleLinear()
  .range([height, 0]);

const xAxis = d3.axisBottom(x);

const yAxis = d3.axisLeft(y);

export default function () {

  const svg = d3.select('#d3-target').append('svg')
      .attr('class', 'chart-1')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  x.domain(data.map(d => d.letter))
    .paddingInner(0.1)
    .paddingOuter(0.05);
  y.domain([0, d3.max(data, d => d.frequency)]);

  svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);

  svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('fill', 'black')
        .text('Frequency');

  svg.selectAll('.bar')
        .data(data)
      .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.letter))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.frequency))
        .attr('height', d => height - y(d.frequency));
}
