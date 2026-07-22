import React, { useCallback, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Icon from '@react-native-vector-icons/fontawesome6';
import { useSelector } from "react-redux";
import { updateDisplaySurvey } from "../../../Controller/DisplayController";
import RNFS from 'react-native-fs'
import { scaleSize } from "../../../Themes/AppsStyle";
import moment from "moment";
import { Calendar } from "react-native-calendars";
import ActionSheet from "react-native-actions-sheet";
import { deviceHeight, deviceWidth, minWidthTab } from "../../../Core/Utility";
import { MaterialTabBar, Tabs } from "react-native-collapsible-tab-view";
// import NumberFormat from "react-number-format";
import { Badge } from '@rneui/themed';
import { LoadingView } from "../../../Control/ItemLoading";

export const InputDisplaySurvey = ({ navigation, route, Status, data, listCheck, showProgress }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const tabRef = useRef()

    const keyExtractor = useCallback((it) => it.id.toString(), [])

    const ViewItem = () => {
        return (
            data.listTab.map(it => {
                let listDataByGroup = []
                listDataByGroup = data.listData.filter(item => item.groupId === it.groupId && item.kpi1 !== -1)
                const totalRow = listDataByGroup.length
                return (
                    <Tabs.Tab key={it.groupName + `(${totalRow})`} label={it.groupName + `(${totalRow})`} name={it.groupName + `(${totalRow})`}>
                        <View style={Styles.viewTabStyle}>
                            <FlatList
                                key={it.groupId}
                                windowSize={10}
                                initialNumToRender={10}
                                data={listDataByGroup}
                                keyExtractor={keyExtractor}
                                ListFooterComponent={<Text style={Styles.footerStyle} >Đã xem hết</Text>}
                                renderItem={({ item, index }) => <RenderItem item={item} index={index} data={data} appcolor={appcolor} listCheck={listCheck} Styles={Styles} />}
                            />
                        </View>
                    </Tabs.Tab>
                )
            })
        )
    }

    const Styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: appcolor.surface },
        progressStyle: { position: 'absolute', alignItems: 'center', alignSelf: "center", marginTop: deviceHeight / 3 },
        viewTabStyle: { flex: 1, backgroundColor: appcolor.surface, marginTop: 40, padding: 5, width: deviceWidth, display: !showProgress ? 'flex' : 'none' },
        viewRow: { flex: 1, flexDirection: "row", justifyContent: 'space-between', alignItems: "center", backgroundColor: appcolor.light, padding: 8, borderRadius: 5 },
        viewColumn: { flex: 1, backgroundColor: appcolor.light, padding: 8, borderRadius: 5 },
        viewTitle: { flexDirection: 'row', flex: 1 },
        titleItem: { color: appcolor.dark, fontSize: 14, fontWeight: '600', padding: 5 },
        titleButton: { paddingLeft: 5, color: appcolor.dark, paddingEnd: 10 },
        viewSheet: { height: deviceHeight / 2, marginTop: 10, marginBottom: 20, backgroundColor: appcolor.light, justifyContent: 'center', width: '100%', padding: 5 },
        buttonSheet: { padding: 5, alignItems: 'center', borderRadius: 10, borderBottomWidth: 1, borderColor: appcolor.greydark, borderWidth: 0.2, marginBottom: 5 },
        calendarTheme: { backgroundColor: appcolor.light, calendarBackground: appcolor.surface, todayTextColor: appcolor.highlightDate, selectedDayTextColor: appcolor.white, dayTextColor: appcolor.dark, monthTextColor: appcolor.dark },
        viewItemTab: { flex: 1, backgroundColor: appcolor.surface, padding: 5 },
        viewItemGroup: { flex: 1, padding: 6, borderRadius: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: appcolor.primary, marginBottom: 5 },
        viewTitleGroup: { fontSize: scaleSize(17), fontWeight: '700', color: appcolor.white, paddingLeft: 10 },
        viewFormEdit: { flex: 1, flexDirection: 'row' },
        buttonItemRow: { borderRadius: 5, padding: 5, marginEnd: 10, borderColor: appcolor.dark, flexDirection: 'row', alignItems: "center", justifyContent: 'center' },
        footerStyle: { height: deviceHeight / 2, textAlign: 'center', color: appcolor.dark },
    })

    return (
        <View style={Styles.container}>
            <KeyboardAvoidingView
                style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}
                behavior={Platform.OS == "ios" ? "padding" : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10} >
                <Tabs.Container
                    ref={tabRef}
                    renderTabBar={(props) => (
                        <MaterialTabBar
                            {...props}
                            scrollEnabled={true}
                            tabStyle={{ minWidth: minWidthTab(data.listTab), height: 42, }}
                            labelStyle={{ fontSize: 14, fontWeight: "600" }}
                            indicatorStyle={{ backgroundColor: appcolor.primary }}
                            inactiveColor={appcolor.dark}
                            activeColor={appcolor.dark}
                            style={{ backgroundColor: appcolor.light }}
                        />
                    )}
                    containerStyle={{ backgroundColor: appcolor.surface }}
                >
                    {ViewItem()}
                </Tabs.Container>
            </KeyboardAvoidingView>
            {
                showProgress &&
                <View style={Styles.progressStyle}>
                    <LoadingView title={'Đang tải dữ liệu...'} isLoading={showProgress} styles={{ marginTop: 8 }} />
                </View>
            }
        </View >
    )
}

