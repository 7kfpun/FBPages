import React, { Component } from 'react';
import {
  Alert,
  DatePickerIOS,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { FormInput } from 'react-native-elements';
import { SegmentedControls } from 'react-native-radio-buttons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NavigationBar from 'react-native-navbar';
import Toast from 'react-native-root-toast';

import ProfilePicture from './components/profile-picture';

import * as Facebook from './utils/facebook';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default class Publish extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
      date: new Date(),
      timeZoneOffsetInHours: (-1) * ((new Date()).getTimezoneOffset() / 60),
      checked: false,
      selectedOption: 'Post now',
    };
  }

  onRequest() {
    if (this.state.selectedOption === 'Post now') {
      Facebook.publish(this.props.pageId, Facebook.POST_PUBLISHED, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
    } else if (this.state.selectedOption === 'Post later') {
      Facebook.publish(this.props.pageId, Facebook.POST_UNPUBLISHED, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
    } else if (this.state.selectedOption === 'Schedule') {
      Facebook.publish(this.props.pageId, Facebook.POST_SCHEDULE, this.state.text, this.state.date, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
    }
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error, error.message);
      if (error && error.message) {
        alert(error.message);
      }
    } else {
      console.log('Success fetching data:', result);
      Actions.pop();
      Actions.refresh({ addNew: true });
      Toast.show('Posted successfully');
    }
  }

  pop() {
    if (this.state.text) {
      Alert.alert(
        'Discard Post?',
        null,
        [
          { text: 'Discard', onPress: () => Actions.pop() },
          { text: 'Keep', onPress: () => console.log('Keep Pressed'), style: 'cancel' },
        ],
      );
    } else {
      Actions.pop();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title: this.props.title }}
          style={{
            borderBottomWidth: StyleSheet.hairlineWidth * 2,
            borderBottomColor: '#E0E0E0',
          }}
          leftButton={{
            title: 'Cancel',
            handler: () => this.pop(),
          }}
          rightButton={{
            title: this.state.text ? 'Post' : '',
            handler: () => this.onRequest(),
          }}
        />

        <View style={{ margin: 15, flexDirection: 'row' }}>
          <ProfilePicture pageId={this.props.pageId} />
          <View style={{ flexDirection: 'column', marginLeft: 8 }}>
            <Text style={{ fontWeight: '400', marginBottom: 3 }}>
              {this.props.pageName}
            </Text>
            <Text style={{ color: 'gray', marginBottom: 3 }}>
              <Icon name="public" size={11} color="gray" /> Public
            </Text>
          </View>
        </View>

        <View style={{ flex: 1 }}>
          <FormInput onChangeText={text => this.setState({ text })} multiline numberOfLines={4} placeholder={'Write something...'} />
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <SegmentedControls
            containerStyle={{ margin: 10 }}
            options={['Post now', 'Post later', 'Schedule']}
            onSelection={selectedOption => this.setState({ selectedOption })}
            selectedOption={this.state.selectedOption}
          />

          {this.state.selectedOption === 'Schedule' && <DatePickerIOS
            date={this.state.date}
            mode="datetime"
            timeZoneOffsetInMinutes={this.state.timeZoneOffsetInHours * 60}
            onDateChange={date => this.setState({ date })}
          />}
          <KeyboardSpacer />
        </View>
      </View>
    );
  }
}

Publish.propTypes = {
  title: React.PropTypes.string,
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
