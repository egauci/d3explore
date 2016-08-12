import chart1 from './chart1';

// menu comonent

const menu = document.querySelector('#mainmenu');

function handleMenuClick(e) {
  if (e.target.nodeName !== 'A') {
    return;
  }
  e.preventDefault();
  const d3target = document.querySelector('#d3-target');
  switch (e.target.dataset.id) {
  case '1':
    d3target.innerHTML = '';
    chart1();
    break;
  default:
    throw new Error('unrecognized menu selection');
  }
}

menu.addEventListener('click', handleMenuClick);
