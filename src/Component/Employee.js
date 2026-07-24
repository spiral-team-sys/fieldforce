import React, { Component } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ChangePass from '../Content/ChangePass';
import Profile from '../Content/Profile';
const Tab = createBottomTabNavigator();
class Employee extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Profile"
          options={{ tabBarLabel: 'Thông tin nhân viên' }}
          component={Profile}
        />
        <Tab.Screen
          name="ChangePass"
          options={{ tabBarLabel: 'Đổi mật khẩu' }}
          component={ChangePass}
        />
      </Tab.Navigator>
    );
  }
}
export default Employee;
