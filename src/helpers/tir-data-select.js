const types = new Map([
  [
    'available',
    {
      label: 'Opening Available',
      color: '#6c54a1',
      checked: true
    }
  ],
  [
    'ledger',
    {
      label: 'Closing Ledger',
      color: '#800055',
      checked: true
    }
  ],
  [
    'booked',
    {
      label: 'Closing Collected',
      color: '#488074',
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

const selOpts = [
  {val: 7, label: 'Previous 7 days'},
  {val: 30, label: 'Previous 30 days'},
  {val: 60, label: 'Previous 60 days'},
  {val: 90, label: 'Previous 90 days'}
];

const tirSelection = (container, callback) => {
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
  const pdhdr = document.createElement('h2');
  pdhdr.appendChild(document.createTextNode('Select Period'));
  pdOuter.appendChild(pdhdr);
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
  pdOuter.appendChild(sel);
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
  container.appendChild(ctOuter);
  container.appendChild(pdOuter);
  container.appendChild(cbOuter);
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
};

export {tirSelection, types, period, chartType};
