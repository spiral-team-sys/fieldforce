import React, { useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TextInput,
  FlatList,
  Keyboard,
  Image,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  getUploadDisplayCompetitorResult,
  getStatusCompetitorResult,
  uploadDataDisplayCompe,
  getPhotosByGuiId,
} from '../../../Controller/WorkController';
import { checkNetwork, ConvertToInt } from '../../../Core/Utility';
import {
  groupDataByKey,
  Message,
  MessageInfo,
  ToastError,
  UUIDGenerator,
} from '../../../Core/Helper';
import { URLDEFAULT, _competitorId } from '../../../Core/URLs';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import NumberFormat from 'react-number-format';
import {
  getListByCompetitorMD,
  updateDisplayCompetitor,
} from '../../../Controller/DisplayController';

import { Tabs, MaterialTabBar } from 'react-native-collapsible-tab-view';
import { PhotoItems } from '../../EPSON/PhotoItems';
import { deviceWidth } from '../../Home';
import FormGroup from '../../../Content/FormGroup';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import moment from 'moment';

import { IssueReportUpload } from '../../../Controller/IssueController';
import { IconAnimation } from '../../../Control/IconAnimation/IconAnimation';
import NativeCamera from '../../../Control/NativeCamera';
import { deletePhoto } from '../../../Controller/PhotoController';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

