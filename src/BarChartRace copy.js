import React from 'react'
import * as d3 from 'd3';

class BarChartRace extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:this.props.data
        };
    }

    
    textTween = (a, b) => {
        const i = d3.interpolateNumber(a, b);
        return function(t) {
          this.textContent = d3.format(",d");
        };
      }

    async componentDidMount() {
        const {data} = this.state;

        let width = 800;
        let height = 800;
        let duration = 250;
        let k = 10;
        let margin = ({top: 16, right: 6, bottom: 6, left: 0});
        let barSize = 48;
        

        let color = d3.scaleOrdinal(['#e76f51','#2a9d8f', '#e9c46a', '#f4a261']);

        const svg = d3.select(this.refs.canvas)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);

        let names = new Set(data.map(d => d.name))
        console.log(names)

/*
        let datevalues = d3.nest()
            .key(function(d){return d.date})
            .entries(data);


        let datevalues = Array.from(d3.nest().rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
            .map(([date, data]) => [new Date(date), data])
            .sort(([a], [b]) => d3.ascending(a, b))*/

        let arrayOfValues = d3.nest().key(function(d){return d.date}).entries(data);

        // outputes datavalues:
        //0: (2) ["1880", Array(60)]
        //1: (2) ["1881", Array(40)]
        //2: (2) ["1882", Array(33)]
        let datevalues = arrayOfValues.map(year =>{
            return Object.keys(year).map(function(key) {
                return year[key];
              });
        })

        /**function rank(value) {
  const data = Array.from(names, name => ({name, value: value(name) || 0}));
  data.sort((a, b) => d3.descending(a.value, b.value));
  for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
  return data;
}
 */
        // for every year, rank every name

        let rankedData = datevalues.map(year=>{
            //console.log(year)
            let count = 0;

            (year[1].sort(function(a, b) {
                return b.value - a.value;
            }));
            
            year[1].forEach(function (element) {
                element.rank = count;
                count += 1;
              });
            return year
        })


        //console.log(rankedData);

        let that = this;

        // for every name, create an array of objects which contain every year's value
        // ["Emily", [{name = "Emily, value: 123213, rank: 0},{name = "Emily, value: 23434, rank: 12},{}...]]
        let nameframes = rankedData.flatMap(([, data]) => data)
        let byNames = d3.nest()
            .key(function(d) { return d.name; })
            .entries(nameframes);
        const byNamesArray = byNames.map(i => Object.keys(i).map(x => i[x]));

        let prev = new Map(byNamesArray.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])))
        let next = new Map(byNamesArray.flatMap(([, data]) => d3.pairs(data)));

        //console.log(prev);
        
        let y = d3.scaleBand()
            .domain(d3.range(k + 1))
            .rangeRound([margin.top, margin.top + barSize * (k + 1 + 0.1)])
            .padding(0.1);
        let x = d3.scaleLinear([0, 1], [margin.left, width - margin.right]);
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);
        let bar = svg.append("g")
            .attr("fill-opacity", 0.6)
            .selectAll("rect")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .selectAll("text");

///// THIS PART DOESN"T WORK YET
         console.log(byNamesArray)

        bar.data(data.slice(0, k), d => d.name)
            .join(
            enter => enter.append("rect")
                .attr("fill", function(d, i) {
                    return color(i);
                })
                .attr("height", y.bandwidth())
                .attr("x", x(0))
                .attr("y", d => y((prev.get(d) || d).rank))
                .attr("width", d => console.log(x((next.get(d) || d).value) - x(0))),
            update => update,
            exit => exit.transition(transition).remove()
                .attr("y", d => y((next.get(d) || d).rank))
                .attr("width", d => x((next.get(d) || d).value) - x(0))
            )
            .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x((next.get(d) || d).value) - x(0)));

            bar.data(data.slice(0, k), d => d.name)
            .join(
              enter => enter.append("text")
                .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
                .attr("y", y.bandwidth() / 2)
                .attr("x", -6)
                .attr("dy", "-0.25em")
                .text(d => d.name)
                .call(text => text.append("tspan")
                  .attr("fill-opacity", 0.7)
                  .attr("font-weight", "normal")
                  .attr("x", -6)
                  .attr("dy", "1.15em")),
              update => update,
              exit => exit.transition(transition).remove()
                .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
                .call(g => g.select("tspan").tween("text", d => that.textTween(d.value, (next.get(d) || d).value)))
            )
            .call(bar => bar.transition(transition)
              .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
              .call(g => g.select("tspan").tween("text", d => that.textTween((prev.get(d) || d).value, d.value))))

    }

    render() {
        return(
            <div ref = "canvas">Bar!</div>
        )
    }
  }
  
  export default BarChartRace;
  