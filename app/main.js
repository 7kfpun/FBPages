import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { Actions } from 'react-native-router-flux';
import { List, ListItem } from 'react-native-elements';
import NavigationBar from 'react-native-navbar';

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
  }

  componentWillReceiveProps() {
    this.onRequest();
  }

  onRequest() {
    console.log('onRequest accounts');
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
          style={{
            borderBottomWidth: StyleSheet.hairlineWidth * 2,
            borderBottomColor: '#E0E0E0',
          }}
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
          <List containerStyle={{ marginBottom: 20 }}>
            {
              this.state.pages.map((item, i) => (
                <ListItem
                  key={i}
                  avatar={item.picture && item.picture.data && item.picture.data.url}
                  title={item.name}
                  subtitle={item.category}
                  onPress={() => Actions.summary({
                    pageId: item.id,
                    pageName: item.name,
                    pageCategory: item.category,
                    pageAccessToken: item.access_token,
                    pageCover: item.cover && item.cover.source,
                    pagePicture: item.picture && item.picture.data && item.picture.data.url,
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

Main.propTypes = {
  title: React.PropTypes.string,
};
