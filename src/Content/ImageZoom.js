import React, { PureComponent } from "react";
import { Dimensions, ScrollView, TouchableHighlight, Image, Platform, TouchableWithoutFeedback, ImageBackground } from 'react-native';

const defaultProps = {
    doAnimateZoomReset: false,
    maximumZoomScale: 2,
    minimumZoomScale: 1,
    zoomHeight: Dimensions.get('window').height,
    zoomWidth: Dimensions.get('window').width,
}
export default class ImageZoom extends PureComponent {
    constructor(props) {
        super(props);
    }
    handleResetZoomScale = (event) => {
        if (Platform.OS === 'ios') {
            this.scrollResponderRef.scrollResponderZoomTo({
                x: 0,
                y: 0,
                width: defaultProps.zoomWidth,
                height: defaultProps.zoomHeight,
                animated: true
            })
        }
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
                contentContainerStyle={{ height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}
                centerContent
                maximumZoomScale={defaultProps.maximumZoomScale}
                minimumZoomScale={defaultProps.minimumZoomScale}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                ref={this.setZoomRef}
                style={{ overflow: 'hidden' }}>
                <TouchableWithoutFeedback style={{ height: '100%', width: '100%' }} onPress={this.handleResetZoomScale}>
                    <ImageBackground resizeMode={this.props.resizeMode == null ? 'contain' : this.props.resizeMode} style={{ height: '100%', width: '100%' }}
                        source={{ uri: this.props.ImagePath }}></ImageBackground>
                </TouchableWithoutFeedback>
            </ScrollView>
        )
    }
}
