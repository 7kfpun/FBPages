import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

export default class Insight extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
    };
  }

  componentDidMount() {
    this._onRefresh();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      if (result) {
        this.setState({
          post_impressions: result.data.length && result.data[0].values.length && result.data[0].values[0].value,
        });
      } else {
        this.setState({
          post_impressions: 'N/A',
        });
      }
    }
  }

  _onRefresh() {
    console.log(this.props.pageName, this.props.pageAccessToken);

    // Create a graph request asking for user information with a callback to handle the response.
    const infoRequest = new GraphRequest(
      `/${this.props.postId}/insights`,
      {
        parameters: {
          fields: { string: 'values' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    if (this.state.post_impressions) {
      return (
        <View style={styles.container}>
          <Text>{this.props.postId}</Text>
          <Text>{this.state.post_impressions}</Text>
        </View>
      );
    }

    return null;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
});
