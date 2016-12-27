import React, { Component } from 'react';
import {
  RefreshControl,
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import { List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';

import {
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';

export default class AppReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      pages: [],
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
        pages: result.data,
        refreshing: false,
      });
    }
  }

  _onRefresh() {
    this.setState({ refreshing: true });

    // Create a graph request asking for user information with a callback to handle the response.
    const infoRequest = new GraphRequest(
      '/me/accounts',
      null,
      (error, result) => this._responseInfoCallback(error, result),
    );
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar title={{ title: this.props.title }} />
        <Button raised icon={{ name: 'cached' }} title='Login' onPress={Actions.login}/>

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh.bind(this)}
            />
          }
        >
          <List containerStyle={{ marginBottom: 20 }}>
            {
              this.state.pages.map((item, i) => (
                <ListItem
                  roundAvatar
                  key={i}
                  title={item.name}
                  onPress={() => Actions.summary({
                    pageId: item.id,
                    pageName: item.name,
                    pageCategory: item.category,
                    pageAccessToken: item.access_token,
                  })}
                />
              ))
            }
          </List>
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
