import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from "react-native";
import { EXAM_API, getListExam, uploadExam } from '../../Controller/ExamController';
import { ToastError, ToastSuccess, } from '../../Core/Helper';
import { CheckBox } from '@rneui/themed';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { QueryStringSql } from '../../Core/SqliteDbContext';
import { taskList } from '../../Core/Table';
import moment from 'moment';
import { removeDuplicate } from '../../Core/Utility';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet'
import CustomListView from '../../Control/Custom/CustomListView';
const FORMMODE = {
    NEW: "new",
    FAILD: "FAIL",
}
const ExamByEmployee = ({ navigation, route }) => {
    const appcolor = useSelector(state => state.GAppState.appcolor)
    const [isLocked, setLocked] = useState(false)
    const [refreshExam, setRefreshExam] = useState(false)
    const [rootData, setRoot] = useState([])
    const [dataExam, setDataExam] = useState([])
    const [formMode, setFormMode] = useState(FORMMODE.NEW);
    const [errorList, setErrorList] = useState(null)
    const menuItem = route.params?.menuitem;

    const LoadDataExam = async () => {
        await getListExam(async (message, dataExam) => {
            message.length > 0 ? ToastError(message) : null
            await setDataExam(dataExam)
            await setRoot(dataExam)
            await setLocked(dataExam.some(it => it.locked == 1))
        });
    }

    const uploadDataExam = async () => {
        if (formMode == FORMMODE.FAILD) {
            await setDataExam(rootData)
            await setFormMode(FORMMODE.NEW)
        } else {
            await checkDataQuestion();
        }
    }

    const checkDataQuestion = async () => {
        const listQuest = await removeDuplicate([...dataExam], "questionId")
        const notSuccess = []
        listQuest.forEach(q => {
            const _check = dataExam.filter(it => it.questionId == q.questionId && it.answer == true)
            if (_check.length == 0)
                notSuccess.push(q);
        })
        if (notSuccess.length > 0) {
            await setErrorList(notSuccess)
            await SheetManager.show("sheetError")
            return
        }// KIEM TRA KET QUA
        const success = dataExam.filter(a => a.correct == true && (a.answer == null || a.answer == false))
        if (success.length > 0) {
            await setFormMode(FORMMODE.FAILD);
            const data = {
                Id: 0.0,
                EmployeeId: 0,
                AccountId: 0,
                ExamId: dataExam[0].examId,
                CreateDate: null,
                ExamDate: moment().format("YYYY-MM-DD"),
                QuickData: JSON.stringify(dataExam.map(a => ({ "answerId": a.answerId, "answer": a.answer, "questionId": a.questionId })))
            }
            const trans = await EXAM_API.uploadTrans(data)
            if (dataExam[0].examCount == 1) {
                await ToastError('Bài kiểm tra của bạn chưa đạt, vui lòng làm lại')
                return
            } else {// Chi cần làm ko tính đúng sai
                await QueryStringSql(`UPDATE ${taskList.tableName} SET taskDone=1,taskAlter='Đã hoàn thành' WHERE reportId=${menuItem.id}`)
                await ToastSuccess("Đã gửi bài kiểm tra")
                await navigation.pop();
            }
        } else {
            let dataUpload = await dataExam.map(i => ({ ExamId: i.examId, QuestionId: i.questionId, AnswerId: i.answerId, Answer: i?.answer ? 1 : 0 }))
            // Upload Server 
            await uploadExam(dataUpload, async (message) => {
                if (message.status == 200) {
                    await ToastSuccess(message.messeger)
                    //update TaskDone
                    await QueryStringSql(`UPDATE ${taskList.tableName} SET taskDone=1,taskAlter='Đã hoàn thành' WHERE reportId=${menuItem.id}`)
                    await navigation.pop();
                } else {
                    ToastError(message)
                }
            })
        }
    }
    const styles = StyleSheet.create({
        mainContainer: { width: '100%', height: '100%', backgroundColor: appcolor.surface },
        questionStyle: {
            color: appcolor.dark, marginLeft: 14, paddingTop: 12, paddingBottom: 7, fontSize: 12, fontWeight: '700', marginRight: 12,
        }
    })
    useEffect(() => {
        const _load = LoadDataExam()
        return () => _load
    }, [])

    const onPressItem = (item, index) => {
        setRefreshExam(true)
        var list = [...dataExam]
        list[index] = { ...item, "answer": !item?.answer }
        setDataExam(list)
        setRefreshExam(false)
    }

    const renderItem = ({ item, index }) => {
        return (
            <View key={`maxl${index}`}>
                {item.indexGroup == 1 &&
                    <Text style={styles.questionStyle}>{item.questionName}</Text>
                }
                <View key={"o02kkj-" + index} style={{
                    padding: 0,
                    backgroundColor: appcolor.light, marginLeft: 7, marginRight: 7
                }}>
                    <CheckBox
                        textStyle={{ fontWeight: 'normal', color: formMode == FORMMODE.FAILD && item.correct == true ? appcolor.white : appcolor.dark, fontSize: 12, padding: 5 }}
                        containerStyle={{ borderWidth: 0, backgroundColor: formMode == FORMMODE.FAILD && item.correct == true ? appcolor.primary : appcolor.transparent, }}
                        title={item.answerName}
                        checked={item?.answer || false}
                        disabled={item.locked == 1 || refreshExam}
                        onPress={() => onPressItem(item, index)}
                    />
                </View>
            </View>
        )
    }
    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={menuItem?.menuNameVN || "Trắc nghiệm nhanh"}
                iconRight={isLocked ? null : (formMode == FORMMODE.FAILD ? 'sync' : 'cloud-upload-alt')}
                leftFunc={() => navigation.goBack()}
                rightFunc={uploadDataExam}
            />
            <CustomListView
                data={dataExam}
                renderItem={renderItem}
                endView={<View>
                    <Text style={{ color: appcolor.grey, fontSize: 10, padding: 12, textAlign: 'center' }}>Đã xem hết</Text>
                </View>}
            />
            <ActionSheet headerAlwaysVisible id='sheetError'>
                <View style={{ height: '100%', width: '100%' }}>
                    <Text style={[styles.questionStyle, { color: appcolor.danger, textAlign: 'center' }]}>Bạn chưa trả lời hết các câu hỏi</Text>
                    <CustomListView
                        data={errorList}
                        renderItem={renderItem}
                        endView={<View>
                            <Text style={{ color: appcolor.grey, fontSize: 10, padding: 12, textAlign: 'center' }}>Đã xem hết</Text>
                        </View>}
                    />
                </View>
            </ActionSheet>
        </View>
    )
}

export default ExamByEmployee;