const FromEdit = ({ item, appcolor, listCheck, onSelectCalendar, onSelectCheck, onOpenDropDown, handlerChangeInput, Styles }) => {
    let uiTask = []

    const onChangeInput = (text, type) => {
        let value = ''
        if (type == 'INPUT') {
            value = text !== null && text.length > 0 ? text.toString().replace(/,/g, '') : ''
        } else {
            value = text
        }
        handlerChangeInput(value, type)
    }

    switch (item.kpi1) {
        case 0:
            uiTask.push(
                <View key={`NONE` + item.kpi1} style={Styles.viewRow}>
                    <View style={{ flexDirection: 'row', flex: 1 }}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                </View>
            )
            break
        case 1:
            uiTask.push(
                <View key={`TEXT` + item.kpi1} style={Styles.viewColumn}>
                    <View style={Styles.viewTitle}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                    <TextInput
                        editable={item.upload !== 1 ? true : false} selectTextOnFocus={item.upload !== 1 ? true : false}
                        multiline={true}
                        autoCorrect={false}
                        onChangeText={text => onChangeInput(text, 'NOTE')}
                        style={{ flex: 1, padding: 10, color: appcolor.dark, height: 50, textAlign: 'left', borderWidth: 0.4, borderRadius: 10, borderColor: appcolor.dark, backgroundColor: appcolor.light }}
                        // onEndEditing={endChangeNote}
                        placeholderTextColor={appcolor.greydark}
                        defaultValue={item.posmValue || ''}
                        placeholder='Nhập ghi chú'
                    />
                </View>
            )
            break;
        case 2:
            uiTask.push(
                <View key={`NUMBER` + item.kpi1} style={Styles.viewRow}>
                    <View style={Styles.viewTitle}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                    <NumberFormat
                        value={item.quanity === 0 ? 0 : (item.quanity || '')}
                        displayType='text'
                        thousandSeparator={true}
                        renderText={value =>
                            <TextInput
                                textAlign={'center'}
                                value={value}
                                style={{ backgroundColor: appcolor.light, flex: 1, fontSize: 13, color: appcolor.dark, fontWeight: '500', textAlign: 'center', borderWidth: 0.5, borderRadius: 5, borderColor: appcolor.greydark, padding: 8, marginBottom: 2 }}
                                keyboardType='numeric'
                                placeholder={'Sellout'}
                                placeholderTextColor={appcolor.greydark}
                                editable={item.upload !== 1}
                                selectTextOnFocus={item.upload !== 1}
                                onChangeText={text => onChangeInput(text, 'INPUT')}
                            />
                        }
                    />
                </View>
            )
            break;
        case 3:
            uiTask.push(
                <View key={`BOOLEAN` + item.kpi1} style={Styles.viewRow}>
                    <View style={Styles.viewTitle}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: "flex-end" }}>
                        {
                            listCheck.map(it => {
                                return (
                                    <TouchableOpacity
                                        key={it.id + 'check'}
                                        style={Styles.buttonItemRow}
                                        onPress={() => item.upload != 1 && onSelectCheck(it)}
                                    >
                                        <Icon name={item.posmValue == it.name ? 'check-circle' : 'circle'} size={20} style={{ color: item.posmValue == it.name ? appcolor.success : appcolor.greydark }} />
                                        <Text style={Styles.titleButton}>{it.nameVN}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </View>
                </View>
            )
            break;
        case 4:
            uiTask.push(
                <View key={`DROPDOWN` + item.kpi1} style={Styles.viewColumn}>
                    <View style={Styles.viewTitle}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                    <TouchableOpacity
                        key={'dropDown'}
                        style={{ borderRadius: 5, padding: 5, borderColor: appcolor.dark, flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', borderColor: appcolor.greydark, borderWidth: 0.5 }}
                        onPress={() => item.upload != 1 && onOpenDropDown()}
                    >
                        <Text style={Styles.titleButton}>{item.posmValue}</Text>
                        <Icon name={'chevron-down'} size={20} style={{ color: appcolor.greydark }} />
                    </TouchableOpacity>
                </View>
            )
            break;
        case 5:
            uiTask.push(
                <View key={`DATETIME` + item.kpi1} style={Styles.viewRow}>
                    <View style={Styles.viewTitle}>
                        <Text style={Styles.titleItem} >{item.productName}</Text>
                        {
                            item.target == 1 &&
                            <Badge badgeStyle={{ backgroundColor: (item.posmValue && item.posmValue !== 'null' && item.posmValue !== '') ? appcolor.success : appcolor.danger }} />
                        }
                    </View>
                    <TouchableOpacity
                        key={'calendar'}
                        style={Styles.buttonItemRow}
                        onPress={() => item.upload != 1 && onSelectCalendar()}
                    >
                        <Text style={Styles.titleButton}>{item.posmValue}</Text>
                        <Icon name={'calendar-alt'} size={20} style={{ color: appcolor.greydark }} />
                    </TouchableOpacity>
                </View>
            )
            break;
    }
    return uiTask

}

const RenderItem = ({ item, index, data, appcolor, listCheck, Styles }) => {
    const ref_calendar = useRef()
    const ref_dropDown = useRef()
    const [_, setMutate] = useState(false)
    const [listDropDown, setListDropDown] = useState([])
    const [dataCalendar, setDataCalendar] = useState({
        "markedDatesDefault": { [moment((item.kpi1 === 5 && item.kpi1 !== -1 && item.posmValue?.toString()) || new Date()).format('YYYY-MM-DD').toString()]: { selected: true, marked: true, selectedColor: appcolor.primary } },
        "markedDates": { [moment((item.kpi1 === 5 && item.kpi1 !== -1 && item.posmValue?.toString()) || new Date()).format('YYYY-MM-DD').toString()]: { selected: true, marked: true, selectedColor: appcolor.primary } },
        "reportDate": (item.kpi1 === 5 && item.kpi1 !== -1) ? (item.posmValue || '') : ''
    })
    const handlerSelectCalendar = async (date) => {
        const dateString = date.dateString
        if (dateString !== null && dateString !== undefined) {
            const markedDates = {};
            markedDates[dateString] = { selected: true, selectedColor: appcolor.primary, textColor: appcolor.white, }
            item.posmValue = dateString
            await setDataCalendar({
                ...dataCalendar,
                markedDates: markedDates,
            })
            await updateDisplaySurvey(item)
        } else {
            await setDataCalendar({
                ...dataCalendar,
                markedDates: dataCalendar.markedDatesDefault,
            })
        }
    }

    const onSelectCalendar = () => {
        ref_calendar.current.show()
    }

    const onSelectCheck = (itemCheck) => {
        if (item.posmValue == itemCheck.name) {
            item.posmValue = ''
        } else {
            item.posmValue = itemCheck.name
        }
        updateDisplaySurvey(item)
        setMutate(e => !e)
    }
    const onOpenDropDown = () => {
        const listDropDown = data.listData.filter(it => it.groupId == item.groupId && it.itemName == 'PRODUCT')
        listDropDown.map(it => item.posmValue?.includes(it.productName) ? (it.isCheck = true) : (it.isCheck = false))
        setListDropDown(listDropDown)
        ref_dropDown.current.show()
    }
    const onSelectItemSheet = (itemSelect) => {
        if (itemSelect.productName !== 'Đầy Đủ' && !item.posmValue?.includes('Đầy Đủ')) {
            if (!item.posmValue?.includes(itemSelect.productName)) {
                (item.posmValue !== '' && item.posmValue !== 'null' && item.posmValue) ? item.posmValue += `, ${itemSelect.productName}` : item.posmValue = `${itemSelect.productName}`
                itemSelect.isCheck = true
            } else {
                if (item.posmValue?.includes(`, ${itemSelect.productName}`)) {
                    item.posmValue = item.posmValue.replace(`, ${itemSelect.productName}`, '')
                } else if (item.posmValue?.includes(`${itemSelect.productName}, `)) {
                    item.posmValue = item.posmValue.replace(`${itemSelect.productName}, `, '')
                } else {
                    item.posmValue = item.posmValue.replace(`${itemSelect.productName}`, '')
                }
                itemSelect.isCheck = false
            }
        } else {
            if (!item.posmValue?.includes(itemSelect.productName)) {
                item.posmValue = `${itemSelect.productName}`
                listDropDown.map(it => it.id === itemSelect.id ? (it.isCheck = true) : (it.isCheck = false))
            } else {
                item.posmValue = item.posmValue.replace(`${itemSelect.productName}`, '')
                itemSelect.isCheck = false
            }
        }
        updateDisplaySurvey(item)
        setMutate(e => !e)

    }
    const handlerChangeInput = (text, type) => {
        let value = 0
        if (type == 'INPUT') {
            value = text >= 0 ? parseInt(text) : 0
            item.quanity = value
            item.posmValue = ''
        } else {
            item.quanity = value
            item.posmValue = text
        }
        updateDisplaySurvey(item)
        setMutate(e => !e)
    }

    return (
        <View style={Styles.viewItemTab}>
            {
                item.isParent &&
                <View style={Styles.viewItemGroup}>
                    <Text style={Styles.viewTitleGroup}>{`${item.itemName}`}</Text>
                </View>
            }
            {
                item.kpi1 !== -1 &&
                <View style={Styles.viewFormEdit}>
                    <FromEdit key={`FromEdit` + index} item={item} appcolor={appcolor} listCheck={listCheck} Styles={Styles} onSelectCalendar={onSelectCalendar} onSelectCheck={onSelectCheck} onOpenDropDown={onOpenDropDown} handlerChangeInput={handlerChangeInput} />
                </View>

            }
            <ActionSheet
                ref={ref_calendar}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.surface }}
                closeOnPressBack={true}
                gestureEnabled={true}
                indicatorColor={appcolor.primary}
            >
                <View
                    style={Styles.viewSheet}
                >
                    <Calendar
                        firstDay={1}
                        current={moment((item.kpi1 === 5 && item.posmValue) ? item.posmValue.toString() : new Date()).format("yyyy-MM-DD")}
                        monthFormat={'MM - yyyy'}
                        hideExtraDays={true}
                        theme={{
                            backgroundColor: appcolor.light,
                            calendarBackground: appcolor.surface,
                            todayTextColor: appcolor.highlightDate,
                            selectedDayTextColor: appcolor.white,
                            dayTextColor: appcolor.dark,
                            monthTextColor: appcolor.dark
                        }}
                        markedDates={dataCalendar.markedDates}
                        onDayPress={(date) => handlerSelectCalendar(date)}
                    />
                </View>
            </ActionSheet>
            <ActionSheet
                ref={ref_dropDown}
                defaultOverlayOpacity={0.3}
                containerStyle={{ backgroundColor: appcolor.light }}
                closeOnPressBack={true}
                indicatorColor={appcolor.primary}
            >
                <View style={Styles.viewSheet}>
                    <ScrollView>
                        {
                            listDropDown.map((it, id) => {
                                return (
                                    <TouchableOpacity
                                        key={id}
                                        onPress={() => onSelectItemSheet(it)}
                                        style={[Styles.buttonSheet, { backgroundColor: it.isCheck ? appcolor.primary : appcolor.surface }]}>
                                        <Text style={{ color: it.isCheck ? appcolor.white : appcolor.dark, padding: 5 }}>{it.productName}</Text>
                                    </TouchableOpacity>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </ActionSheet>

        </View>
    )
}
