import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  ScrollView,
  Modal,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { deviceWidth } from '../../Themes/AppsStyle';
import { ListItem, Button, Divider, Icon } from '@rneui/themed';
import {
  downloadFile,
  openFileViewer,
  checkFileExist,
  alertNotify,
  alertError,
} from '../../Core/Utility';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import { TouchableOpacity } from 'react-native';
import WebView from 'react-native-webview';
import { URLDEFAULT } from '../../Core/URLs';
import { cleanURL } from '../../Core/Helper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import WebViewUI from '../../Content/WebViewUI';
import WebViewScreen from '../../Control/Webview/WebViewScreen';
import CustomListView from '../../Control/Custom/CustomListView';

const DocSupport = '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt';
const MediaSupport = '.png,.jpeg,.jpg,.webp,.mp4,.mp3,';
export const DocumentList = ({ navigation, route }) => {
  const appcolor = useSelector(state => state.GAppState.appcolor);
  const [data, setData] = useState([]);
  const [_, setMutate] = useState(false);
  const [viewFile, setViewFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(true);
  const loadData = async () => {
    await setRefreshing(true);
    try {
      let _data = route.params?.documentData || [];
      for (let i = 0, lenData = _data.length; i < lenData; ++i) {
        const filePath = await JSON.parse(_data[i].FilePath);
        if (Array.isArray(filePath)) {
          for (let j = 0, lenFilePath = filePath.length; j < lenFilePath; ++j) {
            filePath[j].downloadUrl =
              filePath[j].downloadUrl || filePath[j].Url;
            const { status, path } = await checkFileExist(filePath[j]);
            filePath[j].isExist = status;
            if (status) filePath[j].Url = path;
          }
        }
        _data[i].filePath = JSON.stringify(filePath);
      }
      setData(_data);
    } catch (e) {
      console.log('Load Error: ' + e);
    }
    await setRefreshing(false);
  };
  const onDownloadFile = async (item, parentIndex, childIndex) => {
    setIsLoading(true);
    try {
      const fileDownload = { ...item, Url: item.downloadUrl || item.Url };
      const { status, path } = await downloadFile(fileDownload);
      const filePath = await JSON.parse(data[parentIndex].filePath);
      if (status && Array.isArray(filePath)) {
        filePath[childIndex].isExist = true;
        filePath[childIndex].Url = path;
        filePath[childIndex].downloadUrl = fileDownload.Url;
        data[parentIndex].filePath = JSON.stringify(filePath);
        alertNotify('Tải về thành công');
        setMutate(e => !e);
      } else {
        alertError('Tải về thất bại!');
      }
    } catch (e) {
      console.log('Download Error: ' + e);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    const _load = loadData();
    return () => _load;
  }, []);
  const openFile = async localPath => {
    await setIsLoading(true);
    try {
      openFileViewer(localPath.Url || '', () => {
        console.log(localPath);
      });
    } catch (e) {
      console.log(e);
    }
    await setIsLoading(false);
  };
  const itemFile = (jsonFile, parentIndex, blockDownload) => {
    let files = JSON.parse(jsonFile);
    let vFiles = [];
    if (Array.isArray(files)) {
      files.forEach((item, childIndex) => {
        vFiles.push(
          <View
            key={childIndex}
            style={{ marginRight: 5, alignContent: 'center' }}
          >
            <Button
              onPress={() =>
                onViewDoc(item, parentIndex, childIndex, blockDownload)
              }
              titleStyle={{ fontSize: 12, color: appcolor.tomato }}
              buttonStyle={{ borderRadius: 5, borderColor: appcolor.tomato }}
              icon={
                <SpiralIcon
                  name="eye"
                  size={14}
                  type="font-awesome"
                  color={appcolor.tomato}
                />
              }
              title={`Xem ${item.FileType}`}
              type="outline"
            />
            <Text>{item.createDate}</Text>
          </View>,
        );
      });
    }
    return vFiles;
  };
  const setViewFileData = (
    urlPage,
    item,
    parentIndex,
    childIndex,
    blockDownload,
  ) => {
    const fileBlockDownload = blockDownload;
    setViewFile({
      urlPage,
      item,
      parentIndex,
      childIndex,
      isDownloadFile: Number(fileBlockDownload) === 0,
    });
  };
  const onViewDoc = (item, parentIndex, childIndex, blockDownload) => {
    setIsLoading(true);
    if (!item.Url.includes('http') && DocSupport.includes(item.FileType)) {
      const googleUrl = `https://docs.google.com/gview?embedded=true&url=${URLDEFAULT}${item.Url}`;
      const UrlClean = cleanURL(googleUrl);
      setViewFileData(UrlClean, item, parentIndex, childIndex, blockDownload);
    } else if (
      !item.Url.includes('http') &&
      MediaSupport.includes(item.FileType)
    ) {
      const UrlClean = cleanURL(`${URLDEFAULT}${item.Url}`);
      // console.log(UrlClean,"a")
      setViewFileData(UrlClean, item, parentIndex, childIndex, blockDownload);
    } else if (item.Url.includes('http')) {
      setViewFileData(item.Url, item, parentIndex, childIndex, blockDownload);
    } else {
      ToastError('Chưa hỗ trợ', 'Chưa có định dạng hỗ trợ xem file');
    }
  };
  const renderRow = ({ item, index }) => {
    return (
      <ListItem
        key={index}
        containerStyle={{ backgroundColor: appcolor.light, borderRadius: 8 }}
      >
        <ListItem.Content>
          {index !== 0 && (
            <Divider
              style={{
                backgroundColor: appcolor.light,
                width: deviceWidth + 100,
                height: 0.7,
                marginBottom: 5,
              }}
            />
          )}
          <ListItem.Title style={{ color: appcolor.dark }}>{`${index + 1}/ ${
            item.DocumentName
          }`}</ListItem.Title>
          <ListItem.Subtitle
            style={{ color: appcolor.dark, fontStyle: 'italic' }}
          >
            {item.Description}
          </ListItem.Subtitle>
          <ScrollView horizontal={true}>
            <View
              style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'flex-end',
              }}
            >
              {itemFile(item.filePath, index, item.BlockDownload)}
            </View>
          </ScrollView>
        </ListItem.Content>
      </ListItem>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <HeaderCustom
        title={route?.params?.titlePage || 'Tài liệu'}
        leftFunc={() => navigation.goBack()}
      />
      <View style={{ flex: 1, margin: 8 }}>
        <View style={{ flex: 1 }}>
          <CustomListView data={data} renderItem={renderRow} />
        </View>
      </View>
      <Modal
        visible={viewFile !== null ? true : false}
        animationType="slide"
        statusBarTranslucent
      >
        <SafeAreaProvider>
          <WebViewScreen
            isConfirmExits={false}
            pageName={route?.params?.titlePage}
            urlPage={viewFile?.urlPage}
            isDownloadFile={viewFile?.isDownloadFile}
            onDownloadFile={() =>
              onDownloadFile(
                viewFile?.item,
                viewFile?.parentIndex,
                viewFile?.childIndex,
              )
            }
            onClose={() => setViewFile(null)}
          />
        </SafeAreaProvider>
      </Modal>
    </View>
  );
};
