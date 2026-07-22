import React, { Component } from "react";
import { View, processColor, Text } from 'react-native';
import { BarChart } from 'react-native-charts-wrapper';
import * as Progress from 'react-native-progress';
import { GetDataChartMonthly } from "../Controller/ChartDataController";
import { appcolor } from '../Themes/AppColor';

export default class ChartMonthly extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isProgress: false,
            legend: {
                enabled: true,
                textSize: 10,
                form: 'SQUARE',
                formSize: 10,
                // xEntrySpace: true,
                yEntrySpace: 5,
                wordWrapEnabled: true
            },
            data: {},
            xAxis: {},
            size: 80
        }
    }
    ChartSetup = async (category) => {
        this.setState({ data: {} })
        this.setState({ isProgress: true })
        let dataActual = [], dataTarget = [], ColumName = [];
        await GetDataChartMonthly(category !== undefined ? category : '', (mActual, mTarget, dataColumn) => {
            ColumName = dataColumn, dataActual = mActual, dataTarget = mTarget
            this.setState({
                data: {
                    dataSets: [
                        {
                            values: dataActual,
                            label: 'Actual',
                            config: {
                                color: processColor(appcolor.yellow)
                            }
                        },
                        {
                            values: dataTarget,
                            label: 'Target',
                            config: {
                                color: processColor('green')
                            }
                        }
                    ],
                    config: {
                        barWidth: 0.35,
                        group: {
                            fromX: 0,
                            groupSpace: 0.1,
                            barSpace: 0.1,
                        }
                    }
                },
                xAxis: {
                    valueFormatter: ColumName,
                    granularityEnabled: true,
                    granularity: 1,
                    position: 'BOTTOM',
                    textSize: 8,
                    axisMinimum: 0,
                    // labelRotationAngle: 90,
                    centerAxisLabels: true,
                    yOffset: 5
                },
                size: 0
            });
        });
        // if (ColumName !== null && ColumName.length > 0) {

        // }
        this.setState({ size: 0 })

        this.setState({ isProgress: false })
    }
    async componentDidMount() {
        await this.ChartSetup();
    }
    render() {
        return (
            <View style={{ backgroundColor: this.props.appcolor.light, height: '80%' }}>
                <BarChart
                    style={{ backgroundColor: this.props.appcolor.light, minHeight: '80%' }}
                    data={this.state.data}
                    xAxis={this.state.xAxis}
                    yAxis={{
                        zeroLine: { enabled: true },
                        limitLines: [{ limit: 1 }],
                    }}
                    animation={{ durationY: 1000 }}
                    legend={this.state.legend}
                    chartBackgroundColor={processColor(this.props.appcolor.darklight)}
                    gridBackgroundColor={processColor(this.props.appcolor.darklight)}
                    visibleRange={{ x: { min: 5, max: 5 } }}
                    drawBarShadow={false}
                    drawValueAboveBar={true}
                    chartDescription={{ text: '' }}
                />
                {this.state.isProgress && <Progress.CircleSnail color={['red', 'orange', 'green', 'blue']}
                    thickness={8} style={{ padding: 40, position: 'absolute', alignSelf: 'center', alignContent: 'stretch' }}
                    size={80} />
                }
            </View>
        )
    }
}