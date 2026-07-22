import { GetToken } from '../Core/Helper'
import { URLDEFAULT } from '../Core/URLs'
import { photos } from '../Core/TableLocal'
import { QueryStringSql } from '../Core/SqliteDbContext'
import moment from 'moment'
import { uploadAllDataPhoto } from '../Controller/PhotoController'

const getEvidentList = async (filterList, actionResult) => {
	try {
		const token = await GetToken()
		const requestInfo = {
			method: 'POST',
			headers: {
				'Authorization': token,
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(JSON.stringify(filterList))
		}
		const response = await fetch(URLDEFAULT + 'sellouts/getevidentv2', requestInfo)
		const result = await response.json()
		actionResult(result)
	} catch (e) {
		console.log(e);
	}
}
const checkPhotoEvident = async (actionResult) => {
	const sql = `SELECT * FROM ${photos.tableName} 
		WHERE (
			photoType like 'VAT_%' OR 
			photoType like 'BILL_%' OR 
			photoType like 'CRM_%' OR 
			photoType like 'FSM_%') 
		AND dataUpload <> 1
	`
	const { res, err } = await QueryStringSql(sql)
	actionResult(res)
}
const checkPhotoEvidentUpload = async (actionResult) => {
	const sql = `SELECT * FROM ${photos.tableName} 
		WHERE (
			photoType like 'VAT_%' OR 
			photoType like 'BILL_%' OR 
			photoType like 'CRM_%' OR 
			photoType like 'FSM_%') 
		AND (fileUpload=0 OR fileUpload IS NULL)
	`
	const { res, err } = await QueryStringSql(sql)
	actionResult(res)
}
const photoEvident = async (info, photoType, actionResult) => {
	const sql = `SELECT * FROM ${photos.tableName} WHERE shopId=${info.ShopId} AND photoDate=${info.WorkDate} AND photoType='${photoType}' AND (dataUpload=0 OR dataUpload is null)`
	const { res, err } = await QueryStringSql(sql)
	actionResult(res)
}
const getPhotoUpload = async (reportId) => {
	// const sql = `SELECT * FROM ${photos.tableName} WHERE reportId=${reportId} AND photoType like 'EVIDENT_%' AND (dataUpload=0 OR dataUpload is null)`
	const { res } = await QueryStringSql('sql')
	return res
}
const uploadSellOutEvident = async (reportId, actionResult) => {
	try {
		let itemsPhoto = []
		const dataUpload = await getPhotoUpload(reportId)
		if (dataUpload !== null && dataUpload.length > 0) {
			dataUpload.forEach(photoInfo => {
				let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
				let dataItem = {
					"shopId": photoInfo.shopId,
					"photoName": ImgName,
					"latitude": photoInfo.latitude,
					"longitude": photoInfo.longitude,
					"accuracy": photoInfo.accuracy,
					"reportId": photoInfo.reportId,
					"photoTime": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
					"photoType": photoInfo.photoType.toString(),
					"photoDate": photoInfo.photoDate,
					"photoPath": `/uploaded/${photoInfo.photoDate}/${ImgName}`
				}
				itemsPhoto.push(dataItem);
			});
			//
			const jsonData = {
				WorkDate: moment().format('YYYYMMDD'),
				Photos: JSON.stringify(itemsPhoto)
			}
			const token = await GetToken()
			const requestInfo = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
					'Authorization': token
				},
				body: JSON.stringify(jsonData)
			}
			const response = await fetch(URLDEFAULT + 'sellouts/uploadEvident', requestInfo)
			const result = await response.json()
			if (result.status == 200) {
				await QueryStringSql(`UPDATE ${photos.tableName} SET dataUpload=1 WHERE reportId=${reportId}`)
				await uploadAllDataPhoto(dataUpload);
			}
			actionResult(result.messeger)
		} else {
			actionResult('Đã gửi hết dữ liệu')
		}
	} catch (e) {
		console.log(e);
	}
}
const GetbyShop = async (shopId, soDate) => {
	try {
		const token = await GetToken()
		const requestInfo = {
			method: 'GET',
			headers: {
				'Authorization': token,
				"shopId": shopId,
				"soDate": soDate,
			},
		}
		const response = await fetch(URLDEFAULT + 'sellouts/byshop', requestInfo)
		const result = await response.json()
		console.log(shopId, soDate, "A")
		return result;
	} catch (e) {
		console.log(e)
		return { statusId: 404, messeger: "Lỗi kết nối api", }
	}
}
const PostSellOut = async (data) => {
	try {
		const token = await GetToken()
		const requestInfo = {
			method: 'POST',
			headers: {
				'Authorization': token,
				"Accept": "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data)
		}

		const response = await fetch(URLDEFAULT + 'sellouts/upload', requestInfo)
		const result = await response.json()

		return result;
	} catch (e) {
		console.log(e)
		return { status: 404, messeger: "Lỗi kết nối api", }
	}
}
const UploadDataEvident = async (dataUpload, actionResult) => {
	try {
		const token = await GetToken()
		const requestInfo = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'Authorization': token
			},
			body: JSON.stringify(JSON.stringify(dataUpload))
		}
		const response = await fetch(URLDEFAULT + 'sellouts/uploadEvidentV2', requestInfo)
		const result = await response.json()
		if (result.status == 200) {
			for (let index = 0; index < dataUpload.length; index++) {
				const item = dataUpload[index]
				const dataPhoto = JSON.parse(item.itemPhoto || '[]')
				for (let i = 0; i < dataPhoto.length; i++) {
					const itemP = dataPhoto[i]
					const sql = `UPDATE photos SET dataUpload=1
					WHERE shopId=${itemP.shopId} 
					AND photoDate=${itemP.photoDate} 
					AND photoType='${itemP.photoType}' 
					AND photoPath LIKE '%${itemP.photoName}%'
					AND reportId=${itemP.reportId}
					AND dataUpload<>1`
					await QueryStringSql(sql);
				}
			}
			await PostFile()
		}
		actionResult(result.messeger)
	} catch (e) {
		actionResult(`Lỗi: ${e}`)
	}
}

const PostFile = async () => {
	const { res } = await QueryStringSql("SELECT id,shopCode,shopId,photoDate,photoFullTime,photoPath FROM photos WHERE fileUpload=0 OR fileUpload IS NULL");
	await res?.forEach(async photoInfo => {
		await uploadAllDataPhoto([photoInfo], () => { console.log('fileSuccess') }, () => { console.log('fileError') });
	});
}
export const SelloutAPI = { PostSellOut, GetbyShop, getEvidentList, photoEvident, uploadSellOutEvident, checkPhotoEvident, UploadDataEvident, PostFile, checkPhotoEvidentUpload }