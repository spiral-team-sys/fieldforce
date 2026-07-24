import React, { Component, useState, useRef } from "react";
import { View, ImageBackground, ScrollView, Text, TextInput, Platform, Dimensions, KeyboardAvoidingView, Keyboard, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import PageHeader from "../Content/PageHeader";
import { Icon, Badge, Button } from '@rneui/themed';
import { Store, SelectItems, InsertItems, exeSqlNoQuery, UpdateItem } from "../Core/SqliteDbContext";
import { MessageInfo, UploadData, UUIDGenerator } from '../Core/Helper';
import SearchableDropdown from 'react-native-searchable-dropdown';
import { getMarketHistory, getMarketResult, MarketGetList, MarketUpload } from "../Controller/WorkController";
import { URL_POST_MARKET_UPLOAD, DEFAULT_COLOR, AppNameBuild, hpiApp } from '../Core/URLs';
import { ConvertDateFromInt, TODAY, checkNetwork } from "../Core/Utility";
import Moment from 'moment';

import { createTableNow } from '../Core/SqliteDbContext';
import { market } from '../Core/TableLocal';
import { getAllPhotosUploaded } from '../Controller/WorkController'
import { masterList } from "../Core/Table";
import * as Progress from 'react-native-progress';
import { updateIdStatusFileUploaded } from "../Controller/WorkController";
import { URL_UPLOAD_PHOTOS } from '../Core/URLs';
import { Token } from '../Core/Helper';
import { isIphoneX } from "../Core/is-iphone-x";
import { uploadAllDataPhoto } from "../Controller/PhotoController";
import SpiralIcon from "../Control/Icon/SpiralIcon";
const styles = StyleSheet.create({
    Text: {
        padding: 3,
        color: 'black',
        minHeight: 27,
        borderWidth: 0.6,
        borderBottomColor: '#f0f0f1'
    },
    textbox: {
        fontSize: 15,
        paddingLeft: 15,
        paddingRight: 15,
        color: 'black',
        minHeight: 30,
        maxHeight: 30,
        textAlign: 'left',
        borderWidth: 0
    },
    line: {
        width: '100%',
        height: 0.6,
        backgroundColor: '#e9e9e9',
        paddingStart: 10,
        paddingEnd: 10,
        marginBottom: 4,
        marginTop: 4
    },
    separator: {
        width: '100%',
        height: 0.6,
        backgroundColor: '#e9e9e9'
    }
});

let RNFS = require('react-native-fs');

const HEIGHT_BAR = Platform.OS == "ios" ? 10 : (isIphoneX ? 50 : 10)
const HEIGHT_SCREEN = Dimensions.get('window').height

function MarketModel({ Traffics, Categories, Masterlist, Options, workinfo, guiId, Closed, navigation, loaddata, ItemSaved, LoadHistory }) {

    const [Content, setContent] = useState('');
    const [NoteTraffic, setNoteTraffic] = useState('');
    const [showNote, setShowNote] = useState(false);

    const [selectedCategories] = useState([]);
    const [selectedOptions] = useState([]);
    const [selectedTraffic] = useState([]);
    const [selectedIssue] = useState([]);
    const [selectedStatus] = useState([]);

    const [indexCat, setIndexCat] = useState(0);
    const [indexOption, setIndexOption] = useState(0);
    const [indexIssue, setIndexIssue] = useState(0);
    const [indexTraffic, setIndexTraffic] = useState(0);
    const [indexStatus, setIndexStatus] = useState(0);

    const [dataIssue] = useState([{ "name": "--chọn--", "id": 0 }]);
    const [dataStatus] = useState([{ "name": "Chưa xử lý", "id": 0 }, { "name": "Đã xử lý", "id": 1 }]);

    const refIssue = useRef();

    React.useEffect(() => {
        if (ItemSaved !== null) {
            let indexC = Categories.findIndex(itemP => itemP.id === ItemSaved.categoryId)
            let catObj = Categories[indexC] !== undefined ? Categories[indexC] : null
            setIndexCat(indexC)
            selectedCategories.splice(0)
            catObj !== null && selectedCategories.push(catObj)


            let indexOp = Options.findIndex(itemP => itemP.id === ItemSaved.optionId)
            let optionObj = Options[indexOp] !== undefined ? Options[indexOp] : null
            setIndexOption(indexOp)
            selectedOptions.splice(0)
            selectedOptions.push(optionObj)

            dataIssue.splice(0);
            Masterlist.filter(itemM => itemM.ref_Id == ItemSaved.optionId).forEach(result => {
                dataIssue.push(result)
            });

            let indexIs = dataIssue.findIndex(itemP => itemP.Id === ItemSaved.surveyDisplayId)
            let issueObj = dataIssue[indexIs] !== undefined ? dataIssue[indexIs] : null
            setIndexIssue(indexIs)
            selectedIssue.splice(0)
            selectedIssue.push(issueObj)

            let indexSta = dataStatus.findIndex(itemp => itemp.id === ItemSaved.status)
            let statusObj = dataStatus[indexSta] !== undefined ? dataStatus[indexSta] : null
            indexSta !== -1 && setIndexStatus(indexSta)
            selectedStatus.splice(0)
            selectedStatus.push(statusObj)

            let indexTraffic = Traffics.findIndex(itemp => itemp.id === ItemSaved.trafficId)
            let trafficObj = Traffics[indexTraffic] !== undefined ? Traffics[indexTraffic] : null
            indexTraffic !== -1 && setIndexTraffic(indexTraffic)
            // selectedTraffic.splice(0)
            trafficObj !== null && selectedTraffic.push(trafficObj)

            setShowNote(ItemSaved.surveyDisplayName === 'Other' ? true : false)
            setContent(ItemSaved.content)
            setNoteTraffic(ItemSaved.noteTraffic)
        }
        else {

            setShowNote(false)
            setContent('')
            setNoteTraffic('')

            setIndexCat(0);
            setIndexOption(0);
            setIndexIssue(0);
            setIndexTraffic(0);


            selectedCategories.splice(0);
            selectedOptions.splice(0);
            selectedIssue.splice(0);
            selectedTraffic.splice(0);
            // selectedTraffic.push({"name":"--chọn--","id":0})
            // selectedIssue.push({"name":"--chọn--","id":0})
            selectedStatus.splice(0);
            dataIssue.splice(0);
            dataIssue.push({ "name": "--chọn--", "id": 0 })
        }
    }, [ItemSaved])

    const takePhoto = () => {
        let item = {
            "reportId": workinfo.reportId,
            "shopId": workinfo.shopId,
            "shopCode": workinfo.shopCode,
            "guiId": guiId,
            "photoDate": workinfo.workDate
        }
        navigation.navigate('Camera', item);
    };
    const showALbum = () => {
        let item = {
            "reportId": workinfo.reportId,
            "shopId": workinfo.shopId,
            "guiId": guiId,
            "photoDate": workinfo.workDate
        }
        navigation.navigate('AlbumPhoto', item);
    };
    const Save = async () => {
        if (selectedCategories == null || selectedCategories.length < 1) {
            alert('Bạn chưa chọn ngành hàng');
            return;
        }
        else {
            // alertPrint(selectedCategories)
            if (selectedCategories[0].id === 0) {
                alert('Bạn chưa chọn ngành hàng');
                return;
            }
        }

        if (selectedOptions == null || selectedOptions.length < 1) {
            alert('Bạn chưa chọn hạng mục');
            return;
        }
        else {
            if (selectedOptions[0].id === 0) {
                alert('Bạn chưa chọn hạng mục');
                return;
            }

        }

        // alertPrint(selectedIssue)

        if (selectedIssue == null || selectedIssue.length < 1) {
            alert('Bạn chưa chọn vấn đề');
            return;
        }
        else {
            if (selectedIssue[0].id === 0) {
                alert('Bạn chưa chọn vấn đề');
                return;
            }

        }

        if (selectedTraffic == null || selectedTraffic.length < 1) {
            alert('Bạn chưa chọn mật độ khách hàng');
            return;
        }
        else {
            if (selectedTraffic[0].id === 0) {
                alert('Bạn chưa chọn mật độ khách hàng');
                return;
            }

        }

        if (LoadHistory === true) {
            // alertPrint(selectedStatus)
            if (selectedStatus.length === 0) {
                alert('Bạn chưa chọn trạng thái!');
                return;
            }
            else {
                if (selectedStatus[0].id === 0 && selectedStatus[0].name !== 'Chưa xử lý') {
                    alert('Bạn chưa chọn trạng thái.');
                    return;
                }

            }
        }



        // alertPrint(selectedTraffic)

        //Save
        await Store().then(async db => {

            const item = {
                workId: workinfo.workId,
                categoryId: selectedCategories[0].id,
                categoryName: selectedCategories[0].name,
                optionId: selectedOptions[0].id,
                optionName: selectedOptions[0].name,
                surveyDisplayId: selectedIssue[0].Id,
                surveyDisplayName: selectedIssue[0].name,
                trafficId: selectedTraffic[0].Id,
                noteTraffic: NoteTraffic,
                content: Content,
                status: 0,
                guiId: guiId,
                upload: 0
            }

            if (LoadHistory === true) {
                let itemUpdate = {
                    categoryId: selectedCategories[0].id,
                    categoryName: selectedCategories[0].name,
                    optionId: selectedOptions[0].id,
                    optionName: selectedOptions[0].name,
                    surveyDisplayId: selectedIssue[0].Id,
                    surveyDisplayName: selectedIssue[0].name,
                    content: ItemSaved.content,
                    status: selectedStatus[0].id,
                    trafficId: selectedTraffic[0].Id,
                    noteTraffic: ItemSaved.noteTraffic,
                    upload: 0
                }
                // alertPrint(ItemSaved)
                UpdateItem(db, 'market', itemUpdate, { "id": ItemSaved.Id });

            }
            else {
                // alertPrint(item)
                await InsertItems(db, 'market', [item]);
            }

            clearForm();
            Closed();

        });

        setTimeout(() => {
            MessageInfo('Đã lưu');
        }, 50);
    }
    const clearForm = () => {
        setContent();
        loaddata();
    }
    return (
        <View style={{ flex: 1, marginTop: Platform.OS == 'android' ? 10 : 30 }}>
            <View style={{ flex: 12, flexDirection: 'column', padding: 5 }}>
                <View style={{ width: '100%', alignItems: 'flex-end', padding: 4, paddingRight: 10, flexDirection: 'row' }}>
                    <SpiralIcon containerStyle={{ flexGrow: 1 }} name='save'
                        onPress={() => {
                            Keyboard.dismiss();
                            Save();
                        }}
                        color={DEFAULT_COLOR} size={30}></SpiralIcon>
                    <Text style={{ flexGrow: 10, fontSize: 20, textAlign: 'center' }}>Báo cáo thị trường</Text>
                    <SpiralIcon containerStyle={{ flexGrow: 1 }} name='close' color='gray' onPress={() => Closed()} size={30}></SpiralIcon>
                </View>

                <KeyboardAvoidingView
                    style={{ flexDirection: 'column', justifyContent: 'flex-start', }}
                    behavior={Platform.OS == "ios" ? "padding" : "height"}
                    enabled
                    keyboardVerticalOffset={HEIGHT_BAR}
                >

                    <ScrollView keyboardShouldPersistTaps='always' style={{ height: HEIGHT_SCREEN - 50 - HEIGHT_BAR }}>
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.Text}>Ngành hàng</Text>
                            {
                                (LoadHistory == true && indexCat != -1) && <SearchableDropdown
                                    onItemSelect={(item) => {
                                        selectedCategories.splice(0)
                                        selectedCategories.push(item)
                                    }}
                                    containerStyle={{ padding: 5 }}
                                    onRemoveItem={(item, index) => {
                                        const items = selectedItems.filter((sitem) => sitem.id !== item.id);
                                        seletedDivisions.splice(items)
                                    }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 140 }}
                                    items={Categories}
                                    defaultIndex={indexCat.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "Ngành hàng",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => { text == '' ?? seletedDivisions.slice(0) }
                                        }
                                    }
                                    listProps={
                                        {
                                            nestedScrollEnabled: true,
                                        }
                                    }
                                />
                            }
                            {
                                LoadHistory === false && <SearchableDropdown
                                    onItemSelect={(item) => {
                                        selectedCategories.splice(0)
                                        selectedCategories.push(item)
                                    }}
                                    containerStyle={{ padding: 5 }}
                                    onRemoveItem={(item, index) => {
                                        const items = selectedItems.filter((sitem) => sitem.id !== item.id);
                                        seletedDivisions.splice(items)
                                    }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 140 }}
                                    items={Categories}
                                    defaultIndex={indexCat.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "Ngành hàng",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => { text == '' ?? seletedDivisions.slice(0) }
                                        }
                                    }
                                    listProps={
                                        {
                                            nestedScrollEnabled: true,
                                        }
                                    }
                                />
                            }
                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text>Hạng mục</Text>
                            {
                                (LoadHistory == true && indexOption != -1) &&
                                <SearchableDropdown
                                    onItemSelect={(item) => {
                                        selectedOptions.splice(0)
                                        selectedOptions.push(item)

                                        dataIssue.splice(0);
                                        let lstFil = Masterlist.filter(itemM => itemM.ref_Id == item.id);
                                        lstFil.forEach(result => {
                                            dataIssue.push(result)
                                        });

                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 140 }}
                                    items={Options}
                                    defaultIndex={indexOption.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn hạng mục",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedOptions.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }
                            {
                                LoadHistory == false &&
                                <SearchableDropdown
                                    onItemSelect={(item) => {
                                        selectedOptions.splice(0)
                                        selectedOptions.push(item)

                                        dataIssue.splice(0);
                                        let lstFil = Masterlist.filter(itemM => itemM.ref_Id == item.id);
                                        lstFil.forEach(result => {
                                            dataIssue.push(result)
                                        });

                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 140 }}
                                    items={Options}
                                    defaultIndex={LoadHistory ? indexOption.toString() : "0"}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn hạng mục",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedOptions.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }

                        </View>
                        <View style={{ marginTop: 15 }}>
                            <Text>Vấn đề</Text>
                            {
                                (LoadHistory == true && indexCat != -1) &&
                                <SearchableDropdown
                                    ref={refIssue}
                                    onItemSelect={(item) => {
                                        selectedIssue.splice(0)
                                        selectedIssue.push(item)
                                        setShowNote(item.name === 'Other' ? true : false)
                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 150 }}
                                    items={dataIssue}
                                    defaultIndex={indexIssue.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn trạng thái",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedIssue.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }
                            {
                                LoadHistory == false &&
                                <SearchableDropdown
                                    ref={refIssue}
                                    onItemSelect={(item) => {
                                        selectedIssue.splice(0)
                                        selectedIssue.push(item)
                                        setShowNote(item.name === 'Other' ? true : false)
                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 150 }}
                                    items={dataIssue}
                                    defaultIndex={indexIssue.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn trạng thái",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedIssue.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }
                        </View>
                        {
                            showNote &&
                            <View style={{ marginTop: 15 }}>
                                <Text style={styles.Text}>Ghi chú vấn đề</Text>
                                <TextInput
                                    multiline
                                    onChangeText={text => setContent(text)}
                                    onEndEditing={(e) => Keyboard.dismiss()}
                                    value={Content}
                                    style={{ ...styles.textbox, borderWidth: 0.8, borderColor: 'lightgray', maxHeight: 150, minHeight: 55 }}
                                    placeholder='nhập ghi chú'
                                />
                            </View>
                        }
                        <View style={{ marginTop: 15 }}>
                            <Text>Mật độ khách hàng</Text>
                            {
                                (LoadHistory == true && indexCat != -1) &&
                                <SearchableDropdown
                                    ref={refIssue}
                                    onItemSelect={(item) => {
                                        selectedTraffic.splice(0)
                                        selectedTraffic.push(item)

                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 150 }}
                                    items={Traffics}
                                    defaultIndex={indexTraffic.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn trạng thái",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedIssue.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }
                            {
                                LoadHistory == false &&
                                <SearchableDropdown
                                    ref={refIssue}
                                    onItemSelect={(item) => {
                                        selectedTraffic.splice(0)
                                        selectedTraffic.push(item)

                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 150 }}
                                    items={Traffics}
                                    defaultIndex={indexTraffic.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn trạng thái",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? selectedIssue.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            }
                        </View>
                        {
                            (LoadHistory == true && indexCat != -1) &&
                            <View style={{ marginTop: 15 }}>
                                <Text>Trạng thái</Text>
                                <SearchableDropdown
                                    onItemSelect={(item) => {
                                        selectedStatus.splice(0)
                                        selectedStatus.push(item)

                                    }}
                                    containerStyle={{ padding: 5 }}
                                    itemStyle={{
                                        padding: 10,
                                        backgroundColor: '#ddd',
                                        borderColor: '#bbb',
                                        borderWidth: 0.6,
                                    }}
                                    itemTextStyle={{ color: '#222' }}
                                    itemsContainerStyle={{ maxHeight: 150 }}
                                    items={dataStatus}
                                    defaultIndex={indexStatus.toString()}
                                    resetValue={false}
                                    textInputProps={
                                        {
                                            placeholder: "chọn trạng thái",
                                            underlineColorAndroid: "transparent",
                                            style: {
                                                padding: 10,
                                                borderWidth: 1,
                                                borderColor: '#ccc',
                                            },
                                            onTextChange: text => {
                                                text == '' ?? dataStatus.slice(0)
                                            }
                                        }
                                    }
                                    listProps={{ nestedScrollEnabled: false, }
                                    }
                                />
                            </View>
                        }
                        <View style={{ marginTop: 15 }}>
                            <Text style={styles.Text}>Ghi chú mật độ khách hàng</Text>
                            <TextInput
                                multiline
                                onChangeText={text => {
                                    setNoteTraffic(text);

                                }}
                                onEndEditing={(e) => Keyboard.dismiss()}
                                value={NoteTraffic}
                                style={{ ...styles.textbox, borderWidth: 0.8, borderColor: 'lightgray', maxHeight: 150, minHeight: 55 }}
                                placeholder='nhập ghi chú'
                            />
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%', marginTop: 15 }}>
                            <Button
                                containerStyle={{ width: '50%', borderColor: 'gray', borderWidth: 1.0 }}
                                buttonStyle={{ height: 45, backgroundColor: 'white' }}
                                onPress={e => takePhoto(e, "to")}
                                icon={
                                    <SpiralIcon
                                        color='black'
                                        name='camera'
                                        style='baseline'
                                        type='font-awesome'
                                        size={30}
                                    />
                                }
                            />
                            <Button
                                containerStyle={{ width: '50%', borderColor: 'gray', borderWidth: 1.0 }}
                                buttonStyle={{ height: 45, backgroundColor: 'white' }}
                                onPress={e => showALbum(e, "to")}
                                icon={
                                    <SpiralIcon
                                        color='black'
                                        name='photo'
                                        type='font-awesome'
                                        size={30}
                                    />
                                }
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    )
}
const takePhotoCell = (e, guiid, workinfo, navigation) => {
    let item = {
        "reportId": workinfo.reportId,
        "shopId": workinfo.shopId,
        "guiId": guiid,
        "photoDate": workinfo.workDate
    }

    navigation.navigate('Camera', item);
};
const showALbumCell = (e, guiid, workinfo, navigation) => {
    let item = {
        "reportId": workinfo.reportId,
        "shopId": workinfo.shopId,
        "guiId": guiid,
        "photoDate": workinfo.workDate
    }

    navigation.navigate('AlbumPhoto', item);
};

const SwipeableRow = ({ item, index, navigation, workinfo, ShowDetail }) => {
    return (
        <View style={{ flex: 1 }}>

            <TouchableOpacity style={{ flexDirection: 'column', justifyContent: 'space-between' }} onPress={() => {
                if (item.upload == 0) {
                    ShowDetail(item)
                }
            }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
                    <Badge
                        status={item.upload == 0 ? 'error' : 'success'}
                        badgeStyle={{ height: 40, width: 40, borderRadius: 20, }}
                        value={item.upload == 0 ? 'NO' : 'OK'}>
                    </Badge>
                    <View style={{ padding: 5 }}>
                        <Text>{'Ngành hàng: ' + item.categoryName}</Text>
                        <Text>{'Hạng mục: ' + item.optionName}</Text>
                        <Text>{'Vấn đề:' + item.surveyDisplayName}</Text>
                        <Text numberOfLines={4}>{'Ghi chú: ' + item.content}</Text>
                    </View>
                </View>
                <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", width: '100%', marginTop: 15 }}>
                        <Button
                            containerStyle={{ width: '50%' }}
                            buttonStyle={{ height: 45, backgroundColor: 'white' }}
                            onPress={e => (item.upload == 0) && takePhotoCell(e, item.guiId, workinfo, navigation)}
                            icon={
                                <SpiralIcon
                                    color='black'
                                    name='camera'
                                    style='baseline'
                                    type='font-awesome'
                                    size={30}
                                />
                            }
                        />
                        <Button
                            containerStyle={{ width: '50%', height: 45 }}
                            buttonStyle={{ height: 45, backgroundColor: 'white' }}
                            onPress={e => showALbumCell(e, item.guiId, workinfo, navigation)}
                            icon={
                                <SpiralIcon
                                    color='black'
                                    name='photo'
                                    type='font-awesome'
                                    size={30}
                                />
                            }
                        />
                    </View>
                    <Text style={{ ...styles.line, marginTop: 20, width: '100%' }}></Text>

                </View>
            </TouchableOpacity>
        </View>
    );
};
export default class Market extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loadHistory: false,
            itemSelect: null,
            showProgress: false,
            display: 'none',
            guiId: "",
            Masterlist: [],
            Categories: [],
            Options: [],
            Markets: [],
            Traffics: [],
            workinfo: this.props.route.params.workinfo,
        }
    }
    setShowProgress = (check) => {
        this.setState({ showProgress: check });
    }
    selloutLoad() {
        const workinfo = this.state.workinfo;
        Store().then(async (db) => {
            const { res, err } = await MarketGetList(db, workinfo);
            if (res != null) {
                this.setState({ Sellouts: res });
            }
        });
    }
    sortArrayAsc(array) {
        return array.sort(function (a, b) {
            console.info(b.amount)
            return b.id < a.id ? 1
                : b.id > a.id ? -1
                    : 0
        })
    }
    async loaddata() {
        let dbContext;
        let res;
        let lstMasterlist = [];
        let lstmarket = [];
        let lstOptions = [];
        let lstcategory = [];
        let lstTraffic = [];

        await Store().then(async (db) => {
            dbContext = db;
        });

        await createTableNow(dbContext, market);

        //Market result
        const workinfo = this.state.workinfo;
        res = await MarketGetList(dbContext, workinfo);
        if (res != null) {
            lstmarket.push({ "id": 0, "name": "--chọn--" })
            res.res.map(itemM => {
                lstmarket.push(itemM)
            })
            // lstmarket=res.res;
            // lstmarket.push({"name":"--chọn--","id":1})
            // this.sortArrayAsc(lstmarket)
        }

        //category

        res = await SelectItems(dbContext, 'products', ['Distinct categoryId as id', 'categoryName as name']);
        if (res != null) {
            lstcategory.push({ "id": 0, "name": "--chọn--" })
            res.res.map(itemM => {
                lstcategory.push(itemM)
            })
            // lstcategory=res.res;
            // lstcategory.push({"name":"--chọn--","id":1})
            // this.sortArrayAsc(lstcategory)
        }

        // Options
        res = await SelectItems(dbContext, 'masterList', ["Distinct ref_Id as id,ref_Name as name"], { listCode: 'MARKETISSUE' });
        if (res != null) {
            lstOptions.push({ "name": "--chọn--", "id": 0 })
            res.res.map(itemM => {
                lstOptions.push(itemM)
            })
        }

        // Traffic
        res = await SelectItems(dbContext, 'masterList', '*', { listCode: 'MARKETTRAFFIC' });
        if (res != null) {
            lstTraffic.push({ "name": "--chọn--", "id": 0 })
            res.res.map(itemM => {
                lstTraffic.push(itemM)
            })
            // alertPrint(lstTraffic)
        }

        // Masterlist
        res = await SelectItems(dbContext, 'masterList', '*', { listCode: 'MARKETISSUE' });
        if (res != null) {
            // lstMasterlist=res.res;
            lstMasterlist.push({ "name": "--chọn--", "id": 0 })
            res.res.map(itemM => {
                lstMasterlist.push(itemM)
            })

        }

        this.setState({
            Masterlist: lstMasterlist,
            Categories: lstcategory,
            Markets: lstmarket,
            Options: lstOptions,
            Traffics: lstTraffic
        });
    }
    async componentDidMount() {
        await this.loaddata();
        await this.insertHistory();
        this.selloutLoad();
    }
    insertHistory = async () => {
        let displayHistory = await getMarketHistory(this.state.workinfo);
        let lstMaster = this.state.Masterlist
        let lstCate = this.state.Categories
        let marketRes = await getMarketResult(this.state.workinfo)

        displayHistory.map(async itemH => {
            let lstHaveRes = marketRes.filter(itemR => itemR.guiId === itemH.guiId)
            let lstHaveCat = lstCate.filter(itemC => itemC.id === itemH.categoryId)
            let lstHave = lstMaster.filter(itemM => itemM.Id === itemH.surveyDisplayId)

            await Store().then(async db => {

                if (lstHaveRes.length === 0) {
                    const itemInsert = {
                        workId: this.state.workinfo.workId,
                        categoryId: itemH.categoryId,
                        categoryName: lstHaveCat[0].name,
                        optionId: lstHave[0].ref_Id,
                        optionName: lstHave[0].ref_Name,
                        surveyDisplayId: itemH.surveyDisplayId,
                        surveyDisplayName: lstHave[0].name,
                        content: itemH.note,
                        trafficId: itemH.trafficId,
                        noteTraffic: itemH.noteTraffic,
                        status: itemH.status,
                        guiId: itemH.guiId,
                        upload: 0
                    }

                    await InsertItems(db, 'market', [itemInsert]);

                }

            })
        })


    }
    AddMarket() {

        if (this.state.workinfo.workDate === TODAY) {
            this.setState({ display: 'flex', itemSelect: null, loadHistory: false, guiId: UUIDGenerator() });
        }

    }
    async Closed() {
        this.selloutLoad();
        this.setState({ display: 'none', loadHistory: false });

    }
    async Upload() {
        const workinfo = this.state.workinfo;
        let isNetwork = await checkNetwork();

        await Store().then(async (db) => {
            const { res, err } = await MarketUpload(db, workinfo);
            let resPhotos = await getAllPhotosUploaded(workinfo.reportId, workinfo.shopId, workinfo.workDate);

            if (res != null && res.length > 0) {
                if (res != null && res.length > 0 && resPhotos.length < 2 && AppNameBuild !== hpiApp) {
                    MessageInfo("Vui lòng chụp tối thiểu 2 tấm hình cho báo cáo.")
                    return
                }

                if (!isNetwork) {
                    MessageInfo("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
                    return
                }

                var details = [];
                res.forEach(item => {
                    // alertPrint(item)
                    details.push(
                        {
                            "categoryId": item.categoryId,
                            "surveyDisplayId": item.surveyDisplayId,
                            "guiId": item.guiId,
                            "content": item.content,
                            "status": item.status,
                            "trafficId": item.trafficId,
                            "noteTraffic": item.noteTraffic
                        })
                });

                let itemsPhoto = [];
                resPhotos.forEach(photoInfo => {
                    let ImgName = photoInfo.photoPath.substring(photoInfo.photoPath.lastIndexOf('/') + 1, photoInfo.photoPath.length);
                    // let pathPhoto = URLDEFAULT + 'uploaded/' + photoInfo.photoDate + '/' + ImgName
                    let pathPhoto = '/uploaded/' + photoInfo.photoDate + '/' + ImgName
                    let dataItem = {
                        "shopId": photoInfo.shopId,
                        "photoName": ImgName,
                        "latitude": photoInfo.latitude,
                        "longitude": photoInfo.longitude,
                        "accuracy": 8,
                        "reportId": photoInfo.reportId,
                        "photoTime": Moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                        "photoType": '' + parseInt(photoInfo.photoType),
                        "photoDate": photoInfo.photoDate,
                        "photoPath": pathPhoto,
                        "guid": photoInfo.guid
                    }
                    itemsPhoto.push(dataItem);
                });


                var MarketInfo = JSON.stringify({
                    "ShopId": workinfo.shopId,
                    "WorkDate": ConvertDateFromInt(workinfo.workDate, 'YYYYMMDD', 'YYYY-MM-DD'),
                    "Details": JSON.stringify(details),
                    "Photos": JSON.stringify(itemsPhoto)
                });

                this.setShowProgress(true);
                var Results = await UploadData(URL_POST_MARKET_UPLOAD, MarketInfo);
                if (Results != null && Results.status == 200) {
                    this.setShowProgress(false);
                    alert('Đã gửi dữ liệu');
                    const sql = "Update market set upload=1 WHERE WorkId=" + workinfo.workId;
                    await exeSqlNoQuery(db, sql);
                    await this.selloutLoad();

                    uploadAllDataPhoto(resPhotos);
                } else {
                    this.setShowProgress(false);
                    alert('Chưa gửi được dữ liệu');
                }
            } else {
                alert('Đã gửi hết dữ liệu');
            }
        });
    }
    ShowDetail = async (itemAccept) => {

        this.setState({ display: 'flex' });
        await this.setState({ itemSelect: {} });
        await this.setState({ itemSelect: itemAccept, loadHistory: true });

    }
    reloadData = () => {
        const CategoriesTem = this.state.Categories;
        const MasterlistTem = this.state.Masterlist;
        const MarketsTem = this.state.Markets;
        const OptionsTem = this.state.Options;

        // alert(1)
        this.setState({
            itemSelect: null,
            Categories: [],
            Masterlist: [],
            Markets: [],
            Options: []
        });
        this.setState({
            Masterlist: MasterlistTem,
            Categories: CategoriesTem,
            Markets: MarketsTem,
            Options: OptionsTem
        });
    }
    render() {
        const show = this.state.display;
        const showlist = show == 'none' ? 'flex' : 'none';
        const Masterlist = this.state.Masterlist;
        const Options = this.state.Options;
        const Categories = this.state.Categories;
        const workinfo = this.state.workinfo;
        const traffics = this.state.Traffics;

        return (
            <ImageBackground style={{ height: '100%', width: '100%', backgroundColor: 'white' }}>
                <View style={{ flex: 1, display: showlist }}>
                    <PageHeader leftclick={() => this.props.navigation.goBack()}
                        Title='Báo cáo thị trường'
                        righticon='cloud-upload-alt'
                        rightcolor='white'
                        rightclick={() => this.Upload()}
                    ></PageHeader>
                    <FlatList
                        data={this.state.Sellouts}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        renderItem={({ item, index }) => (
                            <SwipeableRow item={item} index={index} navigation={this.props.navigation} workinfo={workinfo} ShowDetail={this.ShowDetail} />
                        )}
                        keyExtractor={(item, index) => `message ${index}`} />
                    {
                        this.state.showProgress === true && <Progress.Circle color={DEFAULT_COLOR} thickness={5} size={90} indeterminate={true} style={{ position: 'absolute', alignSelf: "center", marginTop: Dimensions.get('window').height / 2 }} />
                    }
                    {/* <SocialIcon onPress={()=>this.AddMarket()} 
                    style={{position:'absolute',zIndex:10,right:20,bottom:20}} 
                    iconSize={50} iconColor='green'
                    type='plus-circle'></SocialIcon> */}
                    <SpiralIcon
                        disabledStyle={{ backgroundColor: 'clear' }}
                        iconStyle={{ color: DEFAULT_COLOR }}
                        onPress={() => this.AddMarket()}
                        containerStyle={{ position: 'absolute', zIndex: 10, right: 20, bottom: 20, maxHeight: 50 }}
                        size={45}
                        name='add-circle-outline'
                        type='ionicon'
                    />
                </View>
                <View style={{ flex: 1, display: show, backgroundColor: 'white' }}>
                    <MarketModel Traffics={traffics} workinfo={workinfo} Categories={Categories} Masterlist={Masterlist} Options={Options} Closed={() => this.Closed()} guiId={this.state.guiId} navigation={this.props.navigation} loaddata={() => this.reloadData()} ItemSaved={this.state.itemSelect} LoadHistory={this.state.loadHistory} />
                </View>
            </ImageBackground>
        )
    }
}