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

export default class Summary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      published: [],
      unpublished: [],
    };
  }

  componentDidMount() {
    console.log(this.props.pageId);
  }

  // _responseInfoCallback(error, result) {
  //   if (error) {
  //     console.log('Error fetching data:', error);
  //   } else {
  //     console.log('Success fetching data:', result);
  //     this.setState({ pages: result.data });
  //     this.setState({ refreshing: false });
  //   }
  // }
  //
  // _onRefresh() {
  //   console.log(this.props.pageId);
  //   this.setState({ refreshing: true });
  //
  //   // Create a graph request asking for user information with a callback to handle the response.
  //   const infoRequest = new GraphRequest(
  //     `/${this.props.pageId}/feed`,
  //     null,
  //     (error, result) => this._responseInfoCallback(error, result),
  //   );
  //   // Start the graph request.
  //   new GraphRequestManager().addRequest(infoRequest).start();
  // }

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
              badge={{ value: this.state.published.length, badgeTextStyle: { color: 'white' } }}
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
              badge={{ value: this.state.unpublished.length, badgeTextStyle: { color: 'white' } }}
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
