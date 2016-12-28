import React, { Component } from 'react';
import {
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
import Parse from 'url-parse';

import Cover from './components/cover';
import Insight from './components/insight';
import ProfilePicture from './components/profile-picture';

import { Actions } from 'react-native-router-flux';
import { Card, ListItem, Button } from 'react-native-elements';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NavigationBar from 'react-native-navbar';
import ParsedText from 'react-native-parsed-text';

const window = Dimensions.get('window');

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
    this._onRequest();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      this.setState({
        dataSource: this.dataSource.cloneWithRows(result.data),
        posts: result.data,
        refreshing: false,
      });

      if (result.paging) {
        let url = Parse(result.paging.next, true);
        if (url.query.until) {
          this.setState({
            nextUntil: url.query.until,
          });
        }
      }
    }
  }

  _responsePagingInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching feed:', result);
      let newPosts = this.state.posts.concat(result.data);

      this.setState({
        dataSource: this.dataSource.cloneWithRows(newPosts),
        posts: newPosts,
      });

      if (result.paging) {
        let url = Parse(result.paging.next, true);
        if (url.query.until) {
          this.setState({
            nextUntil: url.query.until,
          });
          // alert(url.query.until);
        }
      }
    }
  }

  _onRequest() {
    this.setState({ refreshing: true });

    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/feed`,
      {
        parameters: {
          fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,privacy,place,properties,shares,source,to,type' },
          limit: { string: '5' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  _onPagingRequest() {
    if (this.state.nextUntil) {
      const infoRequest = new GraphRequest(
        `/${this.props.pageId}/feed`,
        {
          parameters: {
            fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,privacy,place,properties,shares,source,to,type' },
            limit: { string: '5' },
            until: { string: `${parseInt(this.state.nextUntil) - 2}` },
          },
          accessToken: this.props.pageAccessToken,
        },
        (error, result) => this._responsePagingInfoCallback(error, result),
      );

      new GraphRequestManager().addRequest(infoRequest).start();
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
            })
          }}
        />

        <ListView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRequest.bind(this)}
            />
          }

          enableEmptySections={true}
          onEndReached={() => {
            console.log('onEndReached');
            this._onPagingRequest();
          }}
          dataSource={this.state.dataSource}

          renderHeader={() => <Cover {...this.props} />}
          renderRow={(item) => <View style={{ marginBottom: 5, backgroundColor: 'white' }}>
            <View style={{ padding: 15 }}>
              <View style={{ flexDirection: 'row' }}>
                <ProfilePicture userId={item.from && item.from.id} />
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
              </View>

              <ParsedText
                style={{ fontWeight: '400', marginBottom: 10, lineHeight: 22 }}
                parse={
                  [
                    { type: 'url', style: styles.url, onPress: this.handleUrlPress },
                  ]
                }
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

            {(item.type === 'link' || item.type === 'video') && <TouchableHighlight underlayColor='white' onPress={() => Linking.openURL(item.link) }>
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
