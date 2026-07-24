import React, { PureComponent } from 'react';
import { View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { connect } from 'react-redux';
import { AppCreateAction } from '../../Core/ReduxController';
import { bindActionCreators } from '@reduxjs/toolkit';

class ActionFilter extends PureComponent {
  constructor(props) {
    super(props);
  }

  handleChange = dateString => {
    this.props.handlerSelectDate(dateString);
  };

  render() {
    return (
      <View
        View
        style={{ margin: 8, backgroundColor: this.props.appcolor.light }}
      >
        <Calendar
          firstDay={1}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: this.props.appcolor.light,
            calendarBackground: this.props.appcolor.light,
            textSectionTitleColor: this.props.appcolor.dark,
            textSectionTitleDisabledColor: this.props.appcolor.greydark,
            selectedDayBackgroundColor: this.props.appcolor.dark,
            selectedDayTextColor: this.props.appcolor.dark,
            todayTextColor: this.props.appcolor.primary,
            dayTextColor: this.props.appcolor.dark,
            textDisabledColor: this.props.appcolor.greydark,
            selectedDotColor: this.props.appcolor.light,
            disabledArrowColor: '#d9e1e8',
            monthTextColor: this.props.appcolor.dark,
            indicatorColor: 'blue',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 15,
            textMonthFontSize: 15,
            textDayHeaderFontSize: 13,
          }}
          markingType={this.props.mState.markingType}
          markedDates={this.props.mState.markedDates}
          //Event
          onDayPress={date => {
            this.handleChange(date.dateString);
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = state => {
  return {
    GAppState: state.GAppState,
    appcolor: state.GAppState.appcolor,
  };
};
const mapDispathToProps = dispatch => {
  return {
    GAppController: bindActionCreators(AppCreateAction, dispatch),
  };
};
export default connect(mapStateToProps, mapDispathToProps)(ActionFilter);
