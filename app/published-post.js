import React, { Component } from 'react';
import {
  Image,
  ListView,
  RefreshControl,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Moment from 'moment';

import Cover from './components/cover';
import Insight from './components/insight';
import ProfilePicture from './components/profile-picture';

import { Actions } from 'react-native-router-flux';
import { Card, ListItem, Button } from 'react-native-elements';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import NavigationBar from 'react-native-navbar';
import ParsedText from 'react-native-parsed-text';

export default class publishedPost extends Component {
  constructor(props) {
    super(props);

    this.dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });

    this.state = {
      dataSource: this.dataSource.cloneWithRows([]),
      refreshing: false,
      posts: [],
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
        refreshing: false,
      });
    }
  }

  _onRequest() {
    this.setState({ refreshing: true });

    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/feed`,
      // '/935544009880691/feed',
      // '/1402987109960859/feed',
      {
        parameters: {
          fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,place,properties,shares,source,to,type' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  handleUrlPress(url) {
    Linking.openURL(url);
  }

  render() {
    const that = this;
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

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRequest.bind(this)}
            />
          }>
          <Cover {...this.props} />

          <ListView
            enableEmptySections={true}
            dataSource={this.state.dataSource}
            renderRow={(item) => <Card>
              <View style={{ flexDirection: 'row' }}>
                <ProfilePicture userId={item.from && item.from.id} />
                <View style={{ flexDirection: 'column', marginLeft: 5 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 3 }}>
                    {item.from && item.from.name} {item.to && item.to.data && ` >> ${item.to.data[0].name}`}
                  </Text>
                  {item.admin_creator && item.admin_creator.name && <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 3 }}>
                    {`Posted by ${item.admin_creator.name}`}
                  </Text>}
                  <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 8 }}>
                    {Moment(item.created_time).fromNow()}
                  </Text>
                </View>
              </View>

              <ParsedText
                style={{ marginBottom: 10 }}
                parse={
                  [
                    { type: 'url', style: styles.url, onPress: this.handleUrlPress },
                  ]
                }
              >
                {item.message}
              </ParsedText>
              {item.full_picture && <Image
                resizeMode={'contain'}
                style={{ width: 310, height: 310 }}
                source={{ uri: item.full_picture }}
              />}
              <Insight postId={item.id} pageName={that.props.pageName} pageAccessToken={that.props.pageAccessToken} />
            </Card>}
          />
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  url: {
    color: '#1565C0',
    textDecorationLine: 'underline',
  },
});
