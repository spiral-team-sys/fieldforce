import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Animated, Easing, TouchableOpacity, Dimensions, StyleSheet, SafeAreaView, Platform, StatusBar, } from 'react-native';
import { Icon, Avatar } from '@rneui/themed';
import { APPNAME, ICON_NOTIFY } from '../Core/URLs';
const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

class MessageForm extends PureComponent {
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
  }
  static defaultProps = {
    position: 'top',
    animation: 'slideX',
    messageHeight: 70,
    textStyle: {},
    messageStyle: {},
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
  showMessage(title, message, duration) {
    this.setState({ title, message })
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
        color = this.props.appcolor.info;
        break;
      case "success":
        color = this.props.appcolor.success;
        break;
      case "warning":
        color = this.props.appcolor.warning;
        break;
      case "error":
        color = this.props.appcolor.danger;
        break;
    }
    return color;
  }
  styles = StyleSheet.create({
    container: {
      top: Platform.OS === 'android' ? StatusBar.currentHeight + 30 : 30, zIndex: 100, elevation: 100,
      position: 'absolute',
      left: 0,
      backgroundColor: 'transparent',
      width: deviceWidth,
      paddingLeft: 4,
      paddingRight: 4,
      marginTop: 10
    },
    animatedView: {
      justifyContent: 'center',
      borderRadius: 15,
      padding: 5,
      height: 80,
      marginLeft: 10,
      marginRight: 10
    },
    titleStyle: {
      color: this.props?.appcolor?.white || 'white',
      fontSize: 14,
      fontWeight: 'bold',
      marginStart: 15
    },
    textStyle: {
      color: this.props?.appcolor.white || 'white',
      fontSize: 12,
      textAlign: 'left',
      marginStart: 12,
    }
  });
  gotoLink = (info) => {
    if (info?.hyperLinks === undefined || info?.hyperLinks === null) {
      this.props.navigation.navigate('Notification');
    }
    else if (info?.hyperLinks?.includes('http')) {
      this.props.navigation.navigate('WebView', { link: hyperLinks, titlePage: 'Trình duyệt' });
    }
    else {
      this.props.navigation.navigate(info?.hyperLinks);
    }
  }
  render() {
    const appcolor = this.props.appcolor;
    return (
      this.state.visible && (
        <SafeAreaView
          // pointerEvents = "none"
          style={[this.getPosition(), this.styles.container]}>
          <Animated.View style={[this.state.animationStyle,
          { ...this.styles.animatedView, backgroundColor: this.getColorByType(this.props.type) },
          this.props.messageStyle, { height: this.props.messageHeight }]}>
            <TouchableOpacity
              onPress={() => {
                this.hiddenMessage()
                this.props?.callBack()
              }}>
              <View style={{ width: '100%', }}>
                <View style={{ flexDirection: 'row', paddingLeft: 12, paddingRight: 12 }}>
                  <View>
                    <Avatar rounded
                      containerStyle={{ backgroundColor: appcolor.light }}
                      source={ICON_NOTIFY} size={34} />
                  </View>
                  <View style={{ flexGrow: 1, alignItems: 'flex-start' }}>
                    <Text style={{ ...this.styles.titleStyle, }}>{APPNAME}</Text>
                    <Text style={{ marginStart: 10, fontSize: 11, fontStyle: 'italic', color: appcolor.white }}>Ngay bây giờ</Text>
                  </View>
                </View>
              </View>
              <View style={{ marginStart: 5, top: 2 }}>
                <Text numberOfLines={1} style={[this.styles.titleStyle, this.props.textStyle]}>{this.state.title || ''}</Text>
                <Text numberOfLines={2} style={[this.styles.textStyle, this.props.textStyle]}>{this.state.message || ''}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Icon type='font-awaresome-5'
            size={14} name="close" color={this.props.appcolor.dark} raised
            containerStyle={{ position: 'absolute', top: -20, right: -0 }}
            onPress={() => this.hiddenMessage()} />
        </SafeAreaView>
      )
    );
  }
}
export default MessageForm;
