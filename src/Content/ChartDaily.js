import React, { PureComponent } from "react";
import { View, processColor, Platform, Dimensions, Text } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import { GetDataChartDaily } from "../Controller/ChartDataController";
import * as Progress from 'react-native-progress';
import moment from 'moment';

export default class ChartDaily extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            Percent: '0%',
            legend: {
                enabled: true,
                textSize: 12,
                color: '#1557c1',
                form: 'CIRCLE',
                horizontalAlignment: "CENTER",//CENTER,LEFT,RIGHT
                verticalAlignment: "TOP",//Canh lable 
                wordWrapEnabled: true,
                isProgress: false,
                description: null
            },
            data: {},
            highlights: [{ x: 1 }],
            description: {
                backgroundColor: 'red',
                text: "",
                textSize: 12,
                textColor: processColor('black'),
                positionX: Platform.OS == 'ios' ? Dimensions.get('screen').width / 2 + 70 : Dimensions.get('screen').width * 1.3,
                positionY: Platform.OS == 'ios' ? 160 : Dimensions.get('screen').height * 0.5
            },

        }
    }
    async ChartSetup(category) {
        this.setState({ isProgress: true })
        await GetDataChartDaily(category !== undefined ? category : '',
            (dataChart) => {
                this.setState({
                    Percent: (dataChart.percent !== null && dataChart.percent !== undefined) ? dataChart.percent + '%' : '0%',
                    data: {
                        dataSets: [{
                            values: [{ value: dataChart.actual, label: 'Actual' }, { value: dataChart.target, label: 'Target' }],
                            label: '',
                            config: {
                                colors: [processColor('yellow'), processColor('green')],
                                valueTextSize: 14,
                                valueTextColor: processColor('red'),
                                sliceSpace: 1,
                                selectionShift: 12,
                                valueFormatter: "#,###",
                                valueLineColor: processColor('#020202'),
                                valueLinePart1Length: 0
                            }
                        }],
                    }
                });
            }
        )

        this.setState({ isProgress: false })

    }
    handleSelect(event) {
        let entry = event.nativeEvent
        if (entry == null) {
            this.setState({ ...this.state, selectedEntry: null })
        } else {
            this.setState({ ...this.state, selectedEntry: JSON.stringify(entry) })
        }
        //console.log(event.nativeEvent)
    }
    async componentDidMount() {
        await this.ChartSetup();
    }

    render() {
        return (
            <View style={{ backgroundColor: this.props.appcolor.light, width: '100%', height: '80%' }}>
                <PieChart
                    style={{ backgroundColor: this.props.appcolor.light, minHeight: '80%' }}
                    logEnabled={true}
                    animation={{ durationX: 1000 }}
                    chartDescription={this.state.description}
                    data={this.state.data}
                    legend={this.state.legend}
                    highlights={this.state.highlights}
                    entryLabelColor={processColor('black')}
                    entryLabelTextSize={14}
                    drawEntryLabels={false}
                    rotationEnabled={this.props.Refesh}
                    rotationAngle={180}
                    usePercentValues={false}
                    styledCenterText={{ text: this.state.Percent, color: processColor('#d1380a'), size: 16 }}
                    centerTextRadiusPercent={100}
                    holeRadius={90}
                    holeColor={processColor(this.props.appcolor.darklight)}
                    transparentCircleRadius={10}
                    transparentCircleColor={processColor(this.props.appcolor.chart)}
                    onSelect={this.handleSelect.bind(this)}
                    maxAngle={190}
                />
                <Text style={{ position: 'absolute', top: 25, width: '100%', textAlign: 'center', fontSize: 10, fontStyle: 'italic' }}>{"Số bán ngày: " + moment(new Date()).format('YYYY-MM-DD')}</Text>
                {this.state.isProgress && <Progress.CircleSnail color={['red', 'orange', 'green', 'blue']}
                    thickness={8} style={{ padding: 40, position: 'absolute', alignSelf: 'center', alignContent: 'stretch' }}
                    size={80} />
                }
            </View>
        )
    }
}