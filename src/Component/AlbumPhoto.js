import React, { createRef, PureComponent } from "react"
import { View, ImageBackground, Animated, Easing, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Icon } from '@rneui/themed';
import { getPhotosReport, getPhotosReportByPhototype, getPhotosReportByGuiId, getPhotosByGuiId, getPhotosPOP } from '../Controller/WorkController'
import { DeleteItem, Store } from "../Core/SqliteDbContext";
import { uploadAllDataPhoto } from "../Controller/PhotoController";
import { HeaderCustom } from "../Content/HeaderCustom";
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
//import { AppCreateAction } from '../Core/ReduxController';
import ActionSheet from "react-native-actions-sheet";
import { MultipleShowImage } from "../Control/MultipleShowImage";
class AlbumPhoto extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            detailInfo: this.props.route.params,
            lstShow: [],
            isHiddenButton: false,
            iconSize: new Animated.Value(60),
            isAnimatingIcon: false,
            reloadView: false,
            imageIndex: 0
        }
        this.ref_imageSheet = createRef()
        this.animatedValue = new Animated.Value(0)
    }
    componentDidMount() {
        this.loadData();
        this._unsubscribe = this.props.navigation.addListener('focus', (res) => {
            this.loadData();
        });
    }
    refreshView = () => {
        this.loadData();
        this.forceUpdate();
    }
    loadData = async () => {
        //console.log(this.state.detailInfo, 'this.state.detailInfo')
        if (this.state.detailInfo.photoType === 'KTV') {
            let lstPhotos = await getPhotosReportByPhototype(this.state.detailInfo.photoType, this.state.detailInfo.shopId, this.state.detailInfo.photoDate);
            let lstUpload = lstPhotos?.filter(item => item.fileUpload === 0);
            this.setState({
                lstShow: lstPhotos?.map((ele, i) => {
                    return (this.state.lstShow?.length === 0) ? { ...ele, isDelete: false } : { ...ele, isDelete: this.state.isAnimatingIcon };
                }),
                isHiddenButton: lstUpload?.length > 0 ? false : true
            })
        }
        else {

            if (this.state.detailInfo.reportId == 4 || this.state.detailInfo.reportId == 18 || this.state.detailInfo.reportId == 6 || this.state.detailInfo.reportId == 0) {
                let lstPhotos = await getPhotosReportByGuiId(this.state.detailInfo.reportId, this.state.detailInfo.guiId, this.state.detailInfo.shopId, this.state.detailInfo.photoDate);
                let lstUpload = lstPhotos?.filter(item => item.fileUpload === 0);
                this.setState({
                    lstShow: lstPhotos?.map((ele, i) => {
                        return (this.state.lstShow?.length === 0) ? { ...ele, isDelete: false } : { ...ele, isDelete: this.state.isAnimatingIcon };
                    }),
                    isHiddenButton: lstUpload?.length > 0 ? false : true
                })
            }
            else if (this.state.detailInfo.reportId == -2) {
                let lstPhotos = await getPhotosByGuiId(this.state.detailInfo.guiId, this.state.detailInfo.shopId);
                let lstUpload = lstPhotos?.filter(item => item.fileUpload === 0);
                this.setState({
                    lstShow: lstPhotos?.map((ele, i) => {
                        return (this.state.lstShow.length === 0) ? { ...ele, isDelete: false } : { ...ele, isDelete: this.state.isAnimatingIcon };
                    }),
                    isHiddenButton: lstUpload?.length > 0 ? false : true
                })
            }
            else if (this.state.detailInfo.reportId == -3) {

                let lstPhotos = await getPhotosPOP(this.state.detailInfo.photoDate, this.state.detailInfo.photoType);
                let lstUpload = lstPhotos?.filter(item => item.fileUpload === 0);
                this.setState({
                    lstShow: lstPhotos?.map((ele, i) => {
                        return (this.state.lstShow?.length === 0) ? { ...ele, isDelete: false } : { ...ele, isDelete: this.state.isAnimatingIcon };
                    }),
                    isHiddenButton: lstUpload?.length > 0 ? false : true
                })
            }
            else {
                let lstPhotos = await getPhotosReport(this.state.detailInfo.reportId, this.state.detailInfo.photoType, this.state.detailInfo.shopId, this.state.detailInfo.photoDate);
                //console.log(lstPhotos, 'lstPhoto')
                let lstUpload = lstPhotos?.filter(item => item.fileUpload === 0);
                this.setState({
                    lstShow: lstPhotos?.map((ele, i) => {
                        return (this.state.lstShow.length === 0) ? { ...ele, isDelete: false } : { ...ele, isDelete: this.state.isAnimatingIcon };
                    }),
                    isHiddenButton: lstUpload.length > 0 ? false : true
                })
            }
        }
    }
    uploadPhotos = async () => {
        let lstUpload = await this.state.lstShow?.filter(itemP => itemP.fileUpload === 0)
        await uploadAllDataPhoto(lstUpload);
    }
    deleteItem = async (item) => {
        await Store().then(db => {
            DeleteItem(db, 'photos', { id: item.id });
        })
        this.setState({ reloadView: true })
        this.loadData()
    }
    handleAnimation = () => {
        // A loop is needed for continuous animation
        Animated.loop(
            // Animation consists of a sequence of steps
            Animated.sequence([
                // start rotation in one direction (only half the time is needed)
                Animated.timing(this.animatedValue, { toValue: 1.0, duration: 100, easing: Easing.linear, useNativeDriver: true }),
                // rotate in other direction, to minimum value (= twice the duration of above)
                Animated.timing(this.animatedValue, { toValue: -1.0, duration: 300, easing: Easing.linear, useNativeDriver: true }),
                // return to begin position
                Animated.timing(this.animatedValue, { toValue: 0.0, duration: 100, easing: Easing.linear, useNativeDriver: true })
            ])
        ).start();
    }
    showActionDelete = (status) => {
        this.setState({
            lstShow: this.state.lstShow?.map((ele, i) => {
                return { ...ele, isDelete: status };
            }), isAnimatingIcon: status
        });
    }

    showImage = (isShow) => {
        isShow ? this.ref_imageSheet.current.show() : this.ref_imageSheet.current.hide()
    }

    onShowImage = (item) => {
        const index = this.state.lstShow.findIndex(it => it.photoPath == item.photoPath)
        this.setState({ imageIndex: index })
        this.showImage(true)
    }
    renderItem = ({ item }) => {
        return (
            <View style={{ flex: 1, borderRadius: 10, marginHorizontal: 5, marginTop: 5 }}>
                <TouchableOpacity
                    onLongPress={() => {
                        this.showActionDelete(true)
                        this.handleAnimation();
                    }}
                    style={{ borderRadius: 10, flex: 1 }}
                    onPress={() => item.isDelete === true ? this.showActionDelete(false) : this.onShowImage(item)}
                    delayLongPress={1000}
                >
                    <Image source={{ uri: item.photoPath }}
                        style={{ width: '100%', height: 130, zIndex: 3, borderRadius: 10 }} />
                </TouchableOpacity>

                <View style={{ alignItems: 'center', zIndex: 4, height: 40, width: 40, position: 'absolute', alignSelf: 'flex-end' }}>
                    <Animated.View style={{
                        transform: (item.dataUpload !== 1 && item.isDelete === true) ? [{
                            rotate: this.animatedValue.interpolate({
                                inputRange: [-1, 1],
                                outputRange: ['-0.2rad', '0.2rad']
                            })
                        }] : []
                    }}>
                        <Icon
                            style={{ right: 3, top: 3 }}
                            name={(item?.dataUpload !== 1 && item.isDelete === true) ? 'close' : "check-circle"} size={40}
                            // color={item.fileUpload === 1 ? this.props.appcolor.success : (item.isDelete ? this.props.appcolor.danger : 'transparent')}
                            color={(item.isDelete && item?.dataUpload !== 1 ? this.props.appcolor.danger :
                                ((item?.fileUpload == 1 && item?.dataUpload == 1) ? this.props.appcolor.success :
                                    ((item?.fileUpload == 1 && item?.dataUpload == 0) ? this.props.appcolor.warning :
                                        ((item?.fileUpload == 0 && item?.dataUpload == 1) ? this.props.appcolor.tomato : 'transparent')
                                    )
                                )
                            )}
                            onPress={() => (item.dataUpload !== 1 && item.isDelete === true) && this.deleteItem(item)}
                        />
                    </Animated.View>
                </View>
            </View>
        )
    }
    render() {
        let showALlPhotos = this.state.lstShow;
        return (
            <View style={{ flex: 1, backgroundColor: this.props.appcolor.surface }}>
                <HeaderCustom
                    leftFunc={() => {
                        (typeof this.props.route.params.callBackReport === 'function') && this.props.route.params.callBackReport();
                        (this.state.reloadView && typeof this.props.route.params.reloadView === 'function') && this.props.route.params.reloadView();
                        this.props.navigation.goBack()
                    }}
                    title={this.state.detailInfo.titlePage || 'Quản lý hình ảnh'}
                >
                </HeaderCustom>
                <TouchableOpacity style={{ flex: 1 }} onLongPress={() => this.showActionDelete(false)}>
                    <FlatList
                        style={{ padding: 10 }}
                        keyExtractor={this.keyExtractor}
                        data={showALlPhotos}
                        renderItem={this.renderItem}
                        numColumns={2}
                    />
                </TouchableOpacity>
                <ActionSheet ref={this.ref_imageSheet}>
                    <View style={{ width: '100%', height: '100%', backgroundColor: this.props.appcolor.light }}>
                        <MultipleShowImage key={'ShowItemImage'} listItem={this.state.lstShow} closeShowImage={() => this.showImage(false)} indexItem={this.state.imageIndex} />
                        {/* <ImageZoom ImagePath={imageUrl} />
                                    <TouchableOpacity onPress={() => showImage(null)}
                                        style={{ position: 'absolute', right: 20, top: 40, zIndex: 100 }}>
                                        <Icon name='times' type='font-asomeware-5' size={30} color={appcolor.dark} />
                                    </TouchableOpacity> */}
                    </View>
                </ActionSheet>
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        appcolor: state.GAppState.appcolor,
    }
}
function mapDispatchToProps(dispatch) {
    return {
        GAppController: bindActionCreators(AppCreateAction, dispatch)
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(AlbumPhoto);