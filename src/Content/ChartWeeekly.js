import React, { Component } from 'react';
import { View, processColor } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import { GetDataChartWeekly } from '../Controller/ChartDataController';
import * as Progress from 'react-native-progress';
import { appcolor } from '../Themes/AppColor';

export default class ChartWeekly extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isProgress: false,
      legend: {
        enabled: true,
        textSize: 10,
        form: 'SQUARE',
        formSize: 10,
        xEntrySpace: true,
        yEntrySpace: 5,
        wordWrapEnabled: true,
      },
      data: {},
      xAxis: {},
    };
  }
  async ChartSetup(category) {
    this.setState({ data: {} });
    let dataActual = [],
      dataTarget = [],
      ColumName = [];
    this.setState({ isProgress: true });
    await GetDataChartWeekly(
      category !== undefined ? category : '',
      (mActual, mTarget, dataColumn) => {
        (ColumName = dataColumn),
          (dataActual = mActual),
          (dataTarget = mTarget);
        this.setState({
          data: {
            dataSets: [
              {
                values: dataActual,
                label: 'Actual',
                config: {
                  color: processColor(appcolor.yellow),
                },
              },
              {
                values: dataTarget,
                label: 'Target',
                config: {
                  color: processColor('green'),
                },
              },
            ],
            config: {
              barWidth: 0.35,
              group: {
                fromX: 0,
                groupSpace: 0.1,
                barSpace: 0.1,
              },
            },
          },
          xAxis: {
            valueFormatter: ColumName,
            granularityEnabled: true,
            granularity: 1,
            position: 'BOTTOM',
            textSize: 8,
            axisMinimum: 0,
            centerAxisLabels: true,
            yOffset: 5,
          },
          size: 0,
        });
      },
    );

    // if (ColumName !== null && ColumName.length > 0) {

    // }
    this.setState({ isProgress: false });
  }
  handleSelect(event) {
    let entry = event.nativeEvent;
    if (entry == null) {
      this.setState({ ...this.state, selectedEntry: null });
    } else {
      this.setState({ ...this.state, selectedEntry: JSON.stringify(entry) });
    }
    //console.log(event.nativeEvent)
  }
  async componentDidMount() {
    await this.ChartSetup();
  }
  render() {
    return (
      <View
        style={{ backgroundColor: this.props.appcolor.light, height: '80%' }}
      >
        <BarChart
          style={{
            backgroundColor: this.props.appcolor.light,
            minHeight: '80%',
          }}
          data={this.state.data}
          xAxis={this.state.xAxis}
          animation={{ durationY: 1000 }}
          legend={this.state.legend}
          chartBackgroundColor={processColor(this.props.appcolor.darklight)}
          gridBackgroundColor={processColor(this.props.appcolor.darklight)}
          visibleRange={{ x: { min: 5, max: 5 } }}
          drawBarShadow={false}
          drawValueAboveBar={true}
          chartDescription={{ text: '' }}
        />
        {this.state.isProgress && (
          <Progress.CircleSnail
            color={['red', 'orange', 'green', 'blue']}
            thickness={8}
            style={{
              padding: 40,
              position: 'absolute',
              alignSelf: 'center',
              alignContent: 'stretch',
            }}
            size={80}
          />
        )}
      </View>
    );
  }
}
