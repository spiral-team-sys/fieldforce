import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { TaskAPI } from '../../API/TaskAPI';
import { alertWarning, deviceHeight, isValid } from '../../Core/Utility';
import { Icon, Text } from '@rneui/themed';
import { MutipleItemSelected } from '../../Control/MutipleItemSelected';
import FormGroup from '../../Content/FormGroup';
import _ from 'lodash';
import { scaleSize } from '../../Themes/AppsStyle';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { ToastError, ToastSuccess } from '../../Core/Helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const HomeTodoList = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo } = useSelector(state => state.GAppState);
  const [itemTask, setItemTask] = useState({
    statusId: 1,
    statusName: 'Hôm nay',
    taskName: null,
    isColor: TaskAPI.colorStatus.OPEN,
  });
  const [todoList, setTodoList] = useState([]);
  const [dataHeader, setDataHeader] = useState([]);
  const [dataStatus, setDataStatus] = useState([]);
  const [viewResult, setViewResult] = useState(false);
  const [mutate, setMutate] = useState(false);
  const LoadData = async () => {
    await TaskAPI.ToDoList(workinfo, async mList => {
      todoList.length == 0 && (await setTodoList(mList));
    });
    await TaskAPI.TaskStatus(async mData => {
      await setDataHeader(mData.filter(i => i.id !== 3));
      await setDataStatus(mData);
    });
  };
  const uploadTaskAction = async () => {
    const result = await TaskAPI.UploadToDoList(workinfo, todoList);
    if (result.status == 200) ToastSuccess(result.messeger, '', 'top');
    else ToastError(result.messeger, '', 'top');
  };
  const updateTaskStatus = async (item, index) => {
    const indexMain = todoList.findIndex(
      (it, idx) => it.taskName == item.taskName,
    );
    await setItemTask({ ...item, index: indexMain });
    SheetManager.show('updateStatus');
  };
  const removeTask = async item => {
    await _.remove(todoList, item);
    setMutate(e => !e);
  };
  const createNewTask = () => {
    SheetManager.show('createTask');
  };
  const handlerCreate = async (type, text) => {
    let dataCreate = [];
    const items = {
      statusId: 1,
      statusName: 'Hôm nay',
      taskName: text,
      isColor: TaskAPI.colorStatus.OPEN,
      shopId: workinfo.shopId,
      taskDate: workinfo.workDate,
    };
    dataCreate = [...todoList, items];
    //
    const dataSort = await dataCreate.sort((a, b) => a.statusId >= b.statusId);
    await setTodoList(dataSort);
  };
  const handlerChooseItem = async (item, type) => {
    if (type == 'UPDATE_STATUS') {
      SheetManager.hide('updateStatus');
      todoList[itemTask.index].statusId = item.id;
      todoList[itemTask.index].statusName = item.name;
      todoList[itemTask.index].isColor = item.isColor;
      await setItemTask({
        ...itemTask,
        statusId: item.id,
        statusName: item.name,
      });
    }
    item.id !== 3 && (await LoadData());
  };
  const handlerViewReulst = async () => {
    const lstCompleted = await dataStatus.filter(i =>
      !viewResult ? i.id == 3 : i.id !== 3,
    );
    await setDataHeader(lstCompleted);
    await setViewResult(e => !e);
  };
  useEffect(() => {
    LoadData();
    return () => false;
  }, []);
  const styles = StyleSheet.create({
    mainContainer: {
      width: '100%',
      height: deviceHeight,
      backgroundColor: appcolor.light,
    },
    bottomView: { padding: 16, alignSelf: 'flex-end' },
    itemStatus: { flexDirection: 'row', margin: 3 },
    contentHeader: { width: '100%', marginTop: 8 },
    contentBody: { width: '100%', padding: 5 },
    itemText: {
      width: '80%',
      fontSize: 14,
      fontWeight: '500',
      color: appcolor.dark,
    },
    contentBottom: {
      width: '100%',
      paddingBottom: 16,
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: appcolor.light,
    },
    itemMain: {
      padding: 3,
      shadowRadius: 10,
      color: appcolor.light,
      shadowOpacity: 0.5,
      elevation: 3,
    },
  });
  const renderTaskItem = ({ item, index }) => {
    const itemPress = () => {
      updateTaskStatus(item, index);
    };
    const itemClear = () => {
      removeTask(item);
    };
    return (
      <View
        key={`pp_3${index}`}
        style={{ width: '100%', padding: 8, paddingTop: 0, paddingBottom: 0 }}
      >
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
        >
          <TouchableOpacity onPress={itemPress}>
            <View
              style={{
                borderWidth: 1,
                borderColor: appcolor.greydark,
                borderRadius: 5,
                padding: 3,
                marginEnd: 8,
              }}
            >
              <View
                style={{
                  width: 16,
                  height: 16,
                  backgroundColor: item.isColor,
                  borderRadius: 1,
                }}
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.itemText}>{item.taskName}</Text>
          {item.statusId == 1 && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                end: 0,
                paddingRight: 18,
                padding: 10,
              }}
              onPress={itemClear}
            >
              <SpiralIcon
                name="trash"
                type="font-awesome-5"
                size={16}
                color={appcolor.red}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const dataItemTask = todoList.filter(i => i.statusId == item.id) || [];
    const totalItem = dataItemTask.length || 0;
    return (
      <View key={`pp_3${index}`} style={{ width: '100%' }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            margin: 8,
            backgroundColor: item.isColor,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              padding: 8,
              color: appcolor.light,
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              ...styles.itemMain,
              backgroundColor: item.isColor,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 14,
                fontWeight: '600',
                color: appcolor.light,
              }}
            >
              {totalItem}
            </Text>
          </View>
          {item.id == 1 && (
            <TouchableOpacity
              style={{ position: 'absolute', end: 8 }}
              onPress={createNewTask}
            >
              <SpiralIcon
                name={'add'}
                size={23}
                solid={true}
                color={appcolor.light}
              />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          key={'todoList'}
          keyExtractor={(__, index) => index.toString()}
          data={dataItemTask}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        isHome
        title="To-Do List"
        leftFunc={() => navigation.goBack()}
        rightFunc={uploadTaskAction}
        middleFunc={handlerViewReulst}
        iconRight="cloud-upload-alt"
        iconLeft="times"
      />
      <FlatList
        key="taskHead"
        keyExtractor={(_, index) => index.toString()}
        data={dataHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
      <ActionSheet
        id={'createTask'}
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
      >
        <View style={{ width: '100%', padding: 5 }}>
          <Text
            numberOfLines={2}
            style={{
              textAlign: 'center',
              fontSize: scaleSize(18),
              fontWeight: '700',
              padding: 5,
              color: appcolor.dark,
            }}
          >
            Thêm mới
          </Text>
          <View style={styles.contentBottom}>
            <ItemInput
              typeFilter={'TASK_TITLE'}
              iconName="plus"
              placeholder="Nội dung công việc"
              onActionRight={handlerCreate}
            />
          </View>
        </View>
      </ActionSheet>
      <ActionSheet
        id={'updateStatus'}
        containerStyle={{ paddingBottom: insets.bottom }}
      >
        <View
          style={{
            width: '100%',
            height: deviceHeight / 5,
            padding: 5,
            alignItems: 'center',
          }}
        >
          <View style={styles.contentBody}>
            <MutipleItemSelected
              typeItem={'UPDATE_STATUS'}
              isRequire
              titleName="Trạng thái"
              dataItems={dataStatus}
              defaultValue={itemTask.statusName}
              onItemChoose={handlerChooseItem}
            />
          </View>
        </View>
      </ActionSheet>
    </View>
  );
};
const ItemInput = ({
  onActionRight,
  typeFilter,
  itemValue,
  placeholder,
  onChangeText,
  keyboardType = 'default',
  iconName,
}) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [textValue, setTextValue] = useState(itemValue);
  const widthItem = onActionRight !== undefined ? '80%' : '100%';
  const styles = StyleSheet.create({
    mainItem: { flexGrow: 1, padding: 8, marginBottom: 1 },
    titleHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '600',
      color: appcolor.blacklight,
      marginStart: 8,
    },
    placeholderHeader: {
      width: '100%',
      fontSize: 13,
      fontWeight: '300',
      color: appcolor.placeholderText,
      marginStart: 8,
      marginBottom: 8,
      fontStyle: 'italic',
    },
    inputView: {
      width: widthItem,
      backgroundColor: appcolor.light,
      borderRadius: 5,
      marginBottom: 0,
    },
  });
  const onPress = async () => {
    if (!isValid(textValue)) {
      alertWarning('Vui lòng nhập tên công việc');
      return;
    }
    await onActionRight(typeFilter, textValue);
    await setTextValue(null);
  };
  const handlerChangeValue = text => {
    itemValue = text;
    setTextValue(text);
    onChangeText !== undefined && onChangeText(text, typeFilter);
  };
  return (
    <View style={styles.mainItem}>
      <View
        style={{ width: '100%', flexDirection: 'row', alignItems: 'center' }}
      >
        <FormGroup
          nonBorder
          iconName={iconName}
          iconColor={appcolor.blacklight}
          placeholder={placeholder}
          keyboardType={keyboardType}
          containerStyle={styles.inputView}
          editable
          multiline
          useClearAndroid={false}
          value={textValue}
          defaultValue={itemValue}
          handleChangeForm={handlerChangeValue}
          onSubmitEditing={onPress}
        />
        {onActionRight !== undefined && (
          <TouchableOpacity
            style={{
              padding: 8,
              marginStart: 8,
              width: '18%',
              alignItems: 'center',
              backgroundColor: appcolor.yellowdark,
              borderRadius: 5,
            }}
            onPress={onPress}
          >
            <Text
              style={{ fontSize: 14, fontWeight: '500', color: appcolor.dark }}
            >
              Thêm
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
