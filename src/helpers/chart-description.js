import {types} from './tir-data-select';
import {timeFormat, format} from 'd3';

const descTimeFormat = timeFormat('%B %e');
const descAmtFormat = format('10,.2f');

const itemSummary = (data, key, dtkey) => {
  const label = types.get(key).label;
  const initStats = {lowest: {amt: Infinity, date: null}, highest: {amt: -Infinity}};
  const stats = data.reduce((prevStats, item) => {
    const curStats = Object.assign({}, prevStats);
    if (item[key] < curStats.lowest.amt) {
      curStats.lowest.amt = item[key];
      curStats.lowest.date = item[dtkey];
    }
    if (item[key] > curStats.highest.amt) {
      curStats.highest.amt = item[key];
      curStats.highest.date = item[dtkey];
    }
    return curStats;
  }, initStats);
  return `The highest ${label} was ${descAmtFormat(stats.highest.amt)} USD on ${descTimeFormat(stats.highest.date)},
    and the lowest ${label} was on ${descAmtFormat(stats.lowest.amt)} USD on ${descTimeFormat(stats.lowest.date)}.`;
};

export const chartDescription = data => {
  const days = data.length;
  const last = days - 1;
  const lines = [];
  const dtkey = data[0].odate ? 'odate' : 'date';
  lines[0] = `The chart spans ${descTimeFormat(data[0][dtkey])} to ${descTimeFormat(data[last][dtkey])}.`;
  for (let [k, v] of types) {
    if (v.checked) {
      lines.push(itemSummary(data, k, dtkey));
    }
  }
  return lines.join('\n\n');
};

export const dateAriaLabel = d => {
  const dtkey = d.odate ? 'odate' : 'date';
  const lines = [`Date: ${descTimeFormat(d[dtkey])}.`];
  for (let [k, v] of types) {
    if (v.checked) {
      lines.push(`${types.get(k).label}: ${descAmtFormat(d[k])} USD.`);
    }
  }
  return lines.join('\n');
};
