import chart1 from './chart1';
import chart2 from './chart2';
import chart3 from './chart3';
import chart4 from './chart4';

// menu comonent

const menu = document.querySelector('#mainmenu');

function handleMenuClick(e) {
  if (e.target.nodeName !== 'A') {
    return;
  }
  e.preventDefault();
  switch (e.target.dataset.id) {
  case '1':
    chart1();
    break;
  case '2':
    chart2();
    break;
  case '3':
    chart3();
    break;
  case '4':
    chart4();
    break;
  default:
    throw new Error('unrecognized menu selection');
  }
}

menu.addEventListener('click', handleMenuClick);
