import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Insight from './insight';

import moment from 'moment';

import { Actions } from 'react-native-router-flux';
import { Card, ListItem, Button } from 'react-native-elements';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import NavigationBar from 'react-native-navbar';

export default class publishedPost extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      posts: [],
    };
  }

  componentDidMount() {
    this._onRefresh();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching data:', error);
    } else {
      console.log('Success fetching data:', result);
      this.setState({
        posts: result.data,
        refreshing: false,
      });
    }
  }

  _onRefresh() {
    console.log(this.props.pageId);
    this.setState({ refreshing: true });

    // Create a graph request asking for user information with a callback to handle the response.
    const infoRequest = new GraphRequest(
      `/${this.props.pageId}/feed`,
      // '/935544009880691/feed',
      // '/1402987109960859/feed',
      null,
      (error, result) => this._responseInfoCallback(error, result),
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
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
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
        >
          {
            this.state.posts.map((item, i) => (
              <Card key={i}>
                <Text style={{ marginBottom: 10 }}>
                  {item.message}
                </Text>
                <Text style={{ marginBottom: 10 }}>
                  {moment(item.created_time).fromNow()}
                </Text>
                <Insight postId={item.id} pageName={that.props.pageName} pageAccessToken={that.props.pageAccessToken} />
              </Card>
            ))
          }
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
