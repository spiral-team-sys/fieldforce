import React from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

const GradientBackground = () => {
    const { appcolor } = useSelector(state => state.GAppState)
    const colors = [appcolor.primary, appcolor.secondary]
    //
    return (
        <LinearGradient colors={colors} style={{ ...StyleSheet.absoluteFillObject }} />
    );
};

export default GradientBackground;
