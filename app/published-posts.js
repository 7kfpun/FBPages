import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  ListView,
  Modal,
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
import DeleteIcon from './components/delete-icon';
import Insight from './components/insight';
import ProfilePicture from './components/profile-picture';

import * as Facebook from './utils/facebook';

const window = Dimensions.get('window');

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
  fullPreview: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: window.width,
    height: window.height,
    resizeMode: 'contain',
  },
  url: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
  likesCommentsBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCommentsText: {
    fontSize: 11,
    fontWeight: '300',
    margin: 6,
  },
});

export default class publishedPosts extends Component {
  constructor(props) {
    super(props);
    this.dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });

    this.state = {
      refreshing: false,
      posts: [],
      dataSource: this.dataSource.cloneWithRows([]),
      nextUntil: null,
      isModalVisible: false,
      selectedImage: null,
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

  setModalVisible(visible) {
    this.setState({ isModalVisible: visible });
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
      console.log('Error deleting post:', error);
    } else {
      console.log('Success deleting post:', result);
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

        {this.state.selectedImage && <Modal
          animationType="fade"
          transparent={true}
          visible={this.state.isModalVisible}
          onRequestClose={() => this.setModalVisible(false)}
        >
          <TouchableHighlight
            style={styles.fullPreview}
            onPress={() => this.setModalVisible(!this.state.isModalVisible)}
            onPressIn={() => this.setModalVisible(!this.state.isModalVisible)}
          >
            <Image
              style={styles.fullImage}
              source={{ uri: this.state.selectedImage }}
            />
          </TouchableHighlight>
        </Modal>}

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
                  {item.application && item.application.name && <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 3 }}>
                    {`Posted by ${item.application.name}`}
                  </Text>}
                  <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 8 }}>
                    {Moment(item.created_time).fromNow()} {item.privacy && item.privacy.description === 'Public' && <Icon name="public" size={11} color="gray" />}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <DeleteIcon postId={item.id} pageAccessToken={this.props.pageAccessToken} callback={(error, result) => this.responseDeleteInfoCallback(error, result)} />
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

            {!(item.type === 'link' || item.type === 'video') && item.full_picture && <TouchableHighlight
              onPress={() => {
                this.setModalVisible(true);
                this.setState({ selectedImage: item.full_picture });
              }}
              underlayColor="white"
            >
              <Image
                resizeMode={'contain'}
                style={{ marginBottom: 10, width: window.width, height: 280 }}
                source={{ uri: item.full_picture }}
              />
            </TouchableHighlight>}

            {(item.type === 'link' || item.type === 'video') && <TouchableHighlight underlayColor={'white'} onPress={() => Linking.openURL(item.source || item.link)}>
              <View style={{ margin: 10, padding: 15, borderWidth: 1, borderColor: '#EEEEEE' }}>
                {item.full_picture && <Image
                  resizeMode={'contain'}
                  style={{ marginBottom: 10, width: window.width - 50, height: 220 }}
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
              <View style={styles.likesCommentsBlock}>
                <Icon name="thumb-up" size={11} color="gray" /><Text style={styles.likesCommentsText}>{item.likes && item.likes.summary && item.likes.summary.total_count}</Text>
                <Icon name="comment" size={11} color="gray" /><Text style={styles.likesCommentsText}>{item.comments && item.comments.summary && item.comments.summary.total_count}</Text>
                <Icon name="share" size={11} color="gray" /><Text style={styles.likesCommentsText}>{(item.shares && item.shares.count) || 0}</Text>
              </View>
              <Insight postId={item.id} pageName={this.props.pageName} pageAccessToken={this.props.pageAccessToken} />
            </View>
          </View>}
        />
      </View>
    );
  }
}

publishedPosts.propTypes = {
  title: React.PropTypes.string,
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};