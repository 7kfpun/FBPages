import React from 'react';
import {
  AppRegistry,
} from 'react-native';

import { Actions, Router, Scene } from 'react-native-router-flux';

import Main from './app/main';
import Login from './app/login';
import Summary from './app/summary';
import Publish from './app/publish';
import PublishedPosts from './app/published-posts';
import UnpublishedPosts from './app/unpublished-posts';
import PostInsights from './app/post-insights';

console.ignoredYellowBox = [
  'Possible Unhandled Promise Rejection',
  'Warning: setState(...): Can only update a mounted or mounting component.',
];

const scenes = Actions.create(
  <Scene key="root">
    <Scene key="main" title={'Pages⚑⚑'} component={Main} hideNavBar={true} initial={true} />
    <Scene key="login" title={'Login'} component={Login} hideNavBar={true} direction="vertical" panHandlers={null} />
    <Scene key="summary" title={'Summary'} component={Summary} hideNavBar={true} />
    <Scene key="publish" title={'Publish'} component={Publish} hideNavBar={true} direction="vertical" />
    <Scene key="publishedPosts" title={'Published Posts'} component={PublishedPosts} hideNavBar={true} />
    <Scene key="unpublishedPosts" title={'Unpublished / Scheduled Posts'} component={UnpublishedPosts} hideNavBar={true} />
    <Scene key="postInsights" title={'Post Insights'} component={PostInsights} hideNavBar={true} />
  </Scene>,
);

const AppReview = function Photos() {
  return <Router scenes={scenes} />;
};

AppRegistry.registerComponent('AppReview', () => AppReview);
