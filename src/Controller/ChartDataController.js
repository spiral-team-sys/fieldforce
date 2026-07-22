import { Token } from "../Core/Helper";
import { URL_SELLOUTMONTHLY } from "../Core/URLs";
import Moment from "moment";

export async function GetDataChartMonthly(category, handlerDataChart) {
    // alert(category)
    let dataActual = [], dataTarget = [], ColumName = [];
    try {
        let token = await Token();
        await fetch(URL_SELLOUTMONTHLY,
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                    "DashboardType": "MONTH",
                    "categoryId": (category !== null && category !== undefined) ? category : '',
                    "Year": Moment(new Date()).year(),
                    "ToMonth": Moment(new Date()).month(),
                },
            }).then((response) => {
                return response.json()
            }).then((responseJson) => {
                if (responseJson != undefined && Array.isArray(responseJson) && responseJson.length > 0) {
                    responseJson.forEach(item => {
                        dataActual.push(item.actual);
                        dataTarget.push(item.target);
                        ColumName.push(item.colLable);
                    });
                }
                handlerDataChart(dataActual, dataTarget, ColumName);
            });
    } catch (err) {
        //console.log(err)
    }
}
export async function GetDataChartDaily(category, handlerDataChart) {
    // (category !== null) && alert(category)
    let ChartValue = [], ColumName = '';
    try {
        let token = await Token();
        await fetch(URL_SELLOUTMONTHLY,
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                    "DashboardType": "DAILY",
                    "categoryId": (category !== null) ? category : '',
                    "Year": Moment(new Date()).year(),
                    "ToMonth": Moment(new Date()).month(),
                },
            }).then((response) => {
                return response.json()
            }).then((responseJson) => {
                if (responseJson != undefined && Array.isArray(responseJson) && responseJson.length > 0) {
                    handlerDataChart(responseJson[0]);
                } else {
                    handlerDataChart([]);
                }
            });
    } catch (err) {
        //console.log(err)
    }
}
export async function GetDataChartWeekly(category, handlerDataChart) {
    // alert(category)
    let dataActual = [], dataTarget = [], ColumName = [];
    try {
        let token = await Token();
        await fetch(URL_SELLOUTMONTHLY,
            {
                method: 'GET',
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token,
                    "DashboardType": "WEEK",
                    "categoryId": (category !== null) ? category : '',
                    "Year": Moment(new Date()).year(),
                    "ToMonth": Moment(new Date()).month(),
                },
            }).then((response) => {
                return response.json()
            }).then((responseJson) => {
                if (responseJson != undefined && Array.isArray(responseJson) && responseJson.length > 0) {
                    responseJson.forEach(item => {
                        dataActual.push(item.actual);
                        dataTarget.push(item.target);
                        ColumName.push(item.colLable);
                    });
                }
                handlerDataChart(dataActual, dataTarget, ColumName);
            });
    } catch (err) {
        //console.log(err)
    }
}