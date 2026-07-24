import React, { PureComponent } from 'react';
import * as Progress from 'react-native-progress';
import PropTypes from 'prop-types';
import { View, Text } from 'react-native';
import { appcolor } from '../Themes/AppColor';
import { connect } from 'react-redux';
//import { AppCreateAction } from '../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';

class ProgressCircleSnail extends PureComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View
        style={{
          display: this.props.isShowing ? 'flex' : 'none',
          height: '70%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            marginBottom: 8,
            alignSelf: 'center',
            alignContent: 'stretch',
          }}
        >
          <Progress.CircleSnail
            color={[this.props.appcolor.black]}
            thickness={3}
          />
        </View>
        <Text>{this.props.Title}</Text>
      </View>
    );
  }
}
ProgressCircleSnail.propTypes = {
  Title: PropTypes.string,
  isShowing: PropTypes.bool,
};
ProgressCircleSnail.defaultProps = {
  Title: 'Vui lòng chờ',
  isShowing: false,
};
const mapStateToProps = state => {
  return {
    appcolor: state.GAppState.appcolor,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(ProgressCircleSnail);
