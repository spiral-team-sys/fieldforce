import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import FormGroup from '../../../Content/FormGroup';
import { useSelector } from 'react-redux';
import {
  MessageAction,
  MessageAction2,
  UUIDGenerator,
  groupDataByKey,
  removeStore,
} from '../../../Core/Helper';
import { PhotoInput } from './PhotoInput';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearPhotoReportZalo,
  deletePhotoByGuid,
  getDataPhotos,
} from '../../../Controller/PhotoController';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { deviceHeight, deviceWidth } from '../../../Themes/AppsStyle';
import { Icon } from '@rneui/themed';
import { TODAY } from '../../../Core/Utility';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const template = {
  current: null,
  propose: null,
  classify: null,
  noteClassify: null,
};

const InputIdea = ({ dataInput, reload }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, userinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [itemInput, setItemInput] = useState({
    ...template,
    guid: UUIDGenerator(),
  });
  const [_Mutate, setMutate] = useState(false);
  const [listImages, setListImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataListSelect, setDataListSelect] = useState({
    itemSelect: null,
    itemMain: {},
    listSelect: [],
  });
  console.log(dataInput);

  const KeyStore = `KAIZEN_INPUTIDEA`;
  const normalizedInputs = useMemo(() => {
    const dataMap = new Map();

    (dataInput || []).forEach((item, index) => {
      const key = item?.ref_Name || `${item?.ref_Code || 'item'}_${index}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, item);
      }
    });

    return Array.from(dataMap.values());
  }, [dataInput]);

  const LoadData = async () => {
    const localStore = await AsyncStorage.getItem(KeyStore);
    const local = await JSON.parse(localStore);
    if (localStore != null) {
      MessageAction2(
        'Đã có dữ liệu lưu tạm, bạn có muốn tiếp tục nhập không?',
        async () => {
          await setItemInput({ ...local });
          await getDataPhotos(
            userinfo.employeeId,
            TODAY,
            null,
            kpiinfo.id,
            local.guid,
            false,
            setListImages,
          );
        },
        async () => {
          await setLoading(true);
          await deletePhotoByGuid(local.guid);
          await removeStore(KeyStore);
          await setItemInput({ ...template, guid: UUIDGenerator() });
          await setLoading(false);
        },
      );
    } else {
      await setLoading(true);
      await clearPhotoReportZalo(userinfo.employeeId, kpiinfo.id);
      await setItemInput({ ...template, guid: UUIDGenerator() });
      await setTimeout(async () => {
        await setLoading(false);
      }, 500);
    }
  };

  useEffect(() => {
    LoadData();
    return;
  }, [dataInput, reload]);

  const handlerEditInput = (item, text, type) => {
    if (type == 'other') {
      itemInput[item.links] = text == ' ' || text == '' ? null : text;
    } else {
      itemInput[item.ref_Name] = text == ' ' || text == '' ? null : text;
    }
    setMutate(e => (e = !e));
    AsyncStorage.setItem(KeyStore, JSON.stringify(itemInput));
  };
  const handlerSelectItem = (item, text) => {
    if (item.ref_Code == 'select') {
      const listByItem = JSON.parse(item.dataByItem || '[]');
      const { arr } = groupDataByKey({
        arr: listByItem,
        key: 'groupId',
      });
      const itemSelect = itemInput[item.ref_Name]
        ? JSON.parse(itemInput[item.ref_Name] || '{}')
        : null;
      SheetManager.show('TypeIdeaSheet', {
        payload: { itemSelect: itemSelect, itemMain: item, listSelect: arr },
      });
    }
  };
  const handleSelectItemSheet = item => {
    if (item.id == 100 && itemInput[dataListSelect.itemMain.links]) {
      delete itemInput[dataListSelect.itemMain.links];
    }
    itemInput[dataListSelect.itemMain.ref_Name] = JSON.stringify(item);
    setMutate(e => (e = !e));
    AsyncStorage.setItem(KeyStore, JSON.stringify(itemInput));
    SheetManager.hide('TypeIdeaSheet');
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    scrollContent: { padding: 16, paddingBottom: 32 },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingBottom: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 18,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
      marginBottom: 8,
    },
    cardHeaderIcon: { marginRight: 10 },
    cardTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
    cardBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    cardBadgeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 12,
      paddingHorizontal: 8,
    },
  });
  const InputList = () => {
    return normalizedInputs?.map((item, index) => {
      switch (item.ref_Code) {
        case 'text':
          return (
            <View key={index}>
              <FormGroup
                title={item.nameVN}
                key={item.ref_Name}
                multiline={true}
                iconName={'comments'}
                defaultValue={itemInput[item.ref_Name] || ''}
                handleChangeForm={text => handlerEditInput(item, text)}
                onClearTextAndroid={() => handlerEditInput(item, null)}
                keyboardType={'default'}
                containerStyle={{ padding: 4 }}
                placeholder={item.textValue || `Nhập ${item.nameVN}`}
                editable={item.ref_Id === 1 ? false : true}
              />
            </View>
          );
        case 'select':
          const itemSelect = JSON.parse(itemInput[item.ref_Name] || '{}');
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlerSelectItem(item)}
            >
              <FormGroup
                key={`Select_${item.ref_Name}`}
                rightFunc={() => handlerSelectItem(item)}
                iconRight={'caret-down'}
                iconRightStyle={{ color: appcolor.primary }}
                title={item.nameVN}
                defaultValue={
                  itemInput[item.ref_Name]
                    ? `${
                        itemSelect.id == 100 ? '' : `${itemSelect.groupName} : `
                      }${itemSelect.nameVN}`
                    : '--Chọn--'
                }
                multiline={true}
                containerStyle={{ padding: 4 }}
                useClearAndroid={false}
              />
              {itemSelect && itemSelect.id == 100 && (
                <FormGroup
                  title={`Nội dung ${itemSelect.nameVN}`}
                  key={`${index}_${itemSelect.id}`}
                  multiline={true}
                  iconName={'comments'}
                  defaultValue={itemInput[item.links] || null}
                  handleChangeForm={text =>
                    handlerEditInput(item, text, 'other')
                  }
                  onClearTextAndroid={() =>
                    handlerEditInput(item, null, 'other')
                  }
                  keyboardType={'default'}
                  containerStyle={{ padding: 4 }}
                  placeholder={`Nhập nội dung ${itemSelect.nameVN}`}
                  editable={true}
                />
              )}
            </TouchableOpacity>
          );
        case 'image':
          return (
            <View key={index}>
              <PhotoInput
                _guid={itemInput.guid}
                itemInput={itemInput}
                reload={reload}
              />
            </View>
          );
      }
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <SpiralIcon
            name="lightbulb"
            type="font-awesome-5"
            size={16}
            color={appcolor.primary}
            style={styles.cardHeaderIcon}
            solid
          />
          <Text style={[styles.cardTitle, { color: appcolor.dark }]}>
            Thông tin đề xuất
          </Text>
          <View
            style={[styles.cardBadge, { backgroundColor: appcolor.primary }]}
          >
            <Text style={styles.cardBadgeText}>
              {normalizedInputs.length} trường
            </Text>
          </View>
        </View>
        {!loading && InputList()}
      </View>
      <View style={{ width: deviceWidth }}>
        <ActionSheet
          id={'TypeIdeaSheet'}
          defaultOverlayOpacity={0.3}
          closeOnPressBack={true}
          indicatorColor={appcolor.primary}
          onBeforeShow={setDataListSelect}
          containerStyle={{
            backgroundColor: appcolor.surface,
            padding: 5,
            height: deviceHeight * 0.7,
            paddingBottom: insets.bottom,
          }}
        >
          <View
            style={{
              padding: 8,
              marginBottom: 20,
              paddingTop: 20,
              backgroundColor: appcolor.surface,
              width: '100%',
              height: '100%',
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {dataListSelect.listSelect.map((it, idx) => {
                return (
                  <View key={`${it.code}_${idx}`} style={{ padding: 4 }}>
                    {it.isParent && (
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: appcolor.transparent,
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      >
                        <SpiralIcon
                          name="tag"
                          color={appcolor.primary}
                          type={'font-awesome-5'}
                          size={16}
                          style={{ marginEnd: 8 }}
                        />
                        <Text
                          style={{
                            flex: 1,
                            fontSize: 16,
                            fontWeight: 'bold',
                            color: appcolor.primary,
                          }}
                        >
                          {it.groupName}
                        </Text>
                      </View>
                    )}
                    <TouchableOpacity
                      key={'itemSelect_' + idx}
                      onPress={() => handleSelectItemSheet(it)}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor:
                          dataListSelect.itemSelect?.id == it.id
                            ? appcolor.primary
                            : appcolor.light,
                        marginLeft: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          color:
                            dataListSelect.itemSelect?.id == it.id
                              ? appcolor.white
                              : appcolor.dark,
                        }}
                      >
                        {it.nameVN}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </ActionSheet>
      </View>
    </ScrollView>
  );
};

export default InputIdea;
