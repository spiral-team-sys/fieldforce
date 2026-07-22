import { InsertItems, exeSql, Store, UpdateItem } from "../Core/SqliteDbContext"

export async function getLstResShelfPG(workinfo) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * '
            + ' FROM ShelfPGResult'
            + ' Where workId=' + workinfo.workId;
        const { res, err } = await exeSql(db, sql);
        lst = res;
    });

    return lst;
}
export async function getItemShelfPg(id, workId) {
    let lst = [];
    await Store().then(async db => {
        const sql = 'Select * FROM ShelfPGResult'
            + " WHERE idItem=" + id
            + ' AND workId=' + workId
        const { res, err } = await exeSql(db, sql);
        lst = res;
    })

    return lst
}
export async function insertItemShelfPG(item, workId, type) {
    await getItemShelfPg(item.idItem, workId).then(async (itemsHave) => {
        await Store().then(async db => {
            if (itemsHave && itemsHave.length > 0) {
                let itemUpdate = type === 'SHELF' ? { shelfvalue: item.shelfvalue } : { pgvalue: item.pgvalue }
                await UpdateItem(db, 'ShelfPGResult', itemUpdate , { idItem: item.idItem, workId: item.workId });
            }
            else {
                await InsertItems(db, 'ShelfPGResult', [item]);
            }
        });

    })
}