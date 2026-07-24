import React, { useEffect, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Platform,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { TaskAPI } from '../../API/TaskAPI';
import { deviceHeight } from '../../Core/Utility';
import { Icon, Text } from '@rneui/themed';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { groupDataByKey } from '../../Core/Helper';
import moment from 'moment';
import { LoadingView } from '../../Control/ItemLoading';
import SpiralIcon from '../../Control/Icon/SpiralIcon';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const AllTodoList = ({ navigation }) => {
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
  const [loading, setLoading] = useState(false);
  const [mutate, setMutate] = useState(false);
  const LoadData = async () => {
    await setLoading(true);
    const allListTodo = await TaskAPI.ToDoListAll();
    await setTodoList(allListTodo);
    await TaskAPI.TaskStatus(async mData => {
      await setDataHeader(mData.filter(i => i.id !== 3));
      await setDataStatus(mData);
    });
    await setLoading(false);
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
    itemMain: { padding: 3, color: appcolor.light },
  });
  const renderTaskItem = ({ item, index }) => {
    return (
      <View
        key={`pp_3${index}`}
        style={{ width: '100%', padding: 8, paddingTop: 0, paddingBottom: 0 }}
      >
        {item.isParent && (
          <View
            style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
          >
            <Text style={styles.itemText}>
              {moment(item.taskDate.toString()).format('YYYY-MM-DD')}
            </Text>
          </View>
        )}
        <View
          style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}
        >
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
          <Text style={styles.itemText}>{item.taskName}</Text>
        </View>
      </View>
    );
  };
  const renderItem = ({ item, index }) => {
    const idHeader = item.id;
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
        </View>
        <FlatList
          key={'todoList'}
          keyExtractor={(__, index) => index.toString()}
          data={todoList}
          renderItem={({ item, index }) => (
            <RenderItemShop item={item} index={index} idHeader={idHeader} />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };
  const handleShowItem = async item => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (item.isShow) {
      item.isShow = false;
    } else {
      item.isShow = true;
    }
    setMutate(e => !e);
  };
  const RenderItemShop = ({ item, index, idHeader }) => {
    const dataItemTask = JSON.parse(item.dataTask || []).filter(
      i => i.statusId == idHeader,
    );
    const { arr } = groupDataByKey({
      arr: dataItemTask,
      key: 'taskDate',
    });
    const totalItem = dataItemTask.length || 0;
    return (
      <View key={`Shop_${index}`} style={{ width: '100%' }}>
        {totalItem > 0 && (
          <TouchableOpacity onPress={() => handleShowItem(item)}>
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
                  fontSize: 16,
                  fontWeight: '800',
                  padding: 8,
                  color: appcolor.dark,
                }}
              >
                {item.shopName}
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
                    fontSize: 16,
                    fontWeight: '600',
                    color: appcolor.dark,
                  }}
                >
                  {totalItem}
                </Text>
              </View>
              <View
                style={{
                  position: 'absolute',
                  end: 8,
                  width: 30,
                  height: 30,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  name={item.isShow ? 'chevron-down' : 'chevron-right'}
                  type={'font-awesome-5'}
                  size={15}
                  solid={true}
                  color={appcolor.dark}
                />
              </View>
            </View>
          </TouchableOpacity>
        )}
        {totalItem > 0 && item.isShow && (
          <FlatList
            key={'dataItemTask'}
            keyExtractor={(__, index) => index.toString()}
            data={arr}
            renderItem={renderTaskItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    );
  };
  return (
    <View style={styles.mainContainer}>
      <HeaderCustom
        isHome
        title="To-Do List"
        leftFunc={() => navigation.goBack()}
        // rightFunc={uploadTaskAction}
        middleFunc={handlerViewReulst}
        iconRight="cloud-upload-alt"
        iconLeft="times"
      />
      <LoadingView isLoading={loading} title="Đang cập nhật dữ liệu" />
      <FlatList
        key="taskHead"
        keyExtractor={(_, index) => index.toString()}
        data={dataHeader}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={LoadData} />
        }
      />
    </View>
  );
};
