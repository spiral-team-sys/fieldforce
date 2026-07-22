import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Animated, Easing, Dimensions, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Image } from '@rneui/themed';

import { APPNAME, ICON_NOTIFY } from '../Core/URLs';
let RNFS = require('react-native-fs');
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

export default class ToastCustom extends PureComponent {
  static propTypes = {
    position: PropTypes.oneOf([
      'top',
      'center',
      'bottom',
    ]),
    type: PropTypes.oneOf([
      'info',
      'success',
      'warning',
      'error',
    ]),
    animation: PropTypes.oneOf(['zoom', 'slideX', 'slideY']),
    messageHeight: PropTypes.number,
    callBack: PropTypes.func.isRequired
  }
  static defaultProps = {
    position: 'top',
    animation: 'slideX',
    messageHeight: 70,
    textStyle: {},
    messageStyle: {},
    callBack: () => { }
  }
  constructor(props) {
    super(props)
    this.slideXValue = new Animated.Value(- deviceWidth);
    this.slideYValue = new Animated.Value(0)
    this.zoomValue = new Animated.Value(0);
    this.state = {
      message: 'This is a message!',
      visible: false,
      animationStyle: {}
    }
  }
  startAnimation() {
    const { animation } = this.props;
    const animatedValue = animation == 'slideX' ? this.slideXValue : animation == 'slideY' ? this.slideYValue : this.zoomValue;
    const value = animation == 'slideX' ? (-deviceWidth) : 0;
    const toValue = animation == 'slideX' ? 0 : 1;
    const easing = animation == 'slideX' ? Easing.elastic(0.8) : Easing.bounce;
    animatedValue.setValue(value);
    Animated.timing(animatedValue, {
      toValue: toValue,
      duration: 700,
      easing: easing,
      useNativeDriver: false,
    }).start(this.closeMessage())
  }
  showMessage(title, message, duration, typeshow) {
    this.setState({ title, message, typeshow })
    this.duration = duration || 1500;
    const { animation } = this.props;
    animation == 'zoom' ? this.zoom() : animation == 'slideX' ? this.slideX() : this.slideY()
  }
  zoom = () => {
    this.setState({
      animationStyle: {
        opacity: this.zoomValue.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [{
          scale: this.zoomValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          })
        }]
      }, visible: true
    }, () => {
      this.startAnimation();
    });
  }
  slideX = () => {
    this.setState({
      animationStyle: {
        transform: [{ translateX: this.slideXValue }]
      }, visible: true
    }, () => {
      this.startAnimation();
    });
  }
  slideY = () => {
    this.setState({
      animationStyle: {
        transform: [{
          translateY: this.slideYValue.interpolate({
            inputRange: [0, 0.3, 1],
            outputRange: this.props.position == 'bottom' ? [70, -5, 0] : [-70, 5, 0]
          })
        }]
      }, visible: true
    }, () => {
      this.startAnimation();
    });
  }
  closeMessage() {
    const { animation } = this.props;
    this.timer = setTimeout(() => {
      Animated.timing(
        animation == 'zoom' ? this.zoomValue : animation == 'slideX' ? this.slideXValue : this.slideYValue,
        {
          toValue: animation == 'slideX' ? deviceWidth : 0,
          duration: 550,
          useNativeDriver: false,
        }).start(() => {
          this.setState({ visible: false })
        })
    }, this.duration)
  }
  hiddenMessage() {
    const { animation } = this.props;
    Animated.timing(
      animation == 'zoom' ? this.zoomValue : animation == 'slideX' ? this.slideXValue : this.slideYValue,
      { toValue: animation == 'slideX' ? deviceWidth : 0, duration: 550, useNativeDriver: false, })
      .start(() => this.setState({ visible: false }))
  }
  componentDidMount() {

  }
  getPosition() {
    let position;
    switch (this.props.position) {
      case "top":
        position = { top: 0 };
        break;
      case "center":
        position = { bottom: deviceHeight / 2 - this.props.messageHeight / 2 };
        break;
      case "bottom":
        position = { bottom: 0 };
        break;
    }
    return position;
  }
  getColorByType() {
    let color;
    switch (this.props.type) {
      case "info":
        color = '#44A1DA';
        break;
      case "success":
        color = '#73C040';
        break;
      case "warning":
        color = '#F1AE42';
        break;
      case "error":
        color = '#EB3928';
        break;
    }
    return color;
  }
  getColorCustom(type) {
    let color;
    switch (type) {
      case "info":
        color = '#44A1DA';
        break;
      case "success":
        color = '#73C040';
        break;
      case "warning":
        color = '#F1AE42';
        break;
      case "error":
        color = '#EB3928';
        break;
    }
    return color;
  }

  render() {
    return (
      this.state.visible && (
        <SafeAreaView
          // pointerEvents = "none"
          style={[this.getPosition(), styles.container]}>

          <Animated.View style={[this.state.animationStyle, { ...styles.animatedView, backgroundColor: this.state.typeshow !== undefined ? this.getColorCustom(this.state.typeshow) : this.getColorByType() }, this.props.messageStyle, { height: this.props.messageHeight }]}>
            <TouchableOpacity
              onPress={() => {
                this.hiddenMessage()
                this.props.callBack()
              }}
            >
              <View style={{ height: 20, flexDirection: 'row', justifyContent: 'center', paddingLeft: 15, paddingRight: 15 }}>
                <View style={{ width: '4%' }}><Image containerStyle={{ height: 20, width: 20, borderRadius: 5 }} source={ICON_NOTIFY} /></View>
                <Text style={{ ...styles.titleStyle, width: '46%', textAlign: 'left' }}>{APPNAME}</Text>
                <Text style={{ width: '50%', textAlign: 'right', fontSize: 13 }}>Bây giờ</Text>
              </View>

              <View style={{ height: 65, paddingRight: 5, top: 10 }}>
                <Text numberOfLines={1} style={[styles.titleStyle, this.props.textStyle]}>{this.state.title}</Text>
                <Text></Text>
                <Text numberOfLines={2} style={[styles.textStyle, this.props.textStyle]}>{this.state.message}</Text>
              </View>

            </TouchableOpacity>
          </Animated.View>

        </SafeAreaView>
      )
    );
  }
}
const styles = StyleSheet.create({
  container: {
    top: 10, zIndex: 100, elevation: 100,
    position: 'absolute',
    left: 0,
    backgroundColor: 'transparent',
    width: deviceWidth,
    paddingLeft: 4,
    paddingRight: 4,
  },
  animatedView: {
    backgroundColor: 'white',
    justifyContent: 'center',
    borderRadius: 15,
    padding: 5,
    height: 80,
    marginLeft: 10,
    marginRight: 10
  },
  titleStyle: {
    color: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'left',
    left: 15
  },
  textStyle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    paddingLeft: 15,
    paddingRight: 15,
    width: '100%',
    lineHeight: 15
  }
});