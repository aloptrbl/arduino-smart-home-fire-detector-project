import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  AsyncStorage,
  Dimensions,
  TouchableOpacity,
  Alert,
  View,
} from 'react-native';
import { Text,Block, Card, Button } from 'galio-framework'
export default class SettingsScreen extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
    api: {},
    notification: '',
  }
  }

  componentDidMount() {
    fetch('http://192.168.0.194:3000/alertresult')
    .then((response) => response.json())
    .then((responseJson) => {
     console.log(responseJson);
     this.setState({
    api: responseJson
     })
    })
    .catch((error) => {
      console.error(error);
    }); 
  }

  render() {
    return ( <View style={styles.container}>
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
    <Block center>
        <Text h4 color={'white'}>Notification</Text>
      
{this.state.api.response !== undefined ? this.state.api.response.map(function (item) { return (
  <View key={item.id}>
  <Block  style={styles.message} center>
  <Text h5 bold color={'black'}>Fire Alert at {item.temp} degree celcius!</Text>
  <Text style={{paddingLeft: 160,paddingTop:22}}>{item.time}</Text>
  </Block>
  </View>
)}): null}
        </Block>
    </ScrollView>
    </View> )
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
  message: {
  marginTop: 30,
  backgroundColor: '#95a5a6',
  width: Dimensions.get('window').width - 40,
  height: 150,
  padding: 50,
  marginBottom: 5,
  borderRadius: 20
  }
});
