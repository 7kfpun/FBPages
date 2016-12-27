import React, { Component } from 'react';
import {
  Alert,
  DatePickerIOS,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { FormLabel, FormInput } from 'react-native-elements'
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import NavigationBar from 'react-native-navbar';
import { CheckBox } from 'react-native-elements';

export default class Publish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      date: new Date(),
      timeZoneOffsetInHours: (-1) * (new Date()).getTimezoneOffset() / 60,
      checked: false,
    };
  }

  pop() {
    if (this.state.text) {
      Alert.alert(
        'Discard Post?',
        null,
        [
          { text: 'Discard', onPress: () => Actions.pop() },
          { text: 'Keep', onPress: () => console.log('Keep Pressed'), style: 'cancel' },
        ]
      );
    } else {
      Actions.pop();
    }
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      Actions.pop();
    }
  }

  _onPosting() {
    console.log(this.props.pageId, this.props.pageAccessToken);
    console.log(this.state.date.getTime());

    var parameters;
    if (this.state.checked) {
      parameters = {
        message: { string: this.state.text },
        published: { 'string': 'false' },
        scheduled_publish_time: { 'string': Math.round(this.state.date.getTime() / 1000).toString() },
      };
    } else {
      parameters = {
        message: { string: this.state.text },
      };
    }

    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/feed`,
      {
        parameters,
        httpMethod: 'POST',
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title: this.props.title }}
          leftButton={{
            title: 'Cancel',
            handler: () => this.pop(),
          }}
          rightButton={{
            title: this.state.text ? 'Continue' : '',
            handler: () => this._onPosting(),
          }}
        />

        <View style={{ flex: 1 }}>
          <FormInput onChangeText={(text) => this.setState({ text })} />
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <CheckBox
            center
            title='Post Later?'
            checkedIcon='dot-circle-o'
            checkedColor='gray'
            uncheckedIcon='circle-o'
            checked={this.state.checked}
            onPress={() => this.setState({ checked: !this.state.checked })}
          />
          {this.state.checked && <DatePickerIOS
            date={this.state.date}
            mode="datetime"
            timeZoneOffsetInMinutes={this.state.timeZoneOffsetInHours * 60}
            onDateChange={(date) => this.setState({ date })}
          />}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
