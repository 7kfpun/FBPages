import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';

import Cover from './components/cover';

import * as Facebook from './utils/facebook';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
});

export default class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publishedPostsLength: 0,
      unpublishedPostsLength: 0,
      refreshing: false,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh() {
    this.onPublishedRequest();
    this.onUnpublishedRequest();
  }

  onPublishedRequest() {
    this.setState({ refreshing: true });
    Facebook.feed(this.props.pageId, Facebook.FEED_PUBLISHED, 100, null, (error, result) => this.responsePublishedInfoCallback(error, result));
  }

  onUnpublishedRequest() {
    this.setState({ refreshing: true });
    Facebook.feed(this.props.pageId, Facebook.FEED_UNPUBLISHED, 100, this.props.pageAccessToken, (error, result) => this.responseUnpublishedInfoCallback(error, result));
  }

  responsePublishedInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      if (result.data && result.data.length === 100) {
        this.setState({
          publishedPostsLength: '100+',
        });
      } else {
        this.setState({
          publishedPostsLength: (result.data && result.data.length) || 0,
          refreshing: false,
        });
      }
    }
  }

  responseUnpublishedInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      if (result.data && result.data.length === 100) {
        this.setState({
          unpublishedPostsLength: '100+',
        });
      } else {
        this.setState({
          unpublishedPostsLength: (result.data && result.data.length) || 0,
          refreshing: false,
        });
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title: this.props.title }}
          leftButton={{
            title: 'Back',
            handler: Actions.pop,
          }}
          rightButton={{
            title: 'Publish',
            handler: () => Actions.publish({
              pageId: this.props.pageId,
              pageName: this.props.pageName,
              pageCategory: this.props.pageCategory,
              pageAccessToken: this.props.pageAccessToken,
            }),
          }}
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }
        >
          <Cover {...this.props} />

          <List containerStyle={{ marginBottom: 20 }}>
            <ListItem
              title={'Published Posts'}
              leftIcon={{ name: 'description' }}
              onPress={() => Actions.publishedPost({
                pageId: this.props.pageId,
                pageName: this.props.pageName,
                pageCategory: this.props.pageCategory,
                pageAccessToken: this.props.pageAccessToken,
              })}
              badge={{ value: this.state.publishedPostsLength, badgeTextStyle: { color: 'white' } }}
            />
            <ListItem
              title={'Scheduled Posts'}
              leftIcon={{ name: 'schedule' }}
              onPress={() => Actions.unpublishedPost({
                pageId: this.props.pageId,
                pageName: this.props.pageName,
                pageCategory: this.props.pageCategory,
                pageAccessToken: this.props.pageAccessToken,
              })}
              badge={{ value: this.state.unpublishedPostsLength, badgeTextStyle: { color: 'white' } }}
            />
          </List>
        </ScrollView>
      </View>
    );
  }
}

Summary.propTypes = {
  title: React.PropTypes.string,
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
