import moment from 'moment';

const randInRange = (min, max) => Math.random() * (max - min) + min;
const variance = function(min, max) {
  let v = 0;
  while (v < min || v > max) {
    v = Math.random() + 0.5;
  }
  return v;
};


export default function({days = 120, min = 10000000, max = 50000000, minvar = 0.85, maxvar = 1.15}) {
  const data = [];

  let dt = moment().set('hour', 0).set('minute', 0).set('second', 0).set('millisecond', 0).subtract(days, 'days');

  while (days > 0) {
    const date = dt.clone().toDate();
    const available = randInRange(min, max);
    const ledger = available * variance(minvar, maxvar);
    const booked = available * variance(minvar, maxvar);
    data.push({date, available, ledger, booked});
    dt = dt.add(1, 'days');
    days -= 1;
  }

  return data;
}
