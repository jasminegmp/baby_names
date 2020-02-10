import React from 'react'
import * as d3 from 'd3';
import * as d3Array from "d3-array"
import Footer from './Footer'


class BarChartRace extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:this.props.data
        };
    }

    
    rank = (names, n, value) => {
        const data = Array.from(names, name => ({name, value: value(name) || 0}));
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) {
          data[i].rank = Math.min(n, i);
        }
        return data;
    }

    keyframes = (datevalues, k, names, n) =>{
        const keyframes = [];
        let ka, a, kb, b;
        for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
          for (let i = 0; i < k; ++i) {
            const t = i / k;
            keyframes.push([
              new Date(ka * (1 - t) + kb * t),
              this.rank(names, n, name => a.get(name) * (1 - t) + b.get(name) * t)
            ]);
          }
        }
        keyframes.push([new Date(kb), this.rank(names, n, name => b.get(name))]);
        return keyframes;
    }


    bars = (svg, n, x, y, prev, next) =>{

        let color = d3.scaleOrdinal(['#e76f51','#2a9d8f', '#e9c46a', '#f4a261']);

        let bar = svg.append("g")
                .attr("fill-opacity", 0.6)
            .selectAll("rect");
    
        return ([date, data], transition) => bar = bar
        .data(data.slice(0, n), d => d.name)
        .join(
            enter => enter.append("rect")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("height", y.bandwidth())
            .attr("x", x(0))
            .attr("y", d => y((prev.get(d) || d).rank))
            .attr("width", d => x((prev.get(d) || d).value) - x(0)),
            update => update,
            exit => exit.transition(transition).remove()
            .attr("y", d => y((next.get(d) || d).rank))
            .attr("width", d => x((next.get(d) || d).value) - x(0))
        )
        .call(bar => bar.transition(transition)
            .attr("y", d => y(d.rank))
            .attr("width", d => x(d.value) - x(0)));
    }
    
    labels = (svg, n, x, y, prev, next) => {
        let label = svg.append("g")
            .style("font", "bold 12px var(--sans-serif)")
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
          .selectAll("text");
      
        return ([date, data], transition) => label = label
          .data(data.slice(0, n), d => d.name)
          .join(
            enter => enter.append("text")
              .attr("transform", d => `translate(${x((prev.get(d) || d).value)},${y((prev.get(d) || d).rank)})`)
              .attr("y", y.bandwidth() / 2)
              .attr("x", -6)
              .attr("dy", "-0.25em")
              .style("font-size", ".75em")
              .text(d => d.name)
              .call(text => text.append("tspan")
                .attr("fill-opacity", 0.7)
                .attr("font-weight", "normal")
                .attr("x", -6)
                .attr("dy", "1.15em")),
            update => update,
            exit => exit.transition(transition).remove()
              .attr("transform", d => `translate(${x((next.get(d) || d).value)},${y((next.get(d) || d).rank)})`)
              .call(g => g.select("tspan").tween("text", d => this.textTween(d.value, (next.get(d) || d).value)))
          )
          .call(bar => bar.transition(transition)
            .attr("transform", d => `translate(${x(d.value)},${y(d.rank)})`)
            .call(g => g.select("tspan").tween("text", d => this.textTween((prev.get(d) || d).value, d.value))))
    }


    axis = (svg, margin, x, y, n, width, barSize) => {
        const g = svg.append("g")
            .attr("transform", `translate(0,${margin.top})`);
      
        const axis = d3.axisTop(x)
            .ticks(width / 160)
            .tickSizeOuter(0)
            .tickSizeInner(-barSize * (n + y.padding()));
      
        return (_, transition) => {
          g.transition(transition).call(axis);
          g.select(".tick:first-of-type text").remove();
          g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
          g.select(".domain").remove();
        };
    }

    ticker = (svg, barSize, width, margin, n, datevalues, k, names) => {
        const formatDate = d3.utcFormat("%Y");
        const now = svg.append("text")
            .style("font", `bold ${barSize}px var(--sans-serif)`)
            .style("font-variant-numeric", "tabular-nums")
            .attr("text-anchor", "end")
            .attr("x", width - 6)
            .attr("y", margin.top + barSize * (n - 0.45))
            .attr("dy", "0.32em")
            .style("font-size", "4em")
            .text(formatDate(this.keyframes(datevalues, k, names)[0][0]));
      
        return ([date], transition) => {
          transition.end().then(() => now.text(formatDate(date)));
        };
    }


    textTween = (a, b) => {
        let formatNumber = d3.format(",d")
        const i = d3.interpolateNumber(a, b);
        return function(t) {
          this.textContent = formatNumber(i(t));
        };
    }


    async componentDidMount() {
        const {data} = this.state;

        let width = 800;
        let height = 800;
        let duration = 500;
        let margin = ({top: 16, right: 6, bottom: 6, left: 0});
        let barSize = 48;
        const that = this;
        let n = 15;
        let k = 2;

        const svg = d3
            .select(this.refs.canvas)
            .append("svg")
            .attr("viewBox", [0, 0, width, height]);
      


        let names = new Set(data.map(d => d.name));
        //console.log(names)

        let arrayOfValues = d3.nest().key(function(d){return d.date}).entries(data);


        let datevalues = Array.from(d3Array.rollup(data, ([d]) => d.value, d => +d.date, d => d.name))
            .map(([date, data]) => [new Date(date + '-01-01'), data])
            .sort(([a], [b]) => d3.ascending(a, b));


            
        //console.log("top names for 1880", that.rank(names, n, name => datevalues[0][1].get(name)))

        let nameframes = d3Array.groups(that.keyframes(datevalues, k, names, n).flatMap(([, data]) => data), d => d.name);
        let prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
        let next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
        console.log(nameframes);

        let x = d3.scaleLinear([0, 1], [margin.left, width - margin.right])

        let y = d3.scaleBand()
            .domain(d3.range(n + 1))
            .rangeRound([margin.top, margin.top + barSize * (n + 1 + 0.1)])
            .padding(0.1)

       //console.log(rankedData)

       const updateBars = this.bars(svg, n, x, y, prev, next);
       const updateAxis = this.axis(svg, margin, x, y, n, width, barSize);
       const updateLabels = this.labels(svg, n, x, y, prev, next);
       const updateTicker = this.ticker(svg, barSize, width, margin, n, datevalues, k, names);

      // yield svg.node();
      let keyframes = that.keyframes(datevalues, k, names, n);

       for (const keyframe of keyframes) {
         const transition = svg.transition()
             .duration(duration)
             .ease(d3.easeLinear);
     
         // Extract the top bar’s value.
         x.domain([0, keyframe[1][0].value]);
     
         updateAxis(keyframe, transition);
         updateBars(keyframe, transition);
         updateLabels(keyframe, transition);
         updateTicker(keyframe, transition);
     
        // invalidation.then(() => svg.interrupt());
         await transition.end();
       }
     }


    render() {
        return(
          <div>
            <h1>The Most Popular Baby Names in the US from 1880 - 2018</h1>
            <h5><a href = "https://www.ssa.gov/oact/babynames/limits.html">Data Source </a></h5>
            <div ref = "canvas"></div>
            <Footer/>
          </div>
        )
    }
  }
  
  export default BarChartRace;
  