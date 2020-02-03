'use strict';

(function() {

  const colors = {
    "Bug": "#4E79A7",
    "Dark": "#A0CBE8",
    "Electric": "#F28E2B",
    "Fairy": "#FFBE7D",
    "Fighting": "#59A14F",
    "Fire": "#8CD17D",
    "Ghost": "#B6992D",
    "Grass": "#499894",
    "Ground": "#86BCB6",
    "Ice": "#FABFD2",
    "Normal": "#E15759",
    "Poison": "#FF9D9A",
    "Psychic": "#79706E",
    "Steel": "#BAB0AC",
    "Water": "#D37295"
  }

  let data = "";
  let filtered = "";
  let svgContainer = "";
  let generation = "";
  let legendary = "";

  window.onload = function() {
    generation = d3.select('body')
      .append('select')
    generation.selectAll('option')
     	.data(['All','1','2','3','4','5','6'])
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })


    legendary = d3.select('body')
      .append('select')
    legendary.selectAll('option')
     	.data(['All','True','False'])
      .enter()
    	.append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; })

    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);

    d3.csv("pokemon.csv")
      .then((csvData) => data = csvData)
      .then(() => makePlot());

    generation.on("change", makePlot);
    legendary.on("change", makePlot);
  }

  function makePlot() {
    d3.select('svg').remove();
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 700)
      .attr('height', 500);
    let gen = generation.property("value");
    let leg = legendary.property("value");
    filtered = [];
    data.forEach(function(row){
      if ((row['Generation'] == gen || gen == 'All') && (row['Legendary'] == leg || leg == 'All')) {
        filtered.push({
          'Name':row['Name'],
          'Type 1':row['Type 1'],
          'Type 2':row['Type 2'],
          'Total':parseInt(row["Total"]),
          'Sp. Def':parseInt(row["Sp. Def"])
        });
      }
    })

    let total = filtered.map((row) => parseInt(row["Total"]));
    let def = filtered.map((row) => parseInt(row["Sp. Def"]))

    let axesLimits = findMinMax(def, total);

    let mapFunctions = drawTicks(axesLimits);

    plotData(mapFunctions);

    makeLabels();

    makeLegend();
  }

  function makeLabels() {
    svgContainer.append('text')
      .attr('x', 100)
      .attr('y', 40)
      .style('font-size', '14pt')
      .text("Pokemon: Special Defense vs Total Stats");

    svgContainer.append('text')
      .attr('x', 250)
      .attr('y', 490)
      .style('font-size', '10pt')
      .text('Sp.def');

    svgContainer.append('text')
      .attr('transform', 'translate(15, 300)rotate(-90)')
      .style('font-size', '10pt')
      .text('Total');
  }

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    d3.select('div').remove();
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(filtered)
      .enter()
      .append('circle')
        .attr('cx', xMap)
        .attr('cy', yMap)
        .attr('r', 3)
        .attr('fill', map.color)
        .on("mouseover", (d) => {
          div.transition()
            .duration(200)
            .style("opacity", .9);
          div.html(d['Name'] + "<br/>" + d['Type 1'] + "<br/>" + d['Type 2'])
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 42) + "px");
        })
        .on("mouseout", (d) => {
          div.transition()
            .duration(500)
            .style("opacity", 0);
        });
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    let color = function(d) {return colors[d["Type 1"]];}
    // return gre score from a row of data
    let xValue = function(d) { return +d["Sp. Def"]; }

    // function to scale gre score
    let xScale = d3.scaleLinear()
      .domain([limits.xMin - 5, limits.xMax]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };
    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis);

    // return Chance of Admit from a row of data
    let yValue = function(d) { return +d['Total']}

    // function to scale Chance of Admit
    let yScale = d3.scaleLinear()
      .domain([limits.yMax, limits.yMin - 10]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);

    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale,
      color: color
    };
  }

  function findMinMax(x, y) {

    let xMin = d3.min(x) - d3.min(x) / 10;
    let xMax = d3.max(x) + d3.min(x) / 10;

    let yMin = d3.min(y) - d3.min(y) / 10;
    let yMax = d3.max(y) + d3.min(y) / 10;

    return {
      xMin : xMin,
      xMax : xMax,
      yMin : yMin,
      yMax : yMax
    }
  }

  function makeLegend() {
    let type = []
    filtered.forEach(function(row) {
      if(type.indexOf(row['Type 1']) === -1) {
        type.push(row['Type 1']);
      }
    })
    for(let i = 0; i < type.length; i++) {
      svgContainer.append('rect') 
        .attr('x', 500) 
        .attr('y', 50 + i * 15) 
        .attr('width', 10) 
        .attr('height', 10) 
        .attr('fill', colors[type[i]]);
      svgContainer.append('text')
        .attr('x', 520)
        .attr('y', 60 + i * 15)
        .style('font-size', '10pt')
        .text(type[i]);
    }
  }
})();
