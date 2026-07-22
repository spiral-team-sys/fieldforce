import React, { useEffect, useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { deviceWidth } from "../Core/Utility";
import ScrollHintArrow from "./ScrollHintArrow";

export const ModalNotify = ({ titleNotify, messager, visible = false, handleVisibleModal, titleConfirm = 'OK', isMessageView = false, isChoose = false, handleOnAgree, isUseButton = true, disableOK = false, isUseHintArrow = false }) => {
    const { appcolor } = useSelector(state => state.GAppState)
    const [isVisible, setVisible] = useState(visible)

    const loadTitle = async () => {
        await setVisible(visible)
    }
    useEffect(() => {
        loadTitle()
    }, [visible])
    const onAgree = () => {
        handleOnAgree()
    }
    const onVisibleModal = (value) => {
        setVisible(value)
        handleVisibleModal(value)
    }
    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
        >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', }}>
                <View style={{
                    justifyContent: 'space-between',
                    backgroundColor: appcolor.light,
                    borderRadius: 20,
                    padding: 10,
                    alignItems: 'center',
                    shadowColor: appcolor.dark,
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 5,

                }}>
                    <Text style={{ color: appcolor.dark, padding: 10, fontWeight: '600', fontSize: 18, textAlign: 'center' }}>{titleNotify || 'Thông Báo'}</Text>
                    {
                        isMessageView ? messager() : <Text style={{ color: appcolor.dark, }}>{messager}</Text>
                    }
                    {
                        disableOK && isUseHintArrow &&
                        <ScrollHintArrow />
                    }
                    {
                        isUseButton &&
                        <View style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'row', width: deviceWidth * 0.7, marginTop: 20, height: 50 }}>
                            <TouchableOpacity
                                disabled={disableOK ? disableOK : false}
                                onPress={() => onVisibleModal(false)}
                                style={{ justifyContent: 'center', alignItems: "center", width: isChoose ? deviceWidth * 0.3 : deviceWidth * 0.6, borderRadius: 20, backgroundColor: appcolor.surface, padding: 10 }}
                            >
                                <Text style={{ color: appcolor.dark, opacity: disableOK ? 0.2 : 1 }}>{isChoose ? 'Từ chối' : titleConfirm}</Text>
                            </TouchableOpacity>
                            {
                                isChoose &&
                                <TouchableOpacity
                                    onPress={() => onAgree()}
                                    style={{ justifyContent: 'center', alignItems: "center", width: isChoose ? deviceWidth * 0.3 : deviceWidth * 0.6, borderRadius: 20, backgroundColor: appcolor.surface, padding: 10, marginLeft: 10 }}
                                >
                                    <Text style={{ color: appcolor.dark }}>Đồng ý</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    }
                </View>
            </View>
        </Modal>
    )
}

