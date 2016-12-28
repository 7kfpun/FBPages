import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ProfilePicture from './profile-picture';

import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';

const window = Dimensions.get('window');

export default class Cover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: 'https://i2.cdn.turner.com/cnn/dam/assets/141202112409-profile-background-stock.jpg',
    };
  }

  componentDidMount() {
    this._onRequest();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data cover:', result);
      if (result.cover && result.cover.source) {
        this.setState({
          url: result.cover && result.cover.source,
        });
      }
    }
  }

  _onRequest() {
    const infoRequest = new GraphRequest(
      this.props.pageId,
      {
        parameters: {
          fields: { string: 'cover' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    return (
      <Image
        style={styles.container}
        source={{ uri: this.state.url }}
      >
        <View style={styles.body}>
          <View style={{ flexDirection: 'row' }}>
            <ProfilePicture userId={this.props.pageId} width={70} />
            <View style={styles.textBlock}>
              <Text style={styles.headlineText}>{this.props.pageName}</Text>
              <Text style={styles.text}>{this.props.pageCategory}</Text>
            </View>
          </View>
        </View>
      </Image>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: window.width,
    height: 180,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 15,
  },
  textBlock: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  headlineText: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
    fontSize: 18,
    lineHeight: 24,
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 1,
    textShadowColor: 'black',
    marginBottom: 8,
  },
  text: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 1,
    textShadowColor: 'black',
    marginBottom: 8,
  },
});
