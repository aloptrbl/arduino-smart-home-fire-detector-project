import React from 'react';
import {
  Image,
  Platform,
  Dimensions,
  ScrollView,
  StyleSheet,
  Alert,
  Vibration,
  TouchableOpacity,
  AsyncStorage,
  View,
} from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'
import { Icon } from 'expo';
import { Text,Block, Card, Switch, theme, withGalio, GalioProvider } from 'galio-framework'
const screenWidth = Dimensions.get('window').width
const customTheme = {
  SIZES: { BASE: 18, },
  // this will overwrite the Galio SIZES BASE value 16
  COLORS: { PRIMARY: 'red', } 
  // this will overwrite the Galio COLORS PRIMARY color #B23AFC
};

export default class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    api: {},
    lineChartData: {
      labels: [],
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
        this.socket.onmessage = (e) => {
          this.setState({ apis: e.data });
        };
    }
  
    componentWillUnmount() {
      this.socket.close();
    }

  static navigationOptions = {
    header: null,
  };



  render() {
    return (
      <View style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Block center>
        <Text h4 color={'white'}>Home</Text>
        </Block>

        <Block center style={styles.temperatures}>
        <Text h2 bold color={'white'}>{JSON.stringify(parseFloat(this.state.apis)) !== null ? JSON.stringify(parseFloat(this.state.apis)) : 0 }°C  <Icon.FontAwesome
        name={'thermometer-full'}
        style={{ marginBottom: -8 }}
        size={36}
        color={'white'}
      /></Text>
        </Block>

        <Block flex row space={'between'} style={styles.temperature}>
        <Text h5 color={'white'}>Fan <Icon.MaterialCommunityIcons
        name={'fan'}
        style={{ marginBottom: -8 }}
        size={26}
        color={'white'}
      /></Text>
       <GalioProvider theme={customTheme}>
      <Switch 
      initialValue={false}
                    trackColor={{true: 'success', false: 'gray'}}
                    thumbColor={'black'}
                    style={{ transform: [{ scaleX: 1.8 }, { scaleY: 1.8 }] }}
                    onChange={() => Alert.alert('switch')} />
       </GalioProvider>
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
    paddingBottom: 30
  },
  temperature: {
    marginTop: 25,
    paddingLeft: 15,
    paddingRight: 15
  },

  temperatures: {
    height: Dimensions.get('window').width,
    alignItems: 'center',
    alignContent: 'center',
    marginTop: 100,
    paddingLeft: 15,
    paddingRight: 15
  }
 
});
