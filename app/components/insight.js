import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import * as Facebook from '../utils/facebook';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  text: {
    fontSize: 11,
    fontWeight: '300',
    marginBottom: 6,
  },
  bar: {
    flexDirection: 'row',
  },
  orangeBar: {
    height: 6,
    backgroundColor: '#FFCC80',
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  grayBar: {
    height: 6,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
});

export default class Insight extends Component {
  constructor(props) {
    super(props);
    this.state = {
      postImpressions: null,
    };
  }

  componentDidMount() {
    this.onRequest();
  }

  onRequest() {
    Facebook.insights(this.props.postId, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
  }

  responseInfoCallback(error, result) {
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

  render() {
    const blockWidth = window.width - 30;
    if (this.state.postImpressions === 'N/A') {
      return <Text style={styles.text}>Post impressions are not available now</Text>;
    } else if (this.state.postImpressions !== null) {
      return (<View>
        <Text style={styles.text}>{this.state.postImpressions} people reached</Text>
        <View style={styles.bar}>
          <View style={[styles.orangeBar, { width: this.state.postImpressions < 3000 ? blockWidth * (this.state.postImpressions / 3000) : blockWidth }]} />
          <View style={[styles.grayBar, { width: this.state.postImpressions < 3000 ? blockWidth * (1 - (this.state.postImpressions / 3000)) : 0 }]} />
        </View>
      </View>);
    }

    return null;
  }
}

Insight.propTypes = {
  postId: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
