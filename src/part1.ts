import * as d3 from "d3";
import { extent } from "d3";

export function part1() {
  const margin = { top: 10, right: 30, bottom: 0, left: 0 };
  const width = 900 - margin.left - margin.right;
  const height = 400 -  margin.top - margin.bottom;

  const xRange = [margin.left, width - margin.right];
  const yRange = [height - margin.bottom, margin.top];

  const xScale = d3.scaleUtc().range(xRange);
  const yScale = d3.scaleLinear().range(yRange);

  const xAxis = d3.axisBottom(xScale).ticks(width / 80);
  const yAxis = d3.axisLeft(yScale).tickSizeOuter(0);


  // Create the SVG element for the chart.
  const svg = d3
    .create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("viewBox", [0, 0, width, height+100])
    .attr("style", "max-width: 100%; height: auto; ")
    ;

  // Add the x axis
  svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", "translate(0,"+height+")")
    .call(d3.axisBottom(xScale));

  // Add the y axis
  svg
    .append("g")
    .attr("class", "yAxis")
    .call(d3.axisLeft(yScale));


  // Add the bars
  const line = svg
  .append("g")
  .append("path")
    .attr("stroke", "black")
    .style("stroke-width", 4)
    .style("fill", "none")

  // Add text
  const texts = svg
    .append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);

    function update(X: Date[] , Y: Int32Array) {
        // Here we use an array of indexes as data for D3 so we can process columnar data more easily
        // but you could also directly pass an array of objects to D3.

        const I = d3.range(X.length);
    
        xScale.domain(d3.extent(X));
        yScale.domain([0, Math.max(...Y)]);

        let dataArray = [];
        for (let i = 0; i < X.length; i++) {
          dataArray.push({X: X[i].getFullYear(), Y: Y[i]});
        }
        console.log("dataaarray =",dataArray);

         line
          .datum(dataArray)
          .transition()
          .duration(1000)
          .attr("d", d3.line()
          .x(d => xScale(d.X))
          .y(d => yScale(d.Y))
           )

          
          //  .attr("y", (i) => yScale(Y[i])!)
            ;
          // .attr("X", xScale(0))
          // .attr("Y", xScale(0));    
          

    //     bars
    //     .selectAll("rect")
    //     .data(I)
    //     .join("rect")
    //     .attr("x", xScale(0))
    //     .attr("y", (i) => yScale(Y[i])!)
    //     .attr("width", (i) => xScale(X[i]) - xScale(0))
    //     .attr("height", yScale.bandwidth());
  
    //   texts
    //     .selectAll("text")
    //     .data(I)
    //     .join("text")
    //     .attr("x", (i) => xScale(X[i]))
    //     .attr("y", (i) => yScale(Y[i])! + yScale.bandwidth() / 2)
    //     .attr("dy", "0.35em")
    //     .attr("dx", -4)
    //     .text((i) => xScale.tickFormat(100, "d")(X[i])!)
    //     .call((text) =>
    //       text
    //         .filter((i) => xScale(X[i]) - xScale(0) < 20) // short bars
    //         .attr("dx", +4)
    //         .attr("fill", "black")
    //         .attr("text-anchor", "start")
    //     );

        // Clear the axis so that when we add the grid, we don't get duplicate lines
        svg.select(".xAxis").selectAll("*").remove();
    
        // Update axes since we set new domains
        svg
          .select<SVGSVGElement>(".xAxis")
          .call(xAxis)
          // add gridlines
          .call((g) =>
            g
              .selectAll(".tick line")
              .clone()
              .attr("y2", height - margin.top - margin.bottom)
              .attr("stroke-opacity", 0.1)
          )
          .call((g) =>
            g
              .append("text")
              .attr("x", width - margin.right)
              .attr("y", -22)
              .attr("fill", "black")
              .attr("text-anchor", "end")
              .text("Count →")
          );
    
        svg.select<SVGSVGElement>(".yAxis").call(yAxis);
      }

    return {
        element: svg.node()!,
        update,
      };
}