import React, { PureComponent } from "react";
import { View, Text, Image, ScrollView, TouchableHighlight, Dimensions } from "react-native";

export default class HeaderNavigation extends PureComponent {
  static defaultProps = {
    doAnimateZoomReset: false,
    maximumZoomScale: 2,
    minimumZoomScale: 1,
    zoomHeight: Dimensions.get('window').height,
    zoomWidth: Dimensions.get('window').width,
  }
  handleResetZoomScale = (event) => {
    this.scrollResponderRef.scrollResponderZoomTo({
      x: 0,
      y: 0,
      width: this.props.zoomWidth,
      height: this.props.zoomHeight,
      animated: true
    })
  }
  setZoomRef = node => { //the ScrollView has a scrollResponder which allows us to access more methods to control the ScrollView component
    if (node) {
      this.zoomRef = node
      this.scrollResponderRef = this.zoomRef.getScrollResponder()
    }
  }
  render() {
    return (
      <ScrollView
        contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }} //flexbox styles
        centerContent // centers content when zoom is less than scroll view bounds 
        maximumZoomScale={this.props.maximumZoomScale}
        minimumZoomScale={this.props.minimumZoomScale}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={this.setZoomRef} // helps us get a reference to this ScrollView instance
        style={{ overflow: 'hidden' }}>
        <TouchableHighlight onPress={this.handleResetZoomScale}>
          <Image></Image>
        </TouchableHighlight>
      </ScrollView>
    )
  }
}