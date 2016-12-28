import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import Spinner from'react-native-spinkit';

export default class Insight extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postImpressions: null,
    };
  }

  componentDidMount() {
    this._onRefresh();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching insight:', error);
    } else {
      console.log('Success fetching insight:', result);
      if (result.data && result.data.length && result.data[0].values.length) {
        this.setState({
          postImpressions: result.data[0].values[0].value,
        });
      } else {
        this.setState({
          postImpressions: 'N/A',
        });
      }
    }
  }

  _onRefresh() {
    const infoRequest = new GraphRequest(
      `/${this.props.postId}/insights/post_impressions_unique`,
      {
        parameters: {
          fields: { string: 'values' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    if (this.state.postImpressions === 'N/A') {
      return <Text style={styles.text}>Post impressions are not available now</Text>;
    } else if (this.state.postImpressions !== null) {
      return <Text style={styles.text}>This post has been viewed by {this.state.postImpressions}</Text>;
    }

    return <Spinner style={styles.spinner} isVisible={true} size={20} type={'Wave'} color={'gray'}/>;
  }
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '300',
    fontStyle: 'italic',
  },
});
