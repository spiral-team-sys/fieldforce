import { GetToken } from "../Core/Helper";
const URLTRAINING = 'https://trainee.spiral.com.vn/api'

const AutoLogin = async (data, actionResult) => {
    try {
        const token = await GetToken()
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnAccess/Login', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('Login', err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}

const GetConfig = async (token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                'Content-Type': 'application/json',
                'Authorization': token
            },
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/GetConfig', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err GetConfig', err)
        return { statusId: 404, messager: "Lỗi truy cập API GetConfig", data: [] };
    }
}

const SearchLesson = async (data, token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/SearchLesson', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err SearchLesson', err)
        return { statusId: 404, messager: "Lỗi truy cập API", data: [] };
    }
}

const PrepareBeforeExam = async (data, token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/PrepareBeforeExam', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err PrepareBeforeExam', err)
        return { statusId: 404, messager: "Lỗi truy cập API PrepareBeforeExam", data: [] };
    }
}

const GetDataExam = async (data, token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/GetDataExam', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err GetDataExam', err)
        return { statusId: 404, messager: "Lỗi truy cập API GetDataExam", data: [] };
    }
}

const SaveAnswer = async (data, token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/SaveExamLog', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err SaveAnswer', err)
        return { statusId: 404, messager: "Lỗi truy cập API SaveAnswer", data: [] };
    }
}

const SubmitExam = async (data, token, actionResult) => {
    try {
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                "Accept": "application/json",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        }
        const response = await fetch(URLTRAINING + '/TnForTrainee/SaveExam', requestInfo)
        const result = await response.json()
        actionResult && actionResult(result)
    } catch (err) {
        console.log('err SubmitExam', err)
        return { statusId: 404, messager: "Lỗi truy cập API SubmitExam", data: [] };
    }
}

export const TrainingAPI = { SearchLesson, GetDataExam, AutoLogin, GetConfig, PrepareBeforeExam, SaveAnswer, SubmitExam }

