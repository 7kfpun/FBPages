import React, { Component } from 'react';
import {
  Alert,
  DatePickerIOS,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableHighlight,
  Text,
  View,
} from 'react-native';

import { AccessToken, LoginManager } from 'react-native-fbsdk';
import { Actions } from 'react-native-router-flux';
import { FormInput } from 'react-native-elements';
import { RNS3 } from 'react-native-aws3';
import { SegmentedControls } from 'react-native-radio-buttons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';  // eslint-disable-line import/no-unresolved,import/extensions
import KeyboardSpacer from 'react-native-keyboard-spacer';
import NavigationBar from 'react-native-navbar';
import Toast from 'react-native-root-toast';

import ProfilePicture from './components/profile-picture';

import * as Facebook from './utils/facebook';
import { config } from '../config';

const window = Dimensions.get('window');

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
      selectedOption: 'Post now',
    };
  }

  componentDidMount() {
    AccessToken.getCurrentAccessToken().then(
      (data) => {
        console.log('getCurrentAccessToken', data);
        if (!data.permissions || data.permissions.indexOf('publish_pages') === -1) {
          LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages']).then(
            (result) => {
              if (result.isCancelled) {
                alert('Login cancelled. You cannot publish without manage_pages and publish_pages permissions.');
                Actions.pop();
              } else {
                console.log('Success logged');
              }
            },
            (error) => {
              alert(`Login fail with error: ${error}`);
              Actions.pop();
            },
          );
        }
      },
    );
  }

  onRequest() {
    if (this.state.source) {
      ImageResizer.createResizedImage(this.state.uri, 600, 600, 'JPEG', 60).then((resizedImageUri) => {
        console.log('resizedImageUri', resizedImageUri);

        const file = {
          uri: resizedImageUri,
          name: resizedImageUri.split('/').pop(),
          type: 'image/jpg',
        };
        const s3Options = Object.assign(config.s3, { keyPrefix: 'fbpages/' });

        Toast.show('Uploading...');
        RNS3.put(file, s3Options).then((res) => {
          if (res.status !== 201) {
            console.log(res);
            throw new Error('Failed to upload image to S3');
          }
          console.log('S3 uploaded', res.body);
          if (res.body && res.body.postResponse && res.body.postResponse.location) {
            if (this.state.selectedOption === 'Post now') {
              Facebook.publishPhoto(this.props.pageId, Facebook.POST_PUBLISHED, res.body.postResponse.location, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
            } else if (this.state.selectedOption === 'Post later') {
              Facebook.publishPhoto(this.props.pageId, Facebook.POST_UNPUBLISHED, res.body.postResponse.location, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
            } else if (this.state.selectedOption === 'Schedule') {
              Facebook.publishPhoto(this.props.pageId, Facebook.POST_SCHEDULE, res.body.postResponse.location, this.state.text, this.state.date, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
            }
          }
        })
        .progress((e) => {
          console.log(e.loaded / e.total);
          if (e.loaded / e.total < 1) {
            // that.setState({ status: 'UPLOADING' });
          } else if (e.loaded / e.total === 1) {
            Toast.show('Uploaded...');
          }
        });
      }).catch((err) => {
        console.log('ImageResizer', err);
      });
    }

    if (!this.state.source && this.state.text) {
      if (this.state.selectedOption === 'Post now') {
        Facebook.publish(this.props.pageId, Facebook.POST_PUBLISHED, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
      } else if (this.state.selectedOption === 'Post later') {
        Facebook.publish(this.props.pageId, Facebook.POST_UNPUBLISHED, this.state.text, null, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
      } else if (this.state.selectedOption === 'Schedule') {
        Facebook.publish(this.props.pageId, Facebook.POST_SCHEDULE, this.state.text, this.state.date, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
      }
    }
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error publishing post:', error, error.message);
      if (error && error.message) {
        alert(error.message);
      }
    } else {
      console.log('Success publishing post:', result);
      Actions.pop();
      Actions.refresh({ addNew: true });
      Toast.show('Posted successfully');
    }
  }

  pop() {
    if (this.state.text || this.state.source) {
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

  imagePick() {
    ImagePicker.showImagePicker(null, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        console.log('Image uri', response.uri);

        let source;
        if (Platform.OS === 'ios') {
          source = { uri: response.uri.replace('file://', ''), isStatic: true };
        } else {
          source = { uri: response.uri, isStatic: true };
        }

        this.setState({
          source,
          uri: response.uri,
        });
      }
    });
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
            title: (this.state.text || this.state.source) ? 'Post' : '',
            handler: () => this.onRequest(),
          }}
        />

        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: 'flex-start', margin: 15, flexDirection: 'row' }}>
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

          <FormInput
            multiline
            placeholder={'Write something...'}
            onChangeText={text => this.setState({ text })}
          />

          <View style={{ flex: 5 }}>
            <View style={{ margin: 22, flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableHighlight underlayColor="white" onPress={() => this.imagePick()}>
                <Icon name="camera-alt" size={26} color="gray" />
              </TouchableHighlight>
            </View>
            {this.state.source && <TouchableHighlight underlayColor="white" onPress={() => this.setState({ source: null })}>
              <Image
                resizeMode={'contain'}
                style={{ justifyContent: 'center', alignItems: 'center', width: window.width, height: window.width * (2 / 3) }}
                source={this.state.source}
              >
                <Icon name="highlight-off" size={60} color="white" style={{ backgroundColor: 'rgba(0,0,0,0)' }} />
              </Image>
            </TouchableHighlight>}
          </View>

          <View style={{ flex: 6, justifyContent: 'flex-end', backgroundColor: this.state.selectedOption === 'Schedule' ? 'white' : 'rgba(0,0,0,0)' }}>
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
          </View>
        </View>
        <KeyboardSpacer />
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
