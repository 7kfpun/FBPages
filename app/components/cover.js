import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const styles = StyleSheet.create({
  container: {
    width: window.width,
    height: 180,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: 15,
  },
  profileImage: {
    width: 70,
    height: 70,
  },
  textBlock: {
    flex: 1,
    flexDirection: 'column',
    marginLeft: 10,
  },
  headlineText: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
    fontSize: 20,
    lineHeight: 24,
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 1,
    textShadowColor: 'black',
    marginBottom: 8,
  },
  text: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: 'white',
    textShadowOffset: {
      width: 1,
      height: 1,
    },
    textShadowRadius: 1,
    textShadowColor: 'black',
    marginBottom: 8,
  },
});

const Cover = (props) => {
  return (
    <Image
      style={styles.container}
      source={{ uri: props.pageCover || 'https://i2.cdn.turner.com/cnn/dam/assets/141202112409-profile-background-stock.jpg' }}
    >
      <View style={styles.body}>
        <View style={{ flexDirection: 'row' }}>
          <Image
            style={styles.profileImage}
            source={{ uri: props.pagePicture }}
          />
          <View style={styles.textBlock}>
            <Text style={styles.headlineText}>{props.pageName}</Text>
            <Text style={styles.text}>{props.pageCategory}</Text>
          </View>
        </View>
      </View>
    </Image>
  );
};

export default Cover;

Cover.propTypes = {
  pageName: React.PropTypes.string,
  pageCategory: React.PropTypes.string,
  pageCover: React.PropTypes.string,
  pagePicture: React.PropTypes.string,
};
