import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  ListView,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Moment from 'moment';

import Cover from './components/cover';
import ProfilePicture from './components/profile-picture';

import { Actions } from 'react-native-router-flux';
import { Card, ListItem, Button } from 'react-native-elements';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import NavigationBar from 'react-native-navbar';
import ParsedText from 'react-native-parsed-text';

export default class Post extends Component {
  constructor(props) {
    super(props);
    this.dataSource = new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 });

    this.state = {
      dataSource: this.dataSource.cloneWithRows([]),
      refreshing: false,
    };
  }

  componentDidMount() {
    this._onRequest();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      this.setState({
        dataSource: this.dataSource.cloneWithRows(result.data),
        refreshing: false,
      });
    }
  }

  _onRequest() {
    console.log(this.props.pageId);
    this.setState({ refreshing: true });

    // Create a graph request asking for user information with a callback to handle the response.
    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/promotable_posts`,
      // '/935544009880691/feed',
      // '/1402987109960859/feed',
      {
        parameters: {
          is_published: { string: 'false' },
          fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,place,properties,shares,source,to,type,scheduled_publish_time' },
        },
      },
      (error, result) => this._responseInfoCallback(error, result),
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
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
            renderRow={(item) => <View style={{ marginBottom: 5, backgroundColor: 'white' }}>
              <View style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row' }}>
                  <ProfilePicture userId={item.from && item.from.id} />
                  <View style={{ flexDirection: 'column', marginLeft: 8 }}>
                    <Text style={{ fontWeight: '600', marginBottom: 3 }}>
                      {item.from && item.from.name}{item.to && item.to.data && ` > ${item.to.data[0].name}`}
                    </Text>
                    {item.admin_creator && item.admin_creator.name && <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 3 }}>
                      {`Posted by ${item.admin_creator.name}`}
                    </Text>}
                    {item.application && item.application.name && <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 3 }}>
                      {`Posted by ${item.application.name}`}
                    </Text>}
                    <Text style={{ fontSize: 12, fontWeight: '300', color: 'gray', marginBottom: 8 }}>
                      {item.scheduled_publish_time && `Will be published ${Moment(new Date(item.scheduled_publish_time * 1000)).fromNow()}`}
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
              </View>

              {item.full_picture && <Image
                resizeMode={'contain'}
                style={{
                  marginBottom: 10,
                  width: window.width,
                  height: 320,
                }}
                source={{ uri: item.full_picture }}
              />}
            </View>}
          />
        </ScrollView>
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
