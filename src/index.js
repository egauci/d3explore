import chart1 from './chart1';
import chart2 from './chart2';
import chart3 from './chart3';
import chart4 from './chart4';
import line1 from './line1';
import line2 from './line2';
import bar1 from './bar1';

// menu comonent

const menu = document.querySelector('#mainmenu');

const components = {
  1: chart1,
  2: chart2,
  3: chart3,
  4: chart4,
  5: line1,
  6: bar1,
  7: line2
};

function handleMenuClick(e) {
  if (e.target.nodeName !== 'A') {
    return;
  }
  e.preventDefault();
  const key = e.target.dataset.id;
  if (components[key]) {
    line2(true);
    components[key]();
  } else {
    throw new Error('unrecognized menu selection');
  }
}

menu.addEventListener('click', handleMenuClick);
