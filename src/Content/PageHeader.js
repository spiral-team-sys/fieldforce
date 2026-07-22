import React, { PureComponent } from 'react';
import { Text, Platform, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { Header } from '@rneui/themed';
import PropTypes from 'prop-types';
import { CONTENT_COLOR, DEFAULT_COLOR } from '../Core/URLs';
import Icon from 'react-native-vector-icons/FontAwesome5';

const styles = StyleSheet.create({
  headerAndroid: {
    backgroundColor: 'transparent'
  },
  headerIos: {
    height: 55,
    backgroundColor: DEFAULT_COLOR
  },
  headerContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    bottom: Platform.OS === 'ios' ? 10 : 0
  }
});

export default class PageHeader extends PureComponent {
    constructor(props) {
        super(props);
    }
    render() {
        const headerstyle = Platform.OS == 'android' ? styles.headerAndroid : styles.headerIos;
        return (
            <SafeAreaView style={{ backgroundColor: DEFAULT_COLOR }}>
                <Header
                    color={this.props.leftcolor}
                    containerStyle={{ ...headerstyle, alignSelf: 'center' }}
                    leftContainerStyle={styles.headerContainer}
                    leftComponent={
                        <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                            onPress={this.props.leftclick}>
                            <Icon
                                size={26} color={CONTENT_COLOR}
                                name={this.props.lefticon}
                                onPress={this.props.leftclick}
                            />
                        </TouchableOpacity>
                    }
                    rightContainerStyle={styles.headerContainer}
                    rightComponent={
                        !!this.props.righticon &&
                        <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
                            onPress={this.props.rightclick}>
                            <Icon
                                size={26} name={this.props.righticon}
                                color={CONTENT_COLOR}
                                onPress={this.props.rightclick} />
                        </TouchableOpacity>
                    }
                    centerContainerStyle={styles.headerContainer}
                    centerComponent={<Text style={{ color: CONTENT_COLOR, fontWeight: '500', fontSize: 15 }}>{this.props.Title}</Text>}
                />
            </SafeAreaView>
        );
    }
}
PageHeader.propTypes = {
    Title: PropTypes.string,
    lefticon: PropTypes.string,
    righticon: PropTypes.string,
    leftclick: PropTypes.func,
    rightclick: PropTypes.func,
}
PageHeader.defaultProps = {
    Title: '',
    lefticon: 'chevron-left',
    leftcolor: 'black',
    rightcolor: 'black',
    righticon: '',
    leftclick: () => { },
    rightclick: () => { },
}