function highchartTurnStrToFunction(t,r){return r&&"string"==typeof r&&0===r.indexOf("function(")?new Function("return "+r)():r}function setSynchronizedChart(t,r){var e=0,h=0;0!==$(t).width()&&(e=$(t).width()),0!==$(t).height()&&(h=$(t).height()/r.length);for(var i=[],n=0;n<r.length;n++){var s=JSON.parse(r[n],highchartTurnStrToFunction);s.xAxis[0].events.setExtremes=u,$('<div class="chart'+n+'" style="width:'+(0!=e?e+"px":"auto")+";height:"+(0!=h?h+"px":"auto")+';">').appendTo(t).highcharts(s);var a=$(t+" div.chart"+n).data("highchartsChart"),o=Highcharts.charts[a];i.push(o)}function c(t,r){r.onMouseOver(),r.series.chart.tooltip.refresh(r),r.series.chart.xAxis[0].drawCrosshair(t,r)}function u(t){var r=this.chart;"syncExtremes"!==t.trigger&&Highcharts.each(Highcharts.charts,function(e){e!==r&&e.xAxis[0].setExtremes&&e.xAxis[0].setExtremes(t.min,t.max,void 0,!1,{trigger:"syncExtremes"})})}$(t).bind("mousemove touchmove touchstart",function(t){var r,e,h;for(e=0;e<i.length;e+=1)h=i[e].pointer.normalize(t.originalEvent),(r=i[e].series[0].searchPoint(h,!0))&&c(t,r)})}