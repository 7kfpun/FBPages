import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Actions, Router, Scene } from 'react-native-router-flux';

import Main from './app/main';
import Login from './app/login';
import Summary from './app/summary';
import Publish from './app/publish';
import PublishedPost from './app/published-post';
import UnpublishedPost from './app/unpublished-post';

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="main" title={'Main'} component={Main} hideNavBar={true} initial={true} />
    <Scene key="login" title={'Login'} component={Login} hideNavBar={true} direction="vertical" panHandlers={null} />
    <Scene key="summary" title={'Summary'} component={Summary} hideNavBar={true} />
    <Scene key="publish" title={'Publish'} component={Publish} hideNavBar={true} direction="vertical" />
    <Scene key="publishedPost" title={'Published Posts'} component={PublishedPost} hideNavBar={true} />
    <Scene key="unpublishedPost" title={'Scheduled Posts'} component={UnpublishedPost} hideNavBar={true} />
  </Scene>
);

const AppReview = function Photos() {
  return <Router scenes={scenes} />;
};

AppRegistry.registerComponent('AppReview', () => AppReview);
