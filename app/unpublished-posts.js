import React, { Component } from 'react';
import {
  Dimensions,
  Image,
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
import ProfilePicture from './components/profile-picture';

import * as Facebook from './utils/facebook';

const window = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  navigatorBar: {
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#E0E0E0',
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
});

export default class UnpublishedPosts extends Component {
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
    Facebook.feed(this.props.pageId, Facebook.FEED_UNPUBLISHED, 10, this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
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
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      Toast.show('Deleted successfully');
      this.onRequest();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{
            title: this.props.title,
            style: { fontSize: 14 },
          }}
          style={styles.navigatorBar}
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
          ><Icon name="edit" size={24} color="#0076FF" /></TouchableHighlight>}
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
                    {item.scheduled_publish_time && `Will be published ${Moment(new Date(item.scheduled_publish_time * 1000)).fromNow()}`} {item.privacy && item.privacy.description === 'Public' && <Icon name="public" size={11} color="gray" />}
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

            {item.full_picture && <TouchableHighlight
              onPress={() => {
                this.setModalVisible(true);
                this.setState({ selectedImage: item.full_picture });
              }}
              underlayColor="white"
            >
              <Image
                resizeMode={'contain'}
                style={{
                  marginBottom: 10,
                  width: window.width,
                  height: 280,
                }}
                source={{ uri: item.full_picture }}
              />
            </TouchableHighlight>}
          </View>}
        />
      </View>
    );
  }
}

UnpublishedPosts.propTypes = {
  title: React.PropTypes.string,
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
