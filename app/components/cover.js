import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import CacheStore from 'react-native-cache-store';

import ProfilePicture from './profile-picture';

const window = Dimensions.get('window');

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
    fontSize: 20,
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

export default class Cover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: 'https://i2.cdn.turner.com/cnn/dam/assets/141202112409-profile-background-stock.jpg',
    };
  }

  componentDidMount() {
    this.onRequest();
  }

  onRequest() {
    CacheStore.get(`cover-${this.props.pageId}`).then((value) => {
      if (value) {
        this.setState({
          url: value,
        });
      } else {
        const infoRequest = new GraphRequest(
          this.props.pageId,
          {
            parameters: {
              fields: { string: 'cover' },
            },
            accessToken: this.props.pageAccessToken,
          },
          (error, result) => this.responseInfoCallback(error, result),
        );

        new GraphRequestManager().addRequest(infoRequest).start();
      }
    });
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data cover:', result);
      if (result.cover && result.cover.source) {
        this.setState({
          url: result.cover.source,
        });
        CacheStore.set(`cover-${this.props.pageId}`, result.cover.source, 2);  // in min
      }
    }
  }

  render() {
    return (
      <Image
        style={styles.container}
        source={{ uri: this.state.url }}
      >
        <View style={styles.body}>
          <View style={{ flexDirection: 'row' }}>
            <ProfilePicture pageId={this.props.pageId} width={70} />
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

Cover.propTypes = {
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
