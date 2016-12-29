import React, { Component } from 'react';
import {
  ActionSheetIOS,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-root-toast';

import * as Facebook from '../utils/facebook';

export default class DeleteIcon extends Component {
  onDelete() {
    console.log('Delete post', this.props.postId);
    Toast.show('Deleting...', { duration: 1000 });  // in ms
    Facebook.deletePost(this.props.postId, this.props.pageAccessToken, (error, result) => this.props.callback(error, result));
  }

  render() {
    return (<Icon
      name="expand-more"
      size={20}
      color="gray"
      onPress={() => {
        const BUTTONS = [
          'Delete',
          'Cancel',
        ];
        const DESTRUCTIVE_INDEX = 0;
        const CANCEL_INDEX = 1;

        ActionSheetIOS.showActionSheetWithOptions({
          options: BUTTONS,
          cancelButtonIndex: CANCEL_INDEX,
          destructiveButtonIndex: DESTRUCTIVE_INDEX,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            this.onDelete();
          }
        });
      }}
    />);
  }
}

DeleteIcon.propTypes = {
  postId: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
  callback: React.PropTypes.func,
};
