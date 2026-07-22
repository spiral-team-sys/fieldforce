import React, { useEffect, useRef } from "react"
import { Animated, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

const PaginationDot = ({ active, activeColor, inactiveColor }) => {
    const progress = useRef(new Animated.Value(active ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: active ? 1 : 0,
            duration: 220,
            useNativeDriver: false
        }).start();
    }, [active, progress]);

    const styles = StyleSheet.create({
        dot: { height: 8, borderRadius: 6, marginHorizontal: 3 }
    });

    return (
        <Animated.View
            style={[
                styles.dot,
                {
                    width: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 16] }),
                    backgroundColor: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [inactiveColor, activeColor]
                    })
                }
            ]}
        />
    );
};

const Pagination = ({ data = [], index, colorDot = null }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const styles = StyleSheet.create({
        container: { position: 'absolute', bottom: 0, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }
    });
    return (
        <View style={styles.container}>
            {(data || []).map((_, idx) => (
                <PaginationDot
                    key={idx.toString()}
                    active={idx === index}
                    activeColor={colorDot || appcolor.blacklight}
                    inactiveColor={appcolor.grayLight}
                />
            ))}
        </View>
    )
}
export default Pagination;
