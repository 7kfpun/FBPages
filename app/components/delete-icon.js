import React, { Component } from 'react';
import {
  ActionSheetIOS,
  TouchableHighlight,
} from 'react-native';

import { AccessToken, LoginManager } from 'react-native-fbsdk';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-root-toast';

import * as Facebook from '../utils/facebook';

export default class DeleteIcon extends Component {
  onDelete() {
    console.log('Delete post', this.props.postId);
    Toast.show('Deleting...', { duration: 1000 });  // in ms
    Facebook.deletePost(this.props.postId, this.props.pageAccessToken, (error, result) => this.props.callback(error, result));
  }

  onPublishNow() {
    Toast.show('Publish now', { duration: 1000 });  // in ms
    Facebook.publishNowPost(this.props.postId, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      Toast.show('Publish now', { duration: 1000 });  // in ms
    }
  }

  render() {
    return (<TouchableHighlight
      underlayColor="white"
      onPress={() => {
        const BUTTONS = [
          'Delete',
          'Publish now',
          'Cancel',
        ];
        const DESTRUCTIVE_INDEX = 0;
        const CANCEL_INDEX = 2;

        ActionSheetIOS.showActionSheetWithOptions({
          options: BUTTONS,
          cancelButtonIndex: CANCEL_INDEX,
          destructiveButtonIndex: DESTRUCTIVE_INDEX,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            AccessToken.getCurrentAccessToken().then(
              (data) => {
                console.log('getCurrentAccessToken', data);
                if (!data.permissions || data.permissions.indexOf('publish_pages') === -1) {
                  LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages']).then(
                    (result) => {
                      if (result.isCancelled) {
                        alert('Login cancelled. You cannot delete a post without manage_pages and publish_pages permissions.');
                        Actions.pop();
                      } else {
                        this.onDelete();
                      }
                    },
                    (error) => {
                      alert(`Login fail with error: ${error}`);
                      Actions.pop();
                    },
                  );
                } else if (data.permissions && data.permissions.indexOf('publish_pages') !== -1) {
                  this.onDelete();
                }
              },
            );
          } else if (buttonIndex === 1) {
            AccessToken.getCurrentAccessToken().then(
              (data) => {
                console.log('getCurrentAccessToken', data);
                if (!data.permissions || data.permissions.indexOf('publish_pages') === -1) {
                  LoginManager.logInWithPublishPermissions(['manage_pages', 'publish_pages']).then(
                    (result) => {
                      if (result.isCancelled) {
                        alert('Login cancelled. You cannot delete a post without manage_pages and publish_pages permissions.');
                        Actions.pop();
                      } else {
                        this.onPublishNow();
                      }
                    },
                    (error) => {
                      alert(`Login fail with error: ${error}`);
                      Actions.pop();
                    },
                  );
                } else if (data.permissions && data.permissions.indexOf('publish_pages') !== -1) {
                  this.onPublishNow();
                }
              },
            );
          }
        });
      }}
    >
      <Icon name="expand-more" size={24} color="gray" />
    </TouchableHighlight>);
  }
}

DeleteIcon.propTypes = {
  postId: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
  callback: React.PropTypes.func,
};
