const types = new Map([
  [
    'available',
    {
      label: 'Opening Available',
      color: '#ae2573',
      checked: true
    }
  ],
  [
    'ledger',
    {
      label: 'Closing Ledger',
      color: '#46a033',
      checked: true
    }
  ],
  [
    'booked',
    {
      label: 'Closing Collected',
      color: '#0095c8',
      checked: true
    }
  ],
  [
    'imaginary',
    {
      label: 'Offset',
      color: '#ed8800',
      checked: true
    }
  ]
]);

const chartTypeData = [
  {type: 'line', label: 'Line'},
  {type: 'bar', label: 'Solid Bar'},
  {type: 'pbar', label: 'Patterned Bar'}
];

let period = 7;

let chartType = 'bar';

let curve = 'none';

let highlight;

const selOpts = [
  {val: 7, label: 'Previous 7 days'},
  {val: 30, label: 'Previous 30 days'},
  {val: 60, label: 'Previous 60 days'},
  {val: 90, label: 'Previous 90 days'}
];

const curveOpts = [
  {val: 'none', label: 'No Average Curve'},
  {val: 'curveLinear', label: 'Linear'},
  {val: 'curveMonotoneX', label: 'Monotone X'},
  // {val: 'curveMonotoneY', label: 'Monotone Y'},
  {val: 'curveNatural', label: 'Natural'},
  {val: 'curveStep', label: 'Step'}
  // {val: 'curveStepAfter', label: 'Step After'},
  // {val: 'curveStepBefore', label: 'Step Before'}
];

let resetHighlight;
let hibtns;

/* eslint max-statements: 0 */
const tirSelection = (container1, container2, callback) => {
  const ctOuter = document.createElement('div');
  ctOuter.className = 'tir-chart-type';
  const cthdr = document.createElement('h2');
  cthdr.appendChild(document.createTextNode('Select Chart Type'));
  const ctul = document.createElement('ul');
  chartTypeData.forEach(itm => {
    const li = document.createElement('li');
    const rb = document.createElement('input');
    rb.type = 'radio';
    rb.checked = itm.type === chartType;
    rb.name = 'tir-chart-type';
    rb.dataset.type = itm.type;
    rb.id = `rb-${itm.type}`;
    const label = document.createElement('label');
    label.htmlFor = rb.id;
    label.appendChild(document.createTextNode(itm.label));
    li.appendChild(rb);
    li.appendChild(label);
    ctul.appendChild(li);
  });
  ctOuter.appendChild(cthdr);
  ctOuter.appendChild(ctul);
  const pdOuter = document.createElement('div');
  pdOuter.className = 'tir-period';
  const pdInner = document.createElement('div');
  pdOuter.appendChild(pdInner);
  const pdhdr = document.createElement('h2');
  pdhdr.appendChild(document.createTextNode('Select Period'));
  pdInner.appendChild(pdhdr);
  const sel = document.createElement('select');
  selOpts.forEach(itm => {
    const opt = document.createElement('option');
    if (itm.val === period) {
      opt.selected = true;
    }
    opt.value = String(itm.val);
    opt.appendChild(document.createTextNode(itm.label));
    sel.appendChild(opt);
  });
  pdInner.appendChild(sel);
  const hiInner = document.createElement('div');
  pdOuter.appendChild(hiInner);
  const hihdr = document.createElement('h2');
  hihdr.appendChild(document.createTextNode('Hilight a series'));
  hiInner.appendChild(hihdr);
  hibtns = document.createElement('select');
  hibtns.className = 'highlight-select';
  hibtns.id = 'highlight-select';
  hibtns.setAttribute('aria-label', 'Highlight a Series');
  hiInner.appendChild(hibtns);
  const noneOpt = document.createElement('option');
  noneOpt.value = 'none';
  if (highlight === 'none') {
    noneOpt.selected = true;
  }
  noneOpt.appendChild(document.createTextNode('No Highlight'));
  hibtns.appendChild(noneOpt);

  for (let [k, v] of types) {
    const opt = document.createElement('option');
    if (highlight === k) {
      opt.selected = true;
    }
    opt.value = k;
    opt.id = `${k}-highlight-option`;
    opt.appendChild(document.createTextNode(v.label));
    hibtns.appendChild(opt);
  }

  hibtns.addEventListener('change', e => {
    highlight = e.target.value === 'none' ? null : e.target.value;
    callback();
  });

  const cbOuter = document.createElement('div');
  cbOuter.className = 'tir-checkboxes';
  const ulhdr = document.createElement('h2');
  ulhdr.appendChild(document.createTextNode('Select Balance'));
  cbOuter.appendChild(ulhdr);
  const ul = document.createElement('ul');
  for (let [k, v] of types.entries()) {
    const li = document.createElement('li');
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = v.checked;
    cb.dataset.type = k;
    cb.id = `cb-${k}`;
    const label = document.createElement('label');
    label.htmlFor = cb.id;
    label.appendChild(document.createTextNode(v.label));
    li.appendChild(cb);
    li.appendChild(label);
    ul.appendChild(li);
  }
  cbOuter.appendChild(ul);
  const avgOuter = document.createElement('div');
  avgOuter.className = 'tir-average';
  const avghdr = document.createElement('h2');
  avghdr.appendChild(document.createTextNode('Average Line Curve for Bar Charts'));
  avgOuter.appendChild(avghdr);
  const asel = document.createElement('select');
  curveOpts.forEach(itm => {
    const opt = document.createElement('option');
    if (itm.val === curve) {
      opt.selected = true;
    }
    opt.value = itm.val;
    opt.appendChild(document.createTextNode(itm.label));
    asel.appendChild(opt);
  });
  avgOuter.appendChild(asel);
  container2.innerHTML = '';
  container2.appendChild(ctOuter);
  container1.appendChild(pdOuter);
  container2.appendChild(cbOuter);
  container2.appendChild(avgOuter);
  ul.addEventListener('click', e => {
    if (e.target.nodeName !== 'INPUT') {
      return;
    }
    const type = e.target.dataset.type;
    const entry = types.get(type);
    entry.checked = e.target.checked;
    types.set(type, entry);
    callback();
  });
  ctul.addEventListener('click', e => {
    if (e.target.nodeName !== 'INPUT') {
      return;
    }
    const newType = ctul.querySelector('input:checked').dataset.type;
    if (newType !== chartType) {
      chartType = newType;
      callback();
      return;
    }
  });
  sel.addEventListener('change', e => {
    period = Number(e.target.value);
    callback();
  });
  asel.addEventListener('change', e => {
    curve = e.target.value;
    callback();
  });
};

resetHighlight = () => {
  highlight = null;
  hibtns.value = 'none';
};

export {tirSelection, types, period, chartType, curve, highlight, resetHighlight};
