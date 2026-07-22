
import React, { useEffect, useState } from "react";
import { TabView, SceneMap, TabBar } from 'react-native-tab-view'
import { useSelector } from "react-redux";
import { Text, View } from "react-native";
import { deviceWidth } from "../Core/Utility";
import { DeviceEventEmitter } from "react-native";

export const TabForm = ({ routes, initialPage, renderScene, positionTabBar = 'top', swipeEnabled = true }) => {
    const [index, setIndex] = useState(initialPage || 0)
    const { appcolor } = useSelector(state => state.GAppState);

    useEffect(() => {
        const _registry = DeviceEventEmitter.addListener('JUMP_TOTAB', (index) => {
            setIndex(index)
            console.log("DeviceEventEmitter")
        })
        return () => _registry.remove()
    }, [])

    const renderLabel = ({ route, focused }) => {
        return (
            <Text style={{ color: focused ? appcolor.white : appcolor.surface, margin: 8 }}>
                {route.title}
            </Text>
        )
    };
    const renderTabBar = props => (
        <TabBar
            {...props}
            renderLabel={renderLabel}
            indicatorStyle={{ backgroundColor: appcolor.white, height: 2 }}
            style={{ backgroundColor: appcolor.primary, maxHeight: 50 }}
        />
    );

    return (
        <TabView
            swipeEnabled={swipeEnabled}
            navigationState={{ index: index, routes: routes }}
            renderScene={renderScene}
            renderTabBar={renderTabBar}
            onIndexChange={() => null}
            initialLayout={{ width: deviceWidth }}
            tabBarPosition={positionTabBar}
        />
    );
}
