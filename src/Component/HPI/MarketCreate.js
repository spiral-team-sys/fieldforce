import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  StatusBar,
} from 'react-native';
import { Icon, Badge, Button } from '@rneui/themed';
import {
  Store,
  InsertItems,
  UpdateItem,
  QueryStringSql,
} from '../../Core/SqliteDbContext';
import { ToastError, ToastSuccess } from '../../Core/Helper';
import { deviceHeight } from '../../Core/Utility';
import { ListItem } from '@rneui/themed';
import { useSelector } from 'react-redux';
import { _competitorId } from '../../Core/URLs';
import { getMasterlist } from '../../Controller/MasterController';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { getCategory } from '../../Controller/WorkController';
let RNFS = require('react-native-fs');
const MarketCreate = ({ navigation }) => {
  const { kpiinfo, workinfo, appcolor } = useSelector(state => state.GAppState);
  const [Traffics, setTraffics] = useState([]);
  const [Categories, setCategory] = useState([]);
  const [Masterlist, setMasterList] = useState([]);
  const [ItemSaved, setItemSaved] = useState({});
  const [Options, setOption] = useState([]);
  const [Content, setContent] = useState('');
  const [NoteTraffic, setNoteTraffic] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [itemSelect, setItemSelect] = useState({});
  const [guid, setguid] = useState('');
  const [dataIssue, setDataIssue] = useState([]);
  const [dataStatus] = useState([
    { name: 'Chưa xử lý', id: 0 },
    { name: 'Đã xử lý', id: 1 },
  ]);

  React.useEffect(() => {
    const _load = onLoad();
    return () => _load;
  }, []);
  const onLoad = async () => {
    const _Masterlist = await getMasterlist('MARKETISSUE');
    await setMasterList(_Masterlist);
    const _category = await getCategory(_competitorId);
    await setCategory(_category);
    const _Traffic = await getMasterlist('MARKETTRAFFIC');
    await setTraffics(_Traffic);
    // Options
    const { res } = await QueryStringSql(
      "SELECT Distinct ref_Id as id,ref_Name as name FROM masterList WHERE listCode='MARKETISSUE' ",
    );
    await setOption(res || []);
  };
  const Save = async () => {
    if (itemSelect?.cate == undefined || itemSelect?.cate?.id < 1) {
      ToastError('Bạn chưa chọn ngành hàng');
      return;
    }
    if (itemSelect?.options == undefined || itemSelect?.options?.id < 1) {
      ToastError('Bạn chưa chọn hạng mục');
      return;
    }
    if (itemSelect?.issue == undefined || itemSelect?.issue?.id < 1) {
      ToastError('Bạn chưa chọn vấn đề');
      return;
    }

    if (itemSelect?.traffic === undefined || itemSelect.traffic?.id < 1) {
      ToastError('Bạn chưa chọn mật độ khách hàng');
      return;
    }
    console.log(itemSelect, 'issue');
    const item = {
      workId: workinfo.workId,
      categoryId: itemSelect.cate.id,
      categoryName: itemSelect.cate.name,
      optionId: itemSelect.options.id,
      optionName: itemSelect.options.name,
      surveyDisplayId: itemSelect.issue?.id,
      surveyDisplayName: itemSelect?.issue?.name || null,
      trafficId: itemSelect.traffic.id,
      noteTraffic: NoteTraffic,
      content: Content || '',
      status: 0,
      guiId: guid,
      upload: 0,
    };
    //Save
    await Store().then(async db => {
      console.log(item, 'S');
      await InsertItems(db, 'market', [item]);
      clearForm();
    });
    setTimeout(() => {
      ToastSuccess('Đã lưu');
    }, 50);
  };
  const clearForm = () => {
    setContent();
  };
  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        rightFunc={() => navigation.goBack()}
        iconRight="close"
        rightType={'font-awaresome-5'}
        title={'Báo cáo thị trường'}
        iconLeft={'save'}
        leftFunc={Save}
      />
      <View
        style={{
          flex: 12,
          flexDirection: 'column',
          backgroundColor: appcolor.surface,
        }}
      >
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={{ height: deviceHeight * 0.92, padding: 7 }}
        >
          <Text
            style={{
              color: appcolor.dark,
              padding: 7,
              marginLeft: 12,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            Ngành hàng
          </Text>
          <ListView
            list={Categories}
            appcolor={appcolor}
            onSelected={item => {
              setItemSelect({ cate: item });
            }}
            item={itemSelect?.cate}
          />
          <Text
            style={{
              color: appcolor.dark,
              padding: 7,
              marginLeft: 12,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            Hạng mục
          </Text>
          <ListView
            appcolor={appcolor}
            list={Options}
            item={itemSelect?.cate}
            onSelected={item => {
              setItemSelect({ ...itemSelect, options: item });
              const lstFil = Masterlist.filter(e => e.ref_Id == item.id);
              setDataIssue(lstFil);
            }}
          />
          {dataIssue?.length > 0 && (
            <View>
              <Text
                style={{
                  color: appcolor.dark,
                  padding: 7,
                  marginLeft: 12,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Vấn đề
              </Text>
              <ListView
                appcolor={appcolor}
                list={dataIssue}
                item={itemSelect?.issue}
                onSelected={item => {
                  setItemSelect({ ...itemSelect, issue: item });
                  setShowNote(item.name === 'Other' ? true : false);
                }}
              />
            </View>
          )}
          {showNote && (
            <View style={{}}>
              <Text
                style={{
                  color: appcolor.dark,
                  padding: 7,
                  marginLeft: 12,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Ghi chú vấn đề
              </Text>
              <TextInput
                multiline
                onChangeText={text => setContent(text)}
                onEndEditing={e => Keyboard.dismiss()}
                value={Content}
                style={{
                  backgroundColor: appcolor.light,
                  fontSize: 10,
                  borderWidth: 0.3,
                  maxHeight: 150,
                  minHeight: 55,
                }}
                placeholder="nhập ghi chú"
              />
            </View>
          )}
          <Text
            style={{
              color: appcolor.dark,
              padding: 7,
              marginLeft: 12,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            Mật độ khách hàng{' '}
          </Text>
          <ListView
            appcolor={appcolor}
            list={Traffics}
            item={itemSelect?.traffic}
            onSelected={item => {
              setItemSelect({ ...itemSelect, traffic: item });
            }}
          />

          <Text
            style={{
              color: appcolor.dark,
              padding: 7,
              marginLeft: 12,
              fontSize: 12,
              fontWeight: '700',
            }}
          >
            Trạng thái{' '}
          </Text>
          <ListView
            appcolor={appcolor}
            list={dataStatus}
            item={itemSelect?.status}
            onSelected={item => {
              setItemSelect({ ...itemSelect, status: item });
            }}
          />
          <View>
            <Text
              style={{
                color: appcolor.dark,
                padding: 7,
                marginLeft: 12,
                fontSize: 12,
                fontWeight: '700',
              }}
            >
              Ghi chú mật độ khách hàng
            </Text>
            <TextInput
              multiline
              onChangeText={text => {
                setNoteTraffic(text);
              }}
              onEndEditing={e => Keyboard.dismiss()}
              value={NoteTraffic}
              style={{
                borderWidth: 0.3,
                color: appcolor.dark,
                fontSize: 10,
                backgroundColor: appcolor.light,
                borderColor: 'lightgray',
                maxHeight: 150,
                minHeight: 55,
              }}
              placeholder="nhập ghi chú"
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
const ListView = ({ list, item, onSelected, appcolor }) => {
  const [select, setSelect] = useState(item);
  useEffect(() => {}, [item]);
  const onSelectItem = item => {
    setSelect(item);
    onSelected(item);
  };
  return (
    <View>
      {list.map((l, i) => (
        <ListItem
          containerStyle={{
            backgroundColor:
              select?.id === l.id ? appcolor.warning : appcolor.light,
            padding: 7,
          }}
          onPress={() => onSelectItem(l)}
          key={i}
          bottomDivider
        >
          <Badge value={i + 1} />
          <ListItem.Content>
            <ListItem.Title style={{ fontSize: 11 }}>{l.name}</ListItem.Title>
            {l?.subtitle && (
              <ListItem.Subtitle>{l?.subtitle}</ListItem.Subtitle>
            )}
          </ListItem.Content>
        </ListItem>
      ))}
    </View>
  );
};
export default MarketCreate;
