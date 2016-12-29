import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { Button, List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';
import CacheStore from 'react-native-cache-store';

import * as Facebook from './utils/facebook';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
});

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      pages: [],
    };
  }

  componentDidMount() {
    this.onRequest();
    CacheStore.flush();
  }

  onRequest() {
    this.setState({ refreshing: true });
    Facebook.accounts((error, result) => this.responseInfoCallback(error, result));
  }

  responseInfoCallback(error, result) {
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
              onRefresh={() => this.onRequest()}
            />
          }
        >
          {this.state.pages.length === 0 && <Button raised icon={{ name: 'cached' }} title={'Refresh'} onPress={() => this.onRequest()} />}
          {this.state.pages.length !== 0 && <List containerStyle={{ marginBottom: 20 }}>
            {
              this.state.pages.map((item, i) => (
                <ListItem
                  roundAvatar
                  key={i}
                  avatar={item.picture && item.picture.data && item.picture.data.url}
                  title={item.name}
                  subtitle={item.category}
                  onPress={() => Actions.summary({
                    pageId: item.id,
                    pageName: item.name,
                    pageCategory: item.category,
                    pageAccessToken: item.access_token,
                    pageCover: item.picture && item.picture.data && item.picture.data.url,
                    pagePicture: item.cover && item.cover.source,
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

Main.propTypes = {
  title: React.PropTypes.string,
};