// employeeId
// employeeName
// employeeNote
// noteDate
// noteStatus
// noteFeedBack

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ViewListComment = ({ itemSelect, data }) => {
  const insets = useSafeAreaInsets();
  const { appcolor, workinfo, kpiinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [dataComment, setDataComment] = useState([]);
  const reportItem = JSON.parse(kpiinfo?.reportItem || '{}');
  const [reload, setReload] = useState(false);
  const [Status, setStatus] = useState(false);
  const [lstShow, setLstShow] = useState();
  const [_, setMutate] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [noteStatus, setNoteStatus] = useState({});
  const [itemAnswer, setItemAnswer] = useState({});
  const [showItemAnswer, setShowAnswer] = useState(false);
  const [itemAnswer2, setItemAnswer2] = useState({});
  const [isSend, setSend] = useState(false);
  const [selectStatus, setSelectStatus] = useState({});
  const [isShowStatus, setShowStatus] = useState(false);
  const [newGuiId, setNewGuiId] = useState('');
  const [listNewImage, setListNewImage] = useState([]);

  const loadDataShow = () => {
    const listComment = JSON.parse(itemSelect.itemIssue?.issueComments || '[]');
    setDataComment(listComment);
    setNewGuiId(UUIDGenerator());
  };

  useEffect(() => {
    loadDataShow();
    return () => false;
  }, [reload]);

  const handleOnChangeNote = text => {
    setNewComment(text);
  };
  const handleSendComment = async type => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (newComment === '') {
      MessageInfo('Bạn chưa điền thông tin cập nhật mới!');
      return;
    }
    // if (newComment.length < 5) {
    //     MessageInfo('Thông tin nhập vào tối thiểu 5 kí tự!')
    //     return
    // }

    const itemStatus =
      noteStatus.id !== undefined
        ? noteStatus
        : data.dataTab?.find(it => it.id == itemSelect?.itemIssue?.issueStatus);
    let dataUpload = {};
    if (type == 'NEW') {
      let jphoto = [];
      if (listNewImage.length > 0) {
        listNewImage?.forEach(element => {
          let ImgName = element.photoPath.substring(
            element.photoPath.lastIndexOf('/') + 1,
            element.photoPath.length,
          );
          let fileName = '/uploaded/' + element.photoDate + '/' + ImgName;
          jphoto.push({ ...element, photoPath: fileName });
        });
      }
      dataUpload = {
        employeeId: userinfo.employeeId,
        employeeName: userinfo.employeeName,
        employeePhoto: userinfo.photo || null,
        noteContent: newComment,
        noteDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        noteStatus:
          selectStatus.id !== undefined
            ? selectStatus.id
            : itemSelect?.itemIssue?.issueStatus == 1
              ? 2
              : itemSelect?.itemIssue?.issueStatus,
        guiid: newGuiId,
        status: 1,
        noteFeedBack: '[]',
        imageComment: jphoto,
      };
      const listNew = [...dataComment, dataUpload];
      const indexDataM = data.dataMain.findIndex(
        it => it.guiid === itemSelect.itemIssue.guiid,
      );
      const indexDataS = data.dataShow.findIndex(
        it => it.guiid === itemSelect.itemIssue.guiid,
      );
      const dataNew = {
        ...itemSelect.itemIssue,
        issueComments: JSON.stringify(listNew),
        issueStatus: dataUpload.noteStatus,
        typeSend: 'ANSWER',
      };
      data.dataMain[indexDataM] = dataNew;
      data.dataMain[indexDataS] = dataNew;
      itemSelect.itemIssue = dataNew;

      await setSend(true);
      await IssueReportUpload(dataNew, workinfo, null, async result => {
        if (result.statusId === 200) {
          setNewComment('');
          setShowAnswer(false);
          setItemAnswer({});
          setDataComment(listNew);
          setListNewImage([]);
          setSend(false);
          setNewGuiId(UUIDGenerator());
        } else {
          setSend(false);
          MessageInfo(result.messager, 'Lỗi', 'top');
        }
      });
    } else if (type == 'ANSWER') {
      let listComment = [...dataComment];
      let jphotoA = [];
      if (listNewImage.length > 0) {
        listNewImage?.forEach(element => {
          let ImgName = element.photoPath.substring(
            element.photoPath.lastIndexOf('/') + 1,
            element.photoPath.length,
          );
          let fileName = '/uploaded/' + element.photoDate + '/' + ImgName;
          jphotoA.push({ ...element, photoPath: fileName });
        });
      }
      const itemAnswerNew = {
        employeeId: userinfo.employeeId,
        employeeName: userinfo.employeeName,
        employeePhoto: userinfo.photo || null,
        answerContent: newComment,
        answerDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        guiidNote: itemAnswer.guiid,
        guiidAnswer: newGuiId,
        status: 1,
        imageAnswer: jphotoA,
      };
      let noteFeedBackNew = JSON.parse(itemAnswer.noteFeedBack || '[]');
      noteFeedBackNew = [...noteFeedBackNew, itemAnswerNew];
      listComment.forEach(it => {
        if (it.guiid == itemAnswer.guiid) {
          it.noteFeedBack = JSON.stringify(noteFeedBackNew);
        }
      });
      const indexDataM = data.dataMain.findIndex(
        it => it.guiid === itemSelect.itemIssue.guiid,
      );
      const indexDataS = data.dataShow.findIndex(
        it => it.guiid === itemSelect.itemIssue.guiid,
      );
      data.dataMain[indexDataM].issueComments = JSON.stringify(listComment);
      data.dataMain[indexDataS].issueComments = JSON.stringify(listComment);
      itemSelect.itemIssue.issueComments = JSON.stringify(listComment);
      const dataAnswer = {
        ...itemSelect.itemIssue,
        typeSend: 'ANSWER',
      };
      await setSend(true);
      await IssueReportUpload(dataAnswer, workinfo, null, async result => {
        if (result.statusId === 200) {
          setNewComment('');
          setShowAnswer(false);
          setItemAnswer({});
          setItemAnswer2({});
          setListNewImage([]);
          setDataComment(listComment);
          setNewGuiId(UUIDGenerator());
          setSend(false);
        } else {
          setSend(false);
          MessageInfo(result.messager, 'Lỗi', 'top');
        }
      });
    }
  };

  const renderItemComment = (item, index) => {
    console.log(item.employeeName, 'itemitemitemitem');
  };
  const handleSelectAnswer = (item, level, item2) => {
    if (level == 1) {
      setItemAnswer(item);
      setShowAnswer(true);
    } else if (level == 2) {
      setItemAnswer(item);
      setItemAnswer2(item2);
      setShowAnswer(true);
    }
  };
  const handleCancelAnswer = type => {
    if (type == 'STATUS') {
      setShowStatus(false);
      setSelectStatus({});
    } else {
      setItemAnswer({});
      setShowAnswer(false);
    }
  };
  const RenderAnswerItem = ({ item, index }) => {
    const listByItem = JSON.parse(item.noteFeedBack || '[]');
    return (
      <View>
        <ScrollView nestedScrollEnabled>
          {listByItem?.length > 0 &&
            listByItem?.map((it, idx) => {
              const imageAnswer = it.imageAnswer;
              return (
                it.status == 1 && (
                  <View
                    key={'itemAnswer_' + idx}
                    style={{ padding: 5, paddingLeft: 35 }}
                  >
                    <View
                      style={{
                        backgroundColor: appcolor.surface,
                        borderRadius: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          padding: 5,
                          backgroundColor: appcolor.surface,
                          borderRadius: 12,
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            height: 25,
                            width: 25,
                            borderRadius: 40,
                            backgroundColor: appcolor.white,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <SpiralIcon
                            color={appcolor.dark}
                            name="user"
                            type="font-awesome-5"
                            size={14}
                          />
                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 12,
                              color: appcolor.dark,
                            }}
                          >
                            {it.employeeName}
                          </Text>
                          <Text
                            style={{
                              fontWeight: '400',
                              fontSize: 11,
                              color: appcolor.dark,
                            }}
                          >
                            {it.answerContent}
                          </Text>
                        </View>
                      </View>

                      {imageAnswer.length > 0 && (
                        <ScrollView
                          horizontal
                          style={{ height: 60, marginLeft: 10, padding: 5 }}
                        >
                          {imageAnswer?.map((it, idx) => {
                            return (
                              <View
                                key={'itemImage_' + idx}
                                style={{
                                  height: 50,
                                  width: 50,
                                  marginRight: 2,
                                }}
                              >
                                <Image
                                  source={{
                                    uri: it.photoPath.includes('uploaded')
                                      ? URLDEFAULT + it.photoPath
                                      : it.photoPath || '',
                                  }}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 8,
                                    backgroundColor: appcolor.grayLight,
                                  }}
                                />
                              </View>
                            );
                          })}
                          <View style={{ height: deviceWidth }}></View>
                        </ScrollView>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingLeft: 10,
                        paddingTop: 6,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '400',
                          color: appcolor.dark,
                          fontSize: 11,
                        }}
                      >
                        {moment(it.answerDate, 'YYYY-MM-DD HH:mm:ss').fromNow()}
                      </Text>
                      <View>
                        <TouchableOpacity
                          onPress={() => handleSelectAnswer(item, 2, it)}
                          style={{ borderRadius: 3 }}
                        >
                          <Text
                            style={{
                              fontWeight: '400',
                              fontSize: 12,
                              color: appcolor.dark,
                              paddingLeft: 10,
                            }}
                          >
                            Phản hồi
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )
              );
            })}
        </ScrollView>
      </View>
    );
  };

  const handleSelectStatus = item => {
    if (selectStatus.id == item.id) {
      setShowStatus(false);
      setSelectStatus({});
    } else {
      isShowStatus == false && setShowStatus(true);
      setSelectStatus(item);
    }
    SheetManager.hide('sheetMenuStatus');
  };

  const renderItemStatus = (item, index) => {
    return (
      <TouchableOpacity
        key={'itemStatus_' + index}
        onPress={() => handleSelectStatus(item)}
        style={{
          padding: 6,
          flexDirection: 'row',
          alignItems: 'center',
          paddingLeft: 20,
        }}
      >
        <SpiralIcon
          color={
            selectStatus.id !== undefined && selectStatus.id == item.id
              ? appcolor.primary
              : appcolor.dark
          }
          name={
            selectStatus.id !== undefined && selectStatus.id == item.id
              ? 'check-square'
              : 'square'
          }
          type="font-awesome-5"
          size={22}
        />
        <Text
          style={{
            fontWeight: '400',
            fontSize: 15,
            color:
              selectStatus.id !== undefined && selectStatus.id == item.id
                ? appcolor.primary
                : appcolor.dark,
            paddingHorizontal: 10,
          }}
        >
          {item.nameVN}
        </Text>
      </TouchableOpacity>
    );
  };

  const takePhoto = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      photoType: 'ISSUE_REPORT',
      dataUpload: 0,
      fileUpload: 0,
      photoPath: null,
      shopLat: null,
      shopLong: null,
      guid: newGuiId,
      photoFullTime: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
    };
    await NativeCamera.cameraStart(photoinfo, loadNewImage);
  };
  const loadNewImage = async () => {
    await setSend(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const dataPhoto = await getPhotosByGuiId(newGuiId, workinfo.shopId);
    await setListNewImage(dataPhoto);
    await setSend(false);
  };
  const uploadFilePhoto = async () => {
    const photoinfo = {
      shopId: workinfo.shopId,
      shopCode: workinfo.shopCode,
      reportId: kpiinfo.kpiId,
      photoDate: workinfo.workDate,
      photoTime: new Date().getTime(),
      fileUpload: 0,
      dataUpload: 0,
      photoPath: null,
      photoType: 'ISSUE_REPORT',
      guid: newGuiId,
      photoFullTime: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'),
    };
    await NativeCamera.imageGalleryLaunch(photoinfo, loadNewImage);
  };

  const onDeletePhoto = async itemPhoto => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    !itemPhoto.photoPath.includes('uploaded') && (await deletePhoto(itemPhoto));
    const listAfterDelete = await listNewImage.filter(
      it => it.photoPath !== itemPhoto.photoPath,
    );
    await setListNewImage(listAfterDelete);
  };
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: appcolor.light,
        justifyContent: 'space-between',
      }}
    >
      <View
        style={{
          width: '100%',
          height: listNewImage.length > 0 ? '65%' : '75%',
        }}
      >
        {dataComment?.length == 0 && (
          <View
            style={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 20,
                color: appcolor.primary,
              }}
            >
              Chưa có thông tin
            </Text>
          </View>
        )}
        <ScrollView nestedScrollEnabled style={{}}>
          {dataComment?.length > 0 &&
            dataComment?.map((it, idx) => {
              const nameStatus = data.dataTab.find(
                itT => itT.id == it.noteStatus,
              )?.nameVN;
              // console.log(it, 'ititititit');
              const imageComment = it.imageComment;
              return (
                it.status == 1 && (
                  <View
                    key={'itemComment_' + idx}
                    style={{ padding: 5, paddingLeft: 15 }}
                  >
                    <View
                      style={{
                        backgroundColor: appcolor.surface,
                        borderRadius: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          padding: 5,
                          backgroundColor: appcolor.surface,
                          borderRadius: 12,
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{
                            height: 40,
                            width: 40,
                            borderRadius: 40,
                            backgroundColor: appcolor.white,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <SpiralIcon
                            color={appcolor.dark}
                            name="user"
                            type="font-awesome-5"
                            size={14}
                          />
                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                          <Text
                            style={{
                              fontWeight: '600',
                              fontSize: 14,
                              color: appcolor.dark,
                            }}
                          >
                            {it.employeeName}
                          </Text>
                          <Text
                            style={{
                              fontWeight: '400',
                              fontSize: 11,
                              color: appcolor.dark,
                            }}
                          >
                            {it.noteContent}
                          </Text>
                        </View>
                      </View>
                      {imageComment.length > 0 && (
                        <ScrollView
                          horizontal
                          style={{ height: 60, marginLeft: 10, padding: 5 }}
                        >
                          {imageComment?.map((it, idx) => {
                            return (
                              <View
                                key={'itemImage_' + idx}
                                style={{
                                  height: 50,
                                  width: 50,
                                  marginRight: 2,
                                }}
                              >
                                <Image
                                  source={{
                                    uri: it.photoPath.includes('uploaded')
                                      ? URLDEFAULT + it.photoPath
                                      : it.photoPath || '',
                                  }}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 8,
                                    backgroundColor: appcolor.grayLight,
                                  }}
                                />
                              </View>
                            );
                          })}
                          <View style={{ height: deviceWidth }}></View>
                        </ScrollView>
                      )}
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        paddingLeft: 10,
                        paddingTop: 6,
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: '400',
                          color: appcolor.dark,
                          fontSize: 11,
                        }}
                      >
                        {moment(it.noteDate, 'YYYY-MM-DD HH:mm:ss').fromNow()}
                      </Text>
                      <View>
                        <TouchableOpacity
                          onPress={() => handleSelectAnswer(it, 1)}
                          style={{ borderRadius: 3 }}
                        >
                          <Text
                            style={{
                              fontWeight: '400',
                              fontSize: 11,
                              color: appcolor.dark,
                              paddingLeft: 10,
                            }}
                          >
                            Phản hồi
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 10,
                          color: appcolor.dark,
                        }}
                      >
                        {' '}
                        | {nameStatus}
                      </Text>
                    </View>
                    <RenderAnswerItem item={it} index={idx} />
                  </View>
                )
              );
            })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{
          justifyContent: 'center',
          width: '100%',
          height: listNewImage.length > 0 ? '35%' : '25%',
        }}
        behavior={Platform.OS == 'ios' ? 'padding' : null}
      >
        <View style={{ marginBottom: 40, backgroundColor: appcolor.light }}>
          {listNewImage.length > 0 && (
            <View
              style={{
                height: 70,
                width: deviceWidth,
                backgroundColor: appcolor.light,
                borderTopWidth: 1,
                borderTopColor: appcolor.grayLight,
              }}
            >
              <ScrollView horizontal style={{ height: 70, padding: 5 }}>
                {listNewImage?.map((it, idx) => {
                  return (
                    <View
                      key={'itemImage_' + idx}
                      style={{ height: 60, width: 60, marginRight: 2 }}
                    >
                      <Image
                        source={{ uri: it.photoPath }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          backgroundColor: appcolor.surface,
                        }}
                      />
                      <TouchableOpacity
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          backgroundColor: appcolor.danger,
                        }}
                        onPress={() => onDeletePhoto(it)}
                      >
                        <SpiralIcon
                          color={appcolor.white}
                          name="times"
                          type="font-awesome-5"
                          size={12}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <View style={{ height: deviceWidth }}></View>
              </ScrollView>
            </View>
          )}

          <View
            style={{
              height: 0.6,
              width: deviceWidth,
              backgroundColor: appcolor.grayLight,
            }}
          />
          {showItemAnswer && (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}
            >
              <Text
                style={{
                  fontWeight: '300',
                  color: appcolor.dark,
                  fontSize: 12,
                  paddingLeft: 10,
                }}
              >
                Đang phản hồi{' '}
                {
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 10,
                      color: appcolor.dark,
                    }}
                  >
                    {itemAnswer.employeeName}
                  </Text>
                }{' '}
                |
              </Text>
              <TouchableOpacity
                onPress={() => handleCancelAnswer()}
                style={{ paddingHorizontal: 5 }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    color: appcolor.info,
                    fontSize: 12,
                  }}
                >
                  Huỷ
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isShowStatus && (
            <View
              style={{ flexDirection: 'row', alignItems: 'center', padding: 5 }}
            >
              <Text
                style={{
                  fontWeight: '300',
                  color: appcolor.dark,
                  fontSize: 12,
                  paddingLeft: 10,
                }}
              >
                Trạng thái mới :{' '}
                {
                  <Text
                    style={{
                      fontWeight: '600',
                      fontSize: 10,
                      color: appcolor.dark,
                    }}
                  >
                    {selectStatus.nameVN}
                  </Text>
                }{' '}
                |
              </Text>
              <TouchableOpacity
                onPress={() => handleCancelAnswer('STATUS')}
                style={{ paddingHorizontal: 5 }}
              >
                <Text
                  style={{
                    fontWeight: '500',
                    color: appcolor.info,
                    fontSize: 12,
                  }}
                >
                  Huỷ
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View
            style={{
              backgroundColor: appcolor.grayLight,
              borderRadius: 15,
              margin: 5,
              minHeight: 35,
            }}
          >
            <FormGroup
              multiline={true}
              selectTextOnFocus={true}
              containerStyle={{
                backgroundColor: appcolor.grayLight,
                minHeight: 30,
                padding: 3,
                borderRadius: 50,
                marginBottom: 0,
                borderWidth: 0.5,
                borderColor: appcolor.transparent,
              }}
              inputStyle={{
                fontSize: 13,
                color: appcolor.dark,
                borderColor: appcolor.transparent,
              }}
              placeholder="Nhập thông tin trạng thái..."
              editable={true}
              onClearTextAndroid={() => handleOnChangeNote('')}
              handleChangeForm={text => handleOnChangeNote(text)}
              defaultValue={newComment || ''}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              width: deviceWidth,
              height: 45,
              justifyContent: 'space-between',
              padding: 6,
              paddingHorizontal: 15,
              backgroundColor: appcolor.light,
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() =>
                  showItemAnswer ? null : SheetManager.show('sheetMenuStatus')
                }
                style={{
                  padding: 3,
                  paddingHorizontal: 10,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  name="stream"
                  type="font-awesome-5"
                  size={22}
                  color={appcolor.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => uploadFilePhoto()}
                style={{
                  borderRadius: 5,
                  padding: 3,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  name="image"
                  type="font-awesome-5"
                  size={22}
                  color={appcolor.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => takePhoto()}
                style={{
                  borderRadius: 5,
                  padding: 3,
                  paddingHorizontal: 10,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <SpiralIcon
                  name="camera"
                  type="font-awesome-5"
                  size={22}
                  color={appcolor.primary}
                />
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                onPress={() =>
                  isSend
                    ? null
                    : handleSendComment(showItemAnswer ? 'ANSWER' : 'NEW')
                }
                style={{ padding: 3 }}
              >
                {isSend ? (
                  <SpiralIconAnimation
                    isLoop={isSend}
                    sourceIcon={require('../../../Themes/lotties/sync_load.json')}
                  />
                ) : (
                  <SpiralIcon
                    name="paper-plane"
                    type="font-awesome-5"
                    size={22}
                    color={appcolor.primary}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* paper-plane */}
          </View>
        </View>
      </KeyboardAvoidingView>
      <ActionSheet
        id="sheetMenuStatus"
        statusBarTranslucent
        gestureEnabled
        containerStyle={{
          backgroundColor: appcolor.light,
          paddingBottom: insets.bottom,
        }}
        drawUnderStatusBar={Platform.OS == 'ios'}
        closable={true}
      >
        <View style={{ minHeight: 300, maxHeight: 450, width: deviceWidth }}>
          <ScrollView nestedScrollEnabled>
            {data.dataTab?.map((it, idx) => {
              return it.id !== 1 && renderItemStatus(it, idx);
            })}
          </ScrollView>
        </View>
      </ActionSheet>
    </View>
  );
};

export default ViewListComment;
