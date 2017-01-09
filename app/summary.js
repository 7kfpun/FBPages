import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { List, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';

import Cover from './components/cover';

import * as Facebook from './utils/facebook';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  navigatorRightButton: {
    paddingTop: 10,
    paddingLeft: 50,
    paddingRight: 10,
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

  componentWillReceiveProps() {
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
      } else if (result.data) {
        this.setState({
          publishedPostsLength: result.data.length,
        });
      } else {
        this.setState({
          publishedPostsLength: 0,
        });
      }
    }

    this.setState({
      refreshing: false,
    });
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
      } else if (result.data) {
        this.setState({
          unpublishedPostsLength: result.data.length,
        });
      } else {
        this.setState({
          unpublishedPostsLength: 0,
        });
      }
    }

    this.setState({
      refreshing: false,
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
            title: 'Back',
            handler: Actions.pop,
          }}
          rightButton={<TouchableHighlight
            style={styles.navigatorRightButton}
            underlayColor="white"
            onPress={() => Actions.publish({
              pageId: this.props.pageId,
              pageName: this.props.pageName,
              pageCategory: this.props.pageCategory,
              pageAccessToken: this.props.pageAccessToken,
            })}
          ><Icon name="edit" size={26} color="#1787FB" /></TouchableHighlight>}
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
              onPress={() => Actions.publishedPosts({
                pageId: this.props.pageId,
                pageName: this.props.pageName,
                pageCategory: this.props.pageCategory,
                pageAccessToken: this.props.pageAccessToken,
                pageCover: this.props.pageCover,
                pagePicture: this.props.pagePicture,
              })}
              badge={{ value: this.state.publishedPostsLength, badgeTextStyle: { color: 'white' } }}
            />
            <ListItem
              title={'Unpublished / Scheduled Posts'}
              leftIcon={{ name: 'schedule' }}
              onPress={() => Actions.unpublishedPosts({
                pageId: this.props.pageId,
                pageName: this.props.pageName,
                pageCategory: this.props.pageCategory,
                pageAccessToken: this.props.pageAccessToken,
                pageCover: this.props.pageCover,
                pagePicture: this.props.pagePicture,
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
  pageCover: React.PropTypes.string,
  pagePicture: React.PropTypes.string,
};
