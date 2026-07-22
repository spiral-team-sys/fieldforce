import React, { useEffect, useRef } from "react";
import { Animated, Easing, Text, View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const ScrollHintArrow = () => {
    const { appcolor } = useSelector(state => state.GAppState);
    const fadeAnim = useRef(new Animated.Value(0.2)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0.2,
                    duration: 900,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const styles = StyleSheet.create({
        container: { alignSelf: "center", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 10, },
        text: { color: appcolor.greylight, fontSize: 14, },
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Text style={styles.text}>⬇️ Vuốt lên để xem thêm</Text>
        </Animated.View>
    );
};



export default ScrollHintArrow;
