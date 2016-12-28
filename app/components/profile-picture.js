import React, { Component } from 'react';
import {
  Image,
  StyleSheet,
  View,
} from 'react-native';

import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

export default class ProfilePicture extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: 'https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/399548_10149999285987789_1102888142_n.png?oh=82d551fbd5c70ae9e2ad123aaebbc331&oe=58E6646A',
    };
  }

  componentDidMount() {
    this._onRequest();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      if (result.picture && result.picture.data && result.picture.data.url) {
        this.setState({
          url: result.picture && result.picture.data && result.picture.data.url,
        });
      }
    }
  }

  _onRequest() {
    const infoRequest = new GraphRequest(
      this.props.userId,
      {
        parameters: {
          fields: { string: 'picture.type(small)' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    return (
      <View style={{ width: this.props.width }}>
        <Image
          style={{ width: this.props.width, height: this.props.width }}
          source={{ uri: this.state.url }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {},
});

ProfilePicture.defaultProps = {
  width: 40,
}
