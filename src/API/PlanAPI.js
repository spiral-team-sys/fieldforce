import { GetToken } from "../Core/Helper"
import { URLDEFAULT } from "../Core/URLs";

const GetDataCalendar = async (typePlan, actionResult) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token,
                "TypePlan": typePlan
            }
        }
        const response = await fetch(`${URLDEFAULT}plan/calendar`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            actionResult(result.data, null)
        } else {
            actionResult([], result.messager)
        }

    } catch (error) {
        actionResult([], `Lỗi truy cập API: ${error}`)
    }
}
const GetDataRegisterOff = async (planDate, actionResult) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token,
                "PlanDate": planDate
            }
        }
        const response = await fetch(`${URLDEFAULT}plan/registeroff`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            actionResult(result.data, null)
        } else {
            actionResult([], result.messager)
        }

    } catch (error) {
        actionResult([], `Lỗi truy cập API: ${error}`)
    }
}
const GetDataByDate = async (planDate, actionResult) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": token,
                "PlanDate": planDate
            }
        }
        const response = await fetch(`${URLDEFAULT}plan/bydate`, requestInfo)
        const result = await response.json()
        if (result.statusId == 200) {
            actionResult(result.data, null)
        } else {
            actionResult([], result.messager)
        }

    } catch (error) {
        actionResult([], `Lỗi truy cập API: ${error}`)
    }
}
export const PLANAPI = { GetDataCalendar, GetDataRegisterOff, GetDataByDate }