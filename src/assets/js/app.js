
$(document).foundation();


(function(d3) {

    'use strict';

    var dataset = [
        {name: 'White', value: 9497},
        {name: 'Hispanic', value: 7448},
        {name: 'Other', value: 3348},
    ];

    var WIDTH = 400,
        HEIGHT = 400;

    var vis,                                                // 整個圖表 select('g')
        pie,                                                // 用來轉換資料給弧形用 d3.layout.pie()
        arc,                                                // 做弧形用 d3.svg.arc()
        heading,                                            // 標題
        colors = ['#fec134', '#fed167', '#fee09a'],  // 弧形用到的顏色
        pickColor,                                          // 顏色選擇函式
        reqId,                                              // 註冊瀏覽器動畫用
        count = 0,                                          // 給動畫跑計數用
        radius = Math.min(WIDTH, HEIGHT) / 1.8,               // 甜甜圈圖的半徑
        outerRadius = radius / 2,                           // 甜甜圈圖的外半徑
        innerRadius = radius / 2.8,                         // 甜甜圈圖的內半徑

        // 計算所有人口的總和 (singleton)
        total = (function() {
            for(var sum = 0, i = 0; i < dataset.length; i++) {
                sum += dataset[i].value;
            }
            return sum;
        })();

    // 初始化圖表
    var init = function() {

        vis = d3.select('#container')
                .append('svg:svg')
                .attr('width', WIDTH)
                .attr('height', HEIGHT)
                .append('g')
                .attr('transform', 'translate('+ WIDTH / 2 + ',' + HEIGHT / 2 +')');

        pie = d3.layout.pie()
                .sort(null)
                .startAngle(0)
                .endAngle(2 * Math.PI)
                .value(function(d) {
                    return d.value;
                });

        arc = d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);

        pickColor = d3.scale.ordinal().range(colors);

        vis.selectAll('g')
            .data(pie(dataset))
            .enter()
            .append('svg:g')
            .attr('class', 'group')
            .on('mouseover', mouseOverHandler)
            .on('mouseout', mouseOutHandler)
            .append('path')
            .attr('class', 'arc')
            .attr('fill', function(d, i) { return pickColor(i); })
            .transition()
            .delay(function(d, i) { return i * 500; })
            .duration(500)
            .attrTween('d', angleTween);

        vis.selectAll('g')
            .append('svg:text')
            .attr('class', 'name')
            .attr('dy', 6)
            .attr('fill', '#FFF')
            .attr('transform', function(d) {
                return 'translate(' + arc.outerRadius(outerRadius * 2.5).centroid(d)[0] + ',' + arc.outerRadius(outerRadius * 2.5).centroid(d)[1] + ')';
            })
            .transition()
            .delay(function(d, i) { return i * 500 + 500; })
            .duration(500)
            .ease('cubic-in-out')
            .attrTween('fill', fillTween)
            .text(function(d) {
                return d.data.name;
            })
            .style('font-size', radius * 0.06 + 'px');

        vis.selectAll('g')
            .append('svg:line')
            .attr('x1', function(d) { return arc.outerRadius(outerRadius * 1.3).centroid(d)[0]; })
            .attr('y1', function(d) { return arc.outerRadius(outerRadius * 1.3).centroid(d)[1]; })
            .transition()
            .delay(function(d, i) { return i * 500 + 500; })
            .duration(500)
            .attrTween('x2', xTween)
            .attrTween('y2', yTween)
            .attr('class', 'line');

        vis.append('svg:text')
            .attr('class', 'heading')
            .style('font-size', 5 + radius * 0.1 + 'px')
            .text('STUDENTS');

        vis.append('svg:text')
            .attr('class', 'count')
            .attr('dy', 20 + radius * 0.05)
            .style('font-size', radius * 0.08 + 'px');

        runCounter();
    };

    // 為數字加上逗點
    var numericFormat = function(num) {
        var reg = /(\d+)(\d{3})/,
            num = '' + parseInt(num);
        while(reg.test(num)) {
            num = num.replace(reg, '$1' + ',' + '$2');
        }
        return num;
    };

    // 計數效果
    var runCounter = function() {
        count += 20293;
        if(count < total) {
            d3.select('.count').text(numericFormat(count) + '');
            reqId = requestAnimationFrame(runCounter);
        } else {
            d3.select('.count').text(numericFormat(total) + '');
            cancelAnimationFrame(reqId);
        }
    };

    // 滑鼠移至弧形上的效果
    var mouseOverHandler = function(d) {
        cancelAnimationFrame(reqId);
        d3.select(this).selectAll('path, text, line').classed({'hover': true});
      	d3.select(this).select('.name').style('font-size', radius * 0.07 + 'px');
        d3.select('.heading').classed({'hover': true}).text(d.data.name);
        d3.select('.count').classed({'hover': true}).text(numericFormat(d.value));
    };

    // 滑鼠離開弧形後的效果
    var mouseOutHandler = function() {
        reqId = requestAnimationFrame(runCounter);
        d3.select(this).selectAll('path, text, line').classed({'hover': false});
      	d3.select(this).select('.name').style('font-size', radius * 0.06 + 'px');
        d3.select('.heading').classed({'hover': false}).text('Students');
        d3.select('.count').classed({'hover': false});
    };

    // 弧形角度的動畫
    var angleTween = function(d) {
        var i = d3.interpolate(d.startAngle, d.endAngle);
        return function(t) {
            d.endAngle = i(t);
            arc.innerRadius(innerRadius).outerRadius(outerRadius);
            return arc(d);
        }
    };

    // 文字顏色的動畫
    var fillTween = function(d) {
        var i = d3.interpolate('#FFF', '#C70');
        return function(t) {
            return i(t);
        }
    };

    // 線條的動畫 (x座標)
    var xTween = function(d) {
        var i = d3.interpolate(arc.outerRadius(outerRadius * 1.3).centroid(d)[0], arc.outerRadius(outerRadius * 2.2).centroid(d)[0]);
        return function(t) {
            return i(t);
        }
    };

    // 線條的動畫 (y座標)
    var yTween = function(d) {
        var i = d3.interpolate(arc.outerRadius(outerRadius * 1.3).centroid(d)[1], arc.outerRadius(outerRadius * 2.2).centroid(d)[1]);
        return function(t) {
            return i(t);
        }
    };

    return init();

})(window.d3);
$(window).on('changed.zf.mediaquery', function(event,newSize, oldSize){
  if (newSize === "small" && oldSize=== "medium"){
    $('#main-menu ul').removeClass('expanded');

  }
  if(newSize === 'medium' && oldSize === 'small'){
    $('#main-menu ul').addClass('expanded');
  }
});

var size = Foundation.MediaQuery.current;
if(size === 'small'){
  $('#main-menu ul').removeClass('expanded');
}
