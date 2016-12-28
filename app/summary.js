import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Cover from './components/cover';

import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import { FormLabel } from 'react-native-elements'
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';
import Spinner from'react-native-spinkit';

export default class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publishedPostsLength: 0,
      unpublishedPostsLength: 0,
    };
  }

  componentDidMount() {
    this._onPublishedRequest();
    this._onUnpublishedRequest();
  }

  _responsePublishedInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      if (result.data.length === 100) {
        this.setState({
          publishedPostsLength: '100+',
        });
      } else {
        this.setState({
          publishedPostsLength: result.data.length,
        });
      }
    }
  }

  _responseUnpublishedInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      if (result.data.length === 100) {
        this.setState({
          unpublishedPostsLength: '100+',
        });
      } else {
        this.setState({
          unpublishedPostsLength: result.data.length,
        });
      }
    }
  }

  _onPublishedRequest() {
    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/feed`,
      {
        parameters: {
          fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,place,properties,shares,source,to,type' },
          limit: { string: '100' },
        },
        accessToken: this.props.pageAccessToken,
      },
      (error, result) => this._responsePublishedInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  _onUnpublishedRequest() {
    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/promotable_posts`,
      {
        parameters: {
          is_published: { string: 'false' },
          fields: { string: 'id,admin_creator,application,caption,created_time,description,from,icon,is_hidden,link,message,message_tags,name,object_id,full_picture,place,properties,shares,source,to,type,scheduled_publish_time' },
          limit: { string: '100' },
        },
      },
      (error, result) => this._responseUnpublishedInfoCallback(error, result),
    );

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

        <Cover {...this.props} />

        <ScrollView
          // refreshControl={
          //   <RefreshControl
          //     refreshing={this.state.refreshing}
          //     onRefresh={this._onRefresh.bind(this)}
          //   />
          // }
        >
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

        <Button
          raised
          icon={{ name: 'edit' }}
          title='Publish'
          onPress={() => Actions.publish({
            pageId: this.props.pageId,
            pageName: this.props.pageName,
            pageCategory: this.props.pageCategory,
            pageAccessToken: this.props.pageAccessToken,
          })}
        />

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
