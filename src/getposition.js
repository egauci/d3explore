export default function(el) {
  let yPos = 0, xPos = 0;
  while (el) {
    if (el.tagName === 'BODY') {
      // deal with browser quirks with body/window/document and page scroll
      const xScroll = el.scrollLeft || document.documentElement.scrollLeft;
      const yScroll = el.scrollTop || document.documentElement.scrollTop;

      xPos += (el.offsetLeft - xScroll + el.clientLeft);
      yPos += (el.offsetTop - yScroll + el.clientTop);
    } else {
      // for all other non-BODY elements
      xPos += ((el.offsetLeft || 0) - el.scrollLeft + el.clientLeft);
      yPos += ((el.offsetTop || 0) - el.scrollTop + el.clientTop);
    }
    el = el.offsetParent;
  }
  return {xPos, yPos};
}
