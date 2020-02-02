import React from 'react'
import * as d3 from 'd3';

class BarChartRace extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:this.props.data
        };
    }

    componentDidMount() {

    }

    render() {
        return(
            <div>Bar!</div>
        )
    }
  }
  
  export default BarChartRace;
  