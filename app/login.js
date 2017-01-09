import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AccessToken, LoginButton } from 'react-native-fbsdk';
import { Actions } from 'react-native-router-flux';
import NavigationBar from 'react-native-navbar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loginBlock: {
    flex: 1,
  },
  textBlock: {
    flex: 6,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    flex: 3,
    alignItems: 'center',
  },
  informationBlock: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    fontWeight: '100',
    textAlign: 'center',
    color: '#82B1FF',
  },
  informationText: {
    textAlign: 'center',
    color: '#9E9E9E',
  },
});

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogged: false,
    };
  }

  componentDidMount() {
    AccessToken.getCurrentAccessToken().then(
      (data) => {
        console.log('getCurrentAccessToken', data);
        if (data.expirationTime && data.expirationTime > new Date().getTime()) {
          this.setState({ isLogged: true });
        }
      },
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          leftButton={{
            title: this.state.isLogged ? 'Cancel' : '',
            handler: Actions.pop,
          }}
        />

        <View style={styles.loginBlock}>
          {this.state.isLogged && <View style={styles.textBlock}>
            <Text style={styles.text}>Logout</Text>
          </View>}
          {!this.state.isLogged && <View style={styles.textBlock}>
            <Text style={styles.text}>Welcome to</Text>
            <Text style={styles.text}>Pages Manager</Text>
          </View>}
          <View style={styles.loginButton}>
            <LoginButton
              readPermissions={['pages_show_list', 'read_insights']}
              onLoginFinished={
                (error, result) => {
                  if (error) {
                    alert(`login has error: ${result.error}`);
                  } else if (result.isCancelled) {
                    alert('login is cancelled.');
                  } else {
                    AccessToken.getCurrentAccessToken().then(
                      (data) => {
                        console.log('getCurrentAccessToken', data);
                        Actions.pop();
                        Actions.refresh();
                      },
                    );
                  }
                }
              }
              onLogoutFinished={() => {
                this.setState({ isLogged: false });
              }}
            />
          </View>
          {this.state.isLogged && <View style={styles.informationBlock}>
            <Text style={styles.informationText}>Are you sure you want to log out?</Text>
          </View>}
          {!this.state.isLogged && <View style={styles.informationBlock}>
            <Text style={styles.informationText}>Login to manage your Facebook pages</Text>
          </View>}
          <View style={styles.informationBlock}>
            <Text style={styles.informationText}>{'Made with <3 by KF'}</Text>
          </View>
        </View>
      </View>
    );
  }
}

Login.propTypes = {
  pageId: React.PropTypes.string,
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
