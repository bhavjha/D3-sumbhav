//http://using-d3js.com/index.html

import "./style.css";
import * as d3 from "d3";

import { part1 } from "./part1";

import { Int32, Table, Utf8 } from "apache-arrow";
import { db } from "./duckdb";
import parquet from "./pittsburghairquality.parquet?url";


//      // set the dimensions and margins of the graph
//      var margin = {top: 10, right: 100, bottom: 30, left: 30},
//      width = 460 - margin.left - margin.right,
//      height = 400 - margin.top - margin.bottom;
 
//  // append the svg object to the body of the page
//  var svg = d3.select("#app")
//    .append("svg")
//      .attr("width", width + margin.left + margin.right)
//      .attr("height", height + margin.top + margin.bottom)
//    .append("g")
//      .attr("transform",
//            "translate(" + margin.left + "," + margin.top + ")");
 
//  //Read the data
//  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_connectedscatter.csv", function(data) {
 
 
//      // List of groups (here I have one group per column)
//      var allGroup = ["valueA", "valueB", "valueC"]
 
//      // add the options to the button
//      d3.select("#selectButton")
//        .selectAll('myOptions')
//         .data(allGroup)
//        .enter()
//        .append('option')
//        .text(function (d) { return d; }) // text showed in the menu
//        .attr("value", function (d) { return d; }) // corresponding value returned by the button
 
//      // Add X axis --> it is a date format
//      var x = d3.scaleLinear()
//        .domain([0,10])
//        .range([ 0, width ]);
//      svg.append("g")
//        .attr("transform", "translate(0," + height + ")")
//        .call(d3.axisBottom(x));
 
//      // Add Y axis
//      var y = d3.scaleLinear()
//        .domain( [0,20])
//        .range([ height, 0 ]);
//      svg.append("g")
//        .call(d3.axisLeft(y));
 
//      // Initialize line with group a
//      var line = svg
//        .append('g')
//        .append("path")
//          .datum(data)
//          .attr("d", d3.line()
//            .x(function(d) { return x(+d.time) })
//            .y(function(d) { return y(+d.valueA) })
//          )
//          .attr("stroke", "black")
//          .style("stroke-width", 4)
//          .style("fill", "none")
 
//      // Initialize dots with group a
//      var dot = svg
//        .selectAll('circle')
//        .data(data)
//        .enter()
//        .append('circle')
//          .attr("cx", function(d) { return x(+d.time) })
//          .attr("cy", function(d) { return y(+d.valueA) })
//          .attr("r", 7)
//          .style("fill", "#69b3a2")
 
 
//      // A function that updateMain the chart
//      function updateMain(selectedGroup) {
 
//        // Create new data with the selection?
//        var dataFilter = data.map(function(d){return {time: d.time, value:d[selectedGroup]} })
 
//        // Give these new data to updateMain line
//        line
//            .datum(dataFilter)
//            .transition()
//            .duration(1000)
//            .attr("d", d3.line()
//              .x(function(d) { return x(+d.time) })
//              .y(function(d) { return y(+d.value) })
//            )
//        dot
//          .data(dataFilter)
//          .transition()
//          .duration(1000)
//            .attr("cx", function(d) { return x(+d.time) })
//            .attr("cy", function(d) { return y(+d.value) })
//      }
 
//      // When the button is changed, run the updateMainChart function
//      d3.select("#selectButton").on("change", function(d) {
//          // recover the option that has been chosen
//          var selectedOption = d3.select(this).property("value")
//          // run the updateMainChart function with this selected option
//          updateMain(selectedOption)
//      })
 
//  })









const app = document.querySelector("#app")!;

// Create the chart1. The specific code here makes some assumptions that may not hold for you.
//const chart1 = barchart1();

const chart1 = part1();

async function updateMain(station: string) {

  const data: Table<{ average: Float; yearmonth: Utf8; station: Utf8; innerbound: Float ; outerbound: Float ; displaydate: Utf8 }> = await conn.query(`SELECT avg("US AQI") as average, strftime("Timestamp(UTC)", '%y %m') as yearmonth, "Station name" as station,
  quantile_cont("US AQI",0.1) as innerbound,quantile_cont("US AQI",0.9) as outerbound,
  date_trunc('month', "Timestamp(UTC)")+ INTERVAL 14 DAY as displaydate, 
  FROM pittsburghairquality.parquet
  WHERE station = '${station}'
  GROUP BY yearmonth,station, displaydate
  ORDER BY yearmonth ASC`);

  console.log('DATA =',data);

  // Get the X and Y columns for the chart1. Instead of using Parquet, DuckDB, and Arrow, we could also load data from CSV or JSON directly.
  const X = data.getChild("displaydate")!.toArray();
  console.log("in updateMain after const X");

  const Y = data
    .getChild("average")!
    .toJSON()
    .map((d) => `${d}`);

    console.log('X',X);

    console.log('Y',Y);
    
    chart1.update(X, Y);
}

// Load a Parquet file and register it with DuckDB. We could request the data from a URL instead.
const res = await fetch(parquet);
await db.registerFileBuffer(
  "pittsburghairquality.parquet",
  new Uint8Array(await res.arrayBuffer())
);


// Query DuckDB for the cities.
const conn = await db.connect();
console.log("const conn db.connect");
await conn.query(`SELECT * FROM read_parquet('pittsburghairquality.parquet')`);


const locations: Table<{ Station: Utf8}> = await conn.query(`
SELECT DISTINCT 'Station name'
FROM pittsburghairquality.parquet`);
console.log('locations',locations);

// Create a select element for the locations.
const select = d3.select(app).append("select");
for (const location of locations) {
  select.append("option").text(location.location);
}

select.on("change", () => {
  const location = select.property("value");
  updateMain(location);
});


updateMain('Avalon');

// Add the chart to the DOM.
//app.appendChild(chart1.element);
console.log("app.appendChild");

app.appendChild(chart1.element);
