import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  View,
  Vibration,
  Alert
} from 'react-native';
import { Text,Block } from 'galio-framework'
import { TabNavigator } from "react-navigation";

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from 'react-native-chart-kit'
import { stringify } from 'qs';
const screenWidth = Dimensions.get('window').width
export default class LinksScreen extends React.Component {

  constructor() {
    super();
    this.state = {
    activeIndex: 0,  
    index: 0,
    api: [],
    lineChartData: {
      labels: [],
      datasets: [
        {
          data: [0]
        }
      ]
    },
      lineChartDatas: {
      labels: [1,2,3,4,5,6,7,8],
      datasets: [
        {
          data: [0]
        }
      ]
    },
    lineChartDatax: {
      labels: [1,2,3,4,5,6,7,8],
      datasets: [
        {
          data: [0]
        }
      ]
    } 
  }
  this.socket = new WebSocket('ws://192.168.0.194:3000');
  }


   componentDidMount() {
     // 1 day graph api call
      fetch('http://192.168.0.194:3000/1daygraph')
        .then((response) => response.json())
        .then((responseJson) => {
         console.log(responseJson);
         this.setState({
        api: responseJson
         })
         const temp = [];
         const timestamp = [];
         responseJson.response !== undefined ? responseJson.response.forEach(function (item) {
         return temp.push(item.temp);
         }) : null;
         responseJson.response !== undefined ?  responseJson.response.forEach(function (item) {
          return timestamp.push(item.timestamp);
          }) : null;
         const newChartDatas = {
          datasets: [{
          data: temp, 
          }],
          labels: timestamp
        };
        this.setState({ lineChartDatas: newChartDatas });
        })
        .catch((error) => {
          console.error(error);
        }); 

    // 1 hour graph api call
        fetch('http://192.168.0.194:3000/1hourgraph')
        .then((response) => response.json())
        .then((responseJson) => {
         console.log(responseJson);
         this.setState({
        api: responseJson
         })
         const temps = [];
         const timestamps = [];
         responseJson.response !== undefined ? responseJson.response.forEach(function (item) {
         return temps.push(item.temp);
         }) : null;
         responseJson.response !== undefined ?  responseJson.response.forEach(function (item) {
          return timestamps.push(item.timestamp);
          }) : null;
         const newChartDatax = {
          datasets: [{
          data: temps, 
          }],
          labels: timestamps
        };
        this.setState({ lineChartDatax: newChartDatax });
        })
        .catch((error) => {
          console.error(error);
        }); 
  
        this.socket.onmessage = (e) => {
          this.setState({ apis: e.data });
          if(e.data > 40 && e.data !== null)
          {
            Vibration.vibrate(1000,2000,3000);
        }
        else 
        {
        Vibration.cancel();
        }

          const value = JSON.parse(e.data);
          const oldBtcDataSet = this.state.lineChartData.datasets[0];
          const newBtcDataSet = { ...oldBtcDataSet };
          newBtcDataSet.data.push(value);
          if (Object.keys(newBtcDataSet.data).length > 5) {
          newBtcDataSet.data.shift();
          this.state.lineChartData.labels.shift();
  
        }
        const newChartData = {
          ...this.state.lineChartData,
          datasets: [newBtcDataSet],
          labels: this.state.lineChartData.labels.concat(
            new Date().toLocaleTimeString()
          )
        };
        this.setState({ lineChartData: newChartData });
        };
    }
  
    componentWillUnmount() {
      this.socket.close();
    }

  static navigationOptions = {
    header: null,
  };

  segmentClicked = (index) => {
    this.setState({
      activeIndex: index
    })
  }

  renderSection = () => {
    if(this.state.activeIndex == 0) {
      return (<View>
{this.renderSectionOne()}
        </View>
      )
    }
    else if (this.state.activeIndex == 1) {
      return (
        <View>
{this.renderSectionTwo()}
    </View>
      )
    }
    else if (this.state.activeIndex == 2) {
      return (
        <View>
{this.renderSectionThree()}
    </View>
      )
    }
   
  }

  renderSectionOne = () => {
      return (
        <Block center>
        <LineChart
  data={this.state.lineChartData}
    width={Dimensions.get('window').width} // from react-native
    height={220}
    yAxisLabel={'°C'}
    chartConfig={{
      backgroundColor: '#1f272b',
      backgroundGradientFrom: '#1f272b',
      backgroundGradientTo: '#1f272b',
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />  
        </Block>
      )
    
  }

  renderSectionTwo = () => {
      return (
        <Block center>
        <LineChart
  data={this.state.lineChartDatax}
    width={Dimensions.get('window').width} // from react-native
    height={220}
    yAxisLabel={'°C'}
    chartConfig={{
      backgroundColor: '#1f272b',
      backgroundGradientFrom: '#1f272b',
      backgroundGradientTo: '#1f272b',
      decimalPlaces: 2, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />  
        </Block>
      )
    
  }

  renderSectionThree = () => {
    return (
      <Block center>
      <LineChart
data={this.state.lineChartDatas}
  width={Dimensions.get('window').width} // from react-native
  height={220}
  yAxisLabel={'°C'}
  chartConfig={{
    backgroundColor: '#1f272b',
    backgroundGradientFrom: '#1f272b',
    backgroundGradientTo: '#1f272b',
    decimalPlaces: 2, // optional, defaults to 2dp
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16
    }
  }}
  bezier
  style={{
    marginVertical: 8,
    borderRadius: 16
  }}
/>  
      </Block>
    )
  
}


  render() {
    return (
      <View style={styles.container}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
     <Block>
     <Block center>
        <Text h4 color={'white'}>Statistic</Text>
        </Block>
     <Block flex row space={'around'} style={styles.section} style={{marginTop: 100}}> 
          <TouchableOpacity onPress={()=>this.segmentClicked(0)} active={this.state.activeIndex == 0} style={[styles.button, this.state.activeIndex == 0 ? { borderColor: '#3498db'} : { bordercolor: 'white'} ]} transparent>
          <Text style={[styles.title, this.state.activeIndex == 0 ? {color: '#3498db', borderColor: '#3498db'} : {color: 'white'}]}>Now</Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={()=>this.segmentClicked(1)} active={this.state.activeIndex == 1} style={[styles.button, this.state.activeIndex == 1 ? { borderColor: '#3498db'} : { bordercolor: 'white'} ]} transparent >
          <Text style={[styles.title, this.state.activeIndex == 1 ? {color: '#3498db', borderColor: '#3498db'} : {color: 'white'}]}>1 Hour</Text>
          </TouchableOpacity>
          <TouchableOpacity  onPress={()=>this.segmentClicked(2)} active={this.state.activeIndex == 2} style={[styles.button, this.state.activeIndex == 2 ? { borderColor: '#3498db'} : { bordercolor: 'white'} ]} transparent >
          <Text style={[styles.title, this.state.activeIndex == 2 ? {color: '#3498db', borderColor: '#3498db'} : {color: 'white'}]}>1 Day</Text>
          </TouchableOpacity>
    </Block>
    {this.renderSection()}
     </Block>
      </ScrollView>
    </View>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f272b',
  },
  contentContainer: {
    paddingTop: 30,
  },
  section: {
    width: Dimensions.get('window').width,
  },
  button: {
  borderWidth: 1,
  borderColor: 'white',
  padding: 5,
  borderRadius: 15

  }
});
