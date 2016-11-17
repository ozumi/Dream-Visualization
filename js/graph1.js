/**
 * Created by 오주영 on 2016-11-16.
 */
d3.csv("../dream.csv", function(error,dataSet){
    //read data : frequency,memory,action,lucid,dejavu
    dataSet.forEach(function (d) {
        d.frequency = +d.frequency;
        d.memory = d.memory;
        d.action = d.action;
        d.lucid = +d.lucid;
        d.dejavu = +d.dejavu;
    });

    const maxVal = [4,3,3,4,3];
    var color1 = d3.scale.category20b();
    var color2 = d3.scale.category20c();
    var colNum = ["frequency","memory","action","lucid","dejavu"];
    var mouseOn = false;
    var hgCol = 0;
    var pieCol = 3;

    function getNum(col, Data){
        result = [];
        for(var j=0; j<maxVal[col]; j++){
            result[j] = 0;
        }

        var val;
        for(var i=0; i<Data.length; i++){
            if(col==0) val = Data[i].frequency;
            else if(col==1) val = Data[i].memory;
            else if(col==2) val = Data[i].action;
            else if(col==3) val = Data[i].lucid;
            else if(col==4) val = Data[i].dejavu;

            result[val-1]++;
        }
        return result;
    }

    function getText(col, d){
        if(col==0) {//freq
            if (d == 0) return "Almost Everyday";
            else if (d == 1) return "3~4 times / week";
            else if (d == 2) return "3~4 times / month";
            else if (d == 3) return "few times / year";
        }
        else if(col==1) {//memory
            if (d == 0) return "Memorize vividly";
            else if (d == 1) return "Remember dimly";
            else if (d == 2) return "Forget all";
        }
        else if(col==2) {//action
            if (d == 0) return "Memo it";
            else if (d == 1) return "Tell somebody";
            else if (d == 2) return "Nothing";
        }
        else if(col==3) {//lucid
            if (d == 0) return "Control freely";
            else if (d == 1) return "Frequently";
            else if (d == 2) return "few times";
            else if (d == 3) return "Never";
        }
        else if(col==4) {//dejavu
            if (d == 0) return "Frequently";
            else if (d == 1) return "several times";
            else if (d == 2) return "Never";
        }

    }

    function histogram(col, div){
        var hg = {}, hgDim = {t:60, r:30, b:30, l:0};
        hgDim.w = 500 - hgDim.l - hgDim.r;
        hgDim.h = 300 - hgDim.t - hgDim.b;

        var HGsvg = d3.select(div).append("svg")
            .attr("id", "histogram")
            .attr("width", hgDim.w + hgDim.l + hgDim.r)
            .attr("height", hgDim.h + hgDim.t + hgDim.b)
            .append("g")
            .attr("transform", "translate(" + hgDim.l + "," + hgDim.t + ")");

        var domainArray = [];
        if(maxVal[col]==3)  domainArray = [0, 1, 2];
        else domainArray = [0, 1, 2, 3];

        var x = d3.scale.ordinal()
            .domain(domainArray)
            .rangeRoundBands([0, hgDim.w], 0.1);

        yData = getNum(col, dataSet);

        HGsvg.append("g")
            .selectAll("text")
            .data(yData).enter()
            .append("text")
            .text(function(d,i){ return getText(col, i);})
            .attr("x", function(d,i){ return Math.round(x(i) + x.rangeBand()/2);})
            .attr("y", function(d,i){ return hgDim.h+20;})
            .attr("text-anchor", "middle");

        var y = d3.scale.linear().range([hgDim.h, 0])
            .domain([0, d3.max(yData)]);

        var bars = HGsvg.selectAll(".bar")
            .data(yData)
            .enter()
            .append("g")
            .attr("class", "bar");

        bars.append("rect")
            .attr("x", function(d,i){ return x(i);})
            .attr("y", function(d,i){ return y(yData[i])})
            .attr("width", Math.round(x.rangeBand()))
            .attr("height", function(d,i){ return hgDim.h-y(yData[i])})
            .attr("fill", function(d,i){return color1(i);})
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        bars.append("text")
            .text(function(d,i){ return d3.format(",")(yData[i])})
            .attr("x", function(d,i){ return Math.round(x(i) + x.rangeBand()/2);})
            .attr("y", function(d,i){ return y(yData[i])-10;})
            .attr("text-anchor", "middle");

        function mouseover(d,i){
            //selected
            console.log("mouseover");
            if(col==0)
                var st = dataSet.filter(function(s){ return s.frequency-1 == i;});
            else if(col==1)
                var st = dataSet.filter(function(s){ return s.memory-1 == i;});
            else if(col==2)
                var st = dataSet.filter(function(s){ return s.action-1 == i;});
            else if(col==3)
                var st = dataSet.filter(function(s){ return s.lucid-1 == i;});
            else if(col==4)
                var st = dataSet.filter(function(s){ return s.dejavu-1 == i;});

            var nData = getNum(pieCol, st);

            pc.update(nData);
            leg.update(nData);
        }

        function mouseout(d){
            console.log("mouseout");
            var nData = getNum(pieCol, dataSet);
            pc.update(nData);
            leg.update(nData);
        }

        hg.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d; })]);

            // Attach the new data to the bars.
            var bars = HGsvg.selectAll(".bar").data(nD);
            // transition the height and color of rectangles.

            if(mouseOn) {
                bars.select("rect").transition().duration(500)
                    .attr("y", function(d) {return y(d); })
                    .attr("height", function(d) { return hgDim.h - y(d); })
                    .attr("fill", color);
            }else{
                bars.select("rect").transition().duration(500)
                    .attr("y", function(d) {return y(d); })
                    .attr("height", function(d) { return hgDim.h - y(d); })
                    .attr("fill", function(d,i) { return color1(i); });
            }

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d)})
                .attr("y", function(d) {return y(d)-5; });
        }

        window.Hfilter = function(type){

            console.log(type);
            for(var i=0; i<5; i++) {
                if (type == colNum[i])
                    hgCol = i;
            }
            var nD = getNum(hgCol, dataSet);

            d3.select("#histogram").remove();
            d3.select("#piechart").remove();
            d3.select("#legend").remove();
            hg = histogram(hgCol, "#graph");
            pc = piechart(pieCol, "#graph");
            leg = legend(pieCol, "#graph");
        };


        return hg;
    }


    function piechart(col, div){
        var pc = {}, pieDim = {w:250, h:250};
        pieDim.r = Math.min(pieDim.w, pieDim.h)/2;

        var PIEsvg = d3.select("div").append("svg")
            .attr("id", "piechart")
            .attr("width", pieDim.w)
            .attr("height", pieDim.h)
            .append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");

        /*
        PIEsvg.append("text")
            .text(colNum[col])
            .attr("x", pieDim.w/2)
            .attr("y", pieDim.h/2)
            .attr("class", "title");
           // .attr("text-anchor", "middle");
*/
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        var freq = getNum(col, dataSet);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d; });

        PIEsvg.selectAll("path").data(pie(freq))
            .enter().append("path")
            .attr("d", arc)
            .each(function(d){ this._current = d;})
            .style("fill", function(d,i) {return color2(i);})
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        function mouseover(d, i){

            mouseOn = true;
            //selected
            if(col==0)
                var st = dataSet.filter(function(s){ return s.frequency-1 == i;});
            else if(col==1)
                var st = dataSet.filter(function(s){ return s.memory-1 == i;});
            else if(col==2)
                var st = dataSet.filter(function(s){ return s.action-1 == i;});
            else if(col==3)
                var st = dataSet.filter(function(s){ return s.lucid-1 == i;});
            else if(col==4)
                var st = dataSet.filter(function(s){ return s.dejavu-1 == i;});

            var nData = getNum(hgCol, st);
            hg.update(nData, color2(i));

        }
        function mouseout(d){

            mouseOn = false;
            var nData = getNum(hgCol, dataSet);
            hg.update(nData, nData.map(function(v, i) {
                return color1(i);
            }));
        }

        pc.update = function(nD){
            PIEsvg.selectAll("path")
                .data(pie(nD))
                .transition().duration(500)
                .attrTween("d", arcTween);
        }

        function arcTween(a){
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) {return arc(i(t));};
        }

        window.Pfilter = function(type){

            console.log(type);
            for(var i=0; i<5; i++) {
                if (type == colNum[i])
                    pieCol = i;
            }
            var nD = getNum(pieCol, dataSet);

            d3.select("#histogram").remove();
            d3.select("#piechart").remove();
            d3.select("#legend").remove();
            hg = histogram(hgCol, "#graph");
            pc = piechart(pieCol, "#graph");
            leg = legend(pieCol, "#graph");
        };

        return pc;
    }

    function legend(col, div){
        var leg = {};

        // create table for legend.
        var legend = d3.select("div").append("table").attr("id", "legend").attr('class','legend');

        var Data = getNum(col, dataSet);

        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(Data).enter().append("tr");

        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16')
            .append("rect").attr("width", '16').attr("height", '16')
            .attr("fill", function(d, i){ return color2(i); });

        // create the second column for each segment.
        tr.append("td").text(function(d, i){ return getText(col, i); });

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,Data);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            l.select(".legendFreq").text(function(d){ return d3.format(",")(d);});
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});
        }

        function getLegend(d,Data){ // Utility function to compute percentage.
            return d3.format("%")(d/d3.sum(Data.map(function(v){ return v; })));
        }

        return leg;
    }

    var hg = histogram(hgCol, "#graph");
    var pc = piechart(pieCol, "#graph"); //freq
    var leg = legend(pieCol, "#graph"); //freq
  //  var hg1 = histogram(2, "#graph2");
   // var pc1 = piechart(0,"#graph2"); //freq
   // var leg1 = legend(0,"#graph2"); //freq
  //  var hg2 = histogram(0);
   // var pc2 = piechart(3); //freq
   // var leg2 = legend(3); //freq
});