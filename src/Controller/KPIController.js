import { GetToken } from "../Core/Helper";
import { Store, exeSql } from "../Core/SqliteDbContext";
import { URLDEFAULT } from "../Core/URLs";

export async function getKPIList() {
    let lstKPI = []
    await Store().then(async db => {
        const sql = "select m.kpiId,m.function,m.listCode,m.name,m.isLock,m.orderBy,m.refId,m.refName"
        " FROM mobileKPIList as m"
        " WHERE m.listCode='KPI'"
        " ORDER BY m.orderBy"
        const { res, err } = await exeSql(db, sql);
        lstKPI = res;
    })
    return lstKPI;
}

export const GetDataKPISummary = async (month, year) => {
    try {
        const token = await GetToken();
        const requestInfo = {
            method: 'GET',
            headers: {
                'Authorization': token,
                "month": month,
                "year": year
            },
        }
        const response = await fetch(URLDEFAULT + 'kpi/kpisummary', requestInfo)
        const result = await response.json()
        return result;
    } catch (err) {
        console.log(err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}

