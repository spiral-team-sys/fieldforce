import { exeSql, Store } from "../Core/SqliteDbContext";
import { _competitorId } from "../Core/URLs";

export async function getCompetitors() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select competitorId as id,competitorName as name'
            + " FROM competitor AS m WHERE competitorId ="+_competitorId
            + " ORDER BY sortList"
          
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}

export async function getLstCompetitors() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select competitorId as id, competitorName as name FROM competitor'
        + '' + (_competitorId !== 0 ? ' WHERE competitorId != ' + _competitorId:'')
        + ' ORDER BY sortList';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}
export async function getLstCompetitorsMitsu() {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select competitorId as id, competitorName as name FROM competitor'
        + ' ORDER BY sortList';
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });
    return lst;
}