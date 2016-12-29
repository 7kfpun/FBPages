import React, { Component } from 'react';
import {
  ActionSheetIOS,
  Dimensions,
  Image,
  Linking,
  ListView,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';

import Moment from 'moment';

import { Actions } from 'react-native-router-flux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';
import ParsedText from 'react-native-parsed-text';
import Toast from 'react-native-root-toast';

import Cover from './components/cover';
import Insight from './components/insight';
import ProfilePicture from './components/profile-picture';

import * as Facebook from './utils/facebook';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  url: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});

export default class publishedPost extends Component {
  constructor(props) {
    super(props);
    this.dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });

    this.state = {
      refreshing: false,
      posts: [],
      dataSource: this.dataSource.cloneWithRows([]),
      nextUntil: null,
    };
  }

  componentDidMount() {
    this.onRequest();
  }

  componentWillReceiveProps() {
    this.onRequest();
  }

  onRequest() {
    this.setState({ refreshing: true });
    Facebook.feed(this.props.pageId, Facebook.FEED_PUBLISHED, 10, null, (error, result) => this.responseInfoCallback(error, result));
  }

  onPagingRequest() {
    if (this.state.pagingNext) {
      fetch(this.state.pagingNext).then(res => res.json())
        .then((result) => {
          console.log('pagingNext', result);
          if (result.data && result.data.length) {
            const newPosts = this.state.posts.concat(result.data);

            this.setState({
              dataSource: this.dataSource.cloneWithRows(newPosts),
              posts: newPosts,
            });

            if (result.paging && result.paging.next) {
              this.setState({
                pagingNext: result.paging.next,
              });
            }
          }
        });
    }
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      this.setState({
        dataSource: this.dataSource.cloneWithRows(result.data),
        posts: result.data,
        refreshing: false,
      });

      if (result.paging && result.paging.next) {
        this.setState({
          pagingNext: result.paging.next,
        });
      }
    }
  }

  responseDeleteInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      Toast.show('Deleted successfully');
      this.onRequest();
    }
  }

  handleUrlPress(url) {
    Linking.openURL(url);
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

        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRequest()}
            />
          }

          enableEmptySections={true}
          onEndReached={() => {
            console.log('onEndReached');
            this.onPagingRequest();
          }}
          dataSource={this.state.dataSource}

          renderHeader={() => <Cover {...this.props} />}
          renderRow={item => <View style={{ marginBottom: 5, backgroundColor: 'white' }}>
            <View style={{ padding: 15 }}>
              <View style={{ flexDirection: 'row' }}>
                <ProfilePicture pageId={item.from && item.from.id} />
                <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                  <Text style={{ fontWeight: '400', marginBottom: 3 }}>
                    {item.from && item.from.name}{item.to && item.to.data && ` > ${item.to.data[0].name}`}
                  </Text>
                  {item.admin_creator && item.admin_creator.name && <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 3 }}>
                    {`Posted by ${item.admin_creator.name}`}
                  </Text>}
                  <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 8 }}>
                    {Moment(item.created_time).fromNow()} {item.privacy && item.privacy.description === 'Public' && <Icon name="public" size={11} color="gray" />}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Icon
                    name="expand-more"
                    size={18}
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
                          console.log('Delete post', item);
                          Facebook.deletePost(item.id, this.props.pageAccessToken, (error, result) => this.responseDeleteInfoCallback(error, result));
                        }
                      });
                    }}
                  />
                </View>
              </View>

              <ParsedText
                style={{ fontWeight: '400', marginBottom: 10, lineHeight: 22 }}
                parse={[
                  { type: 'url', style: styles.url, onPress: this.handleUrlPress },
                ]}
              >
                {item.message}
              </ParsedText>
            </View>


            {!(item.type === 'link' || item.type === 'video') && item.full_picture && <Image
              resizeMode={'contain'}
              style={{
                marginBottom: 10,
                width: window.width,
                height: 280,
              }}
              source={{ uri: item.full_picture }}
            />}

            {(item.type === 'link' || item.type === 'video') && <TouchableHighlight underlayColor={'white'} onPress={() => Linking.openURL(item.link)}>
              <View style={{ margin: 10, padding: 15, borderWidth: 1, borderColor: '#EEEEEE' }}>
                {item.full_picture && <Image
                  resizeMode={'contain'}
                  style={{
                    marginBottom: 10,
                    width: window.width - 50,
                    height: 200,
                  }}
                  source={{ uri: item.full_picture }}
                />}
                {item.name && <Text style={{ fontWeight: '400', marginBottom: 3 }}>
                  {item.name && item.name.slice(0, 40)}
                </Text>}
                {item.description && <Text style={{ fontWeight: '200', marginBottom: 3 }}>
                  {item.description}
                </Text>}
                {item.caption && <Text style={{ fontWeight: '200', color: 'gray', marginBottom: 3 }}>
                  {item.caption}
                </Text>}
              </View>
            </TouchableHighlight>}

            <View style={{ padding: 15 }}>
              <Insight postId={item.id} pageName={this.props.pageName} pageAccessToken={this.props.pageAccessToken} />
            </View>
          </View>}
        />
      </View>
    );
  }
}

publishedPost.propTypes = {
  title: React.PropTypes.string,
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
