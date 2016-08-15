// Source http://www.brendansudol.com/posts/responsive-d3/
import {select} from 'd3';

export default function responsivefy(svg) {
  // avoid error due to empty selection
  // for example: selection.enter().call(responsivefy)
  if (svg.empty()) {
    return;
  }

  // get container + svg aspect ratio
  let container = select(svg.node().parentNode),
    width = parseInt(svg.style('width'), 10),
    height = parseInt(svg.style('height'), 10),
    aspect = width / height;

  // get width of container and resize svg to fit it
  function resize() {
    let targetWidth = parseInt(container.style('width'), 10);
    svg.attr('width', targetWidth);
    svg.attr('height', Math.round(targetWidth / aspect), 10);
  }

    // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('perserveAspectRatio', 'xMinYMid')
      .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  select(window).on('resize.' + container.attr('id'), resize);
}
