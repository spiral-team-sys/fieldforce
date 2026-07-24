import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { PSVManagerDashboard } from './PSVManagerDashboard';
import { PSVManagerDetail } from './PSVManagerDetail';
import { Icon } from '@rneui/themed';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Login from '../Login';
const Tab = createBottomTabNavigator();
const TabBarOptions = ({ state, descriptors, navigation }) => {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'center', backgroundColor: 'white', padding: 20, alignContent: 'center', alignSelf: 'center' }}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label =
                    options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;
                const isFocused = state.index === index;
                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };
                return (
                    <TouchableOpacity key={"tab" + index}
                        accessibilityRole="button"
                        accessibilityStates={isFocused ? ['selected'] : []}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={{ flex: 1, justifyContent: 'center', alignSelf: 'stretch' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <SpiralIcon style={{ padding: 7, textAlign: 'center' }}
                                color={isFocused ? '#268bd2' : '#cccccc'}
                                type="font-awesome-5" size={25} name={options.icon}></SpiralIcon>
                            <Text style={{ justifyContent: 'center', alignSelf: 'center', color: isFocused ? '#268bd2' : '#cccccc' }}>
                                {label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
export default class PSVManagerHome extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            userinfo: {}
        }
    }
    render() {
        return (
            <Tab.Navigator sceneContainerStyle={{ backgroundColor: 'white' }}
                tabBar={props => <TabBarOptions {...props} />}>
                <Tab.Screen name="Dashboard" options={{ "icon": "chart-bar" }} component={PSVManagerDashboard} />
                <Tab.Screen name="Details" options={{ "icon": "solar-panel" }} component={PSVManagerDetail} />
            </Tab.Navigator>

        );
    };
}