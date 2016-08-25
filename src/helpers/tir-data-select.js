const types = new Map([
  [
    'available',
    {
      label: 'Opening Available',
      checked: true
    }
  ],
  [
    'ledger',
    {
      label: 'Closing Ledger',
      checked: true
    }
  ],
  [
    'booked',
    {
      label: 'Closing Collected',
      checked: true
    }
  ]
]);

let period = 7;

const selOpts = [
  {val: 7, label: 'Previous 7 days'},
  {val: 30, label: 'Previous 30 days'},
  {val: 60, label: 'Previous 60 days'},
  {val: 90, label: 'Previous 90 days'}
];

const tirSelection = (container, callback) => {
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
  sel.addEventListener('change', e => {
    period = Number(e.target.value);
    callback();
  });
};

export {tirSelection, types, period};
