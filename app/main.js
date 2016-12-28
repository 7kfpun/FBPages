import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Button } from 'react-native-elements';
import { GraphRequest, GraphRequestManager } from 'react-native-fbsdk';
import { List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';

export default class AppReview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      pages: [],
    };
  }

  componentDidMount() {
    this._onRequest();
  }

  _responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching accounts:', error);
      Actions.login();
      this.setState({
        refreshing: false,
      });
    } else {
      console.log('Success fetching accounts:', result);
      this.setState({
        pages: result.data,
        refreshing: false,
      });
    }
  }

  _onRequest() {
    this.setState({ refreshing: true });

    const infoRequest = new GraphRequest(
      '/me/accounts',
      null,
      (error, result) => this._responseInfoCallback(error, result),
    );

    new GraphRequestManager().addRequest(infoRequest).start();
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title: this.props.title }}
          leftButton={{
            title: 'Logout',
            handler: Actions.login,
          }}
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRequest.bind(this)}
            />
          }
        >
          {this.state.pages.length === 0 && <Button raised icon={{ name: 'cached' }} title='Refresh' onPress={() => this._onRequest()}/>}
          {this.state.pages.length !== 0 && <List containerStyle={{ marginBottom: 20 }}>
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
          </List>}
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
});
