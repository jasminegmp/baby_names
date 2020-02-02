import React from 'react'
import * as d3 from 'd3';
import data from './ss_name_df_cleaned.csv';

class D3Viz extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:null
        };
    }

    componentDidMount() {
        let that = this;
        d3.csv(data).then(function(data) {
            console.log(data);
            that.setState({data});
        }).catch(function(err) {
            throw err;
        })
    }

    render() {
       
        return (
            <div>Hi!</div>
        )
    }
  }
  
  export default D3Viz;
  