import { SelectItems, SelectItemsClause, Store, _createTable, _saveOrUpdate, UpdateItem, InsertItems } from './../Core/SqliteDbContext';

class AttendantContext {
    async GetAttendantByType(shopId, workDate, photoType) {
        let lst = [];
        await Store().then(async db => {
            const { res, err } = await SelectItems(db, 'Photos', "*", { "shopId": shopId, "photoDate": workDate, "photoType": photoType });
            lst = res;
        })
        return lst
    }
    async GetAttendantList(shopId, workDate) {
        let lst = [];
        await Store().then(async db => {
            const { res, err } = await SelectItemsClause(db, 'Photos', "*", { "shopId": shopId, "photoDate": workDate, "reportId": 1 }, "GROUP BY photoType");
            lst = res;
        });
        return lst;
    }

    async UpdateAttendantItem(photoTime, shopId, workDate, photoType) {
        await Store().then(async db => {
            await UpdateItem(db, 'Photos', { "dataUpload": 1, "fileUpload": 1, "photoTime": photoTime }, { "shopId": shopId, "photoDate": workDate, "photoType": photoType })
                .then(res => {
                    return 1
                });
        });
    }
    async InsertAttendantItem(photoInfo) {
        //console.log('insert' + JSON.stringify(photoInfo));
        await Store().then(async (db) => {
            await InsertItems(db, "Photos", [photoInfo])
                .then(res => {
                    return res;
                });
        })
    }
}
const contextAttendant = new AttendantContext();
export default contextAttendant;