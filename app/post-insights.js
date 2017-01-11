import React, { Component } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
  navigatorBar: {
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#E0E0E0',
  },
  navigatorRightButton: {
    paddingTop: 10,
    paddingLeft: 50,
    paddingRight: 10,
  },
  infoBlock: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth * 2,
    borderBottomColor: '#E0E0E0',
  },
  titleText: {
    fontSize: 15,
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '300',
  },
  list: {
    marginBottom: 20,
  },
});

export default class PostInsights extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refreshing: false,
      postImpressionsOrganic: 0,
      postImpressionsPaid: 0,
      postImpressions: 0,
    };
  }

  componentDidMount() {
    this.onRefresh();
  }

  onRefresh() {
    this.setState({ refreshing: true });
    Facebook.insights(this.props.postId, '/post_impressions_by_paid_non_paid_unique/lifetime', this.props.pageAccessToken, (error, result) => this.responseInfoCallback(error, result));
  }

  responseInfoCallback(error, result) {
    if (error) {
      console.log('Error fetching feed:', error);
    } else {
      console.log('Success fetching insights:', result);
      if (result.data && result.data.length && result.data[0].values.length) {
        this.setState({
          postImpressionsOrganic: result.data[0].values[0].value.unpaid,
          postImpressionsPaid: result.data[0].values[0].value.paid,
          postImpressions: result.data[0].values[0].value.total,
        });
      }
    }

    this.setState({
      refreshing: false,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <NavigationBar
          title={{ title: this.props.title }}
          style={styles.navigatorBar}
          leftButton={{
            title: 'Back',
            handler: Actions.pop,
          }}
        />

        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={() => this.onRefresh()}
            />
          }
        >
          <List containerStyle={styles.list}>
            <View style={styles.infoBlock}>
              <Text style={styles.titleText}>Reach</Text>
              <Text style={styles.text}>The number of people who viewed your post.</Text>
            </View>
            <ListItem
              title={`Organic ${this.state.postImpressionsOrganic}`}
              rightIcon={{ name: 'remove-red-eye' }}
            />
            <ListItem
              title={`Paid ${this.state.postImpressionsPaid}`}
              rightIcon={{ name: 'remove-red-eye' }}
            />
            <ListItem
              title={`Total ${this.state.postImpressions}`}
              rightIcon={{ name: 'remove-red-eye' }}
            />
          </List>
        </ScrollView>
      </View>
    );
  }
}

PostInsights.propTypes = {
  title: React.PropTypes.string,
  postId: React.PropTypes.string,
  pageAccessToken: React.PropTypes.string,
};
