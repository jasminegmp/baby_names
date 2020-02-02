import React from 'react'
import * as d3 from 'd3';

class BarChartRace extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:this.props.data
        };
    }


    async componentDidMount() {
        const {data} = this.state;

        let width = 800;
        let height = 800;
        let duration = 250;
        let k = 10;

        // make SVG
        const svg = d3.create("svg")
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

        // for every name, create an array of objects which contain every year's value
        // ["Emily", [{name = "Emily, value: 123213, rank: 0},{name = "Emily, value: 23434, rank: 12},{}...]]
        //let nameframes = d3.groups(rankedData.flatMap(([, data]) => data), d => d.name)

                        

       // console.log(output);

       /* const updateBars = bars(svg);
        const updateAxis = axis(svg);
        const updateLabels = labels(svg);
        const updateTicker = ticker(svg);
        
        yield svg.node();
        
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
        
            invalidation.then(() => svg.interrupt());
            await transition.end();
        }*/

    }

    render() {
        return(
            <div>Bar!</div>
        )
    }
  }
  
  export default BarChartRace;
  