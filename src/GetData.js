import React from 'react';
import * as d3 from 'd3';
import data from './ss_name_df_cleaned.csv';
import BarChartRace from './BarChartRace';
import Loader from './Loader';

class GetData extends React.Component{

    constructor(props) {
        super(props);
        
        this.state = {
            data:null,
            loading: true
        };
    }

    componentDidMount() {
        let that = this;
        
        d3.csv(data).then(function(data) {
            
            data.forEach(d => {
                d.date = + d.date;
                d.value = + d.value;
            });
           // console.log(data);
            that.setState({data});
            that.setState({loading: false});
        }).catch(function(err) {
            throw err;
        })
    }

    render() {
        if (this.state.loading){
            return <Loader/>;
        }
        return (
            <BarChartRace data = {this.state.data}/>
        )

    }
  }
  
  export default GetData;
  