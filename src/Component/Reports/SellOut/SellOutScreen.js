import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { HeaderCustom } from "../../../Content/HeaderCustom";
import { FloatActionButton, TypeFAB } from "../../../Control/FAB";
import { getResSellOut, SELLOUTContext } from "../../../Controller/SellOutController";
import { checkLockReport } from "../../../Controller/ShopController";
import UploadController from "../../../Controller/UploadController";
import { SelloutResRow } from "../../../Content/SelloutResRow";
import { LoadingView } from "../../../Control/ItemLoading";
import CustomListView from "../../../Control/Custom/CustomListView";
import { ToastError, Message } from "../../../Core/Helper";
import { checkNetwork, deviceHeight } from "../../../Core/Utility";

const SellOutScreen = ({ navigation }) => {
    const { appcolor, kpiinfo, shopinfo, workinfo } = useSelector(state => state.GAppState)

    // #region state
    const [sellouts, setSellouts] = useState([]);
    const [totalSell, setTotalSell] = useState(0);
    const [lockReport, setLockReport] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    // #endregion

    // #region LoadData
    const selloutLoad = async () => {
        const total = await SELLOUTContext.TotalSellOut(workinfo);
        const lst = await getResSellOut(workinfo);
        setSellouts(lst);
        setTotalSell(total);
    };

    const LoadData = async () => {
        const isCheck = await checkLockReport(shopinfo);
        setLockReport(isCheck);
        await selloutLoad();
    };
    // #endregion

    const handlerCreate = () => {
        navigation.navigate('selloutcreate')
    }

    const onBack = () => {
        navigation.goBack()
    }

    // #region upload
    const Upload = async () => {
        let isNetwork = await checkNetwork();
        if (!isNetwork) {
            ToastError("Không có kết nối mạng, vui lòng kiểm tra lại kết nối sau đó thử lại.");
            return;
        }
        setShowProgress(true);
        const config = JSON.parse(kpiinfo.reportItem || '{}');
        await UploadController.DataSellout(
            { ...workinfo, reportId: config.isUseSellOut == 1 ? 5 : kpiinfo.id },
            async () => {
                setShowProgress(false);
                await selloutLoad();
            },
            () => setShowProgress(false)
        );
    };

    const onUploadSellout = () => {
        Message('Chú ý', 'Sau khi gửi dữ liệu sẽ không thể điều chỉnh, Bạn có chắc chắn không ?', () => Upload());
    };
    // #endregion

    useEffect(() => {
        if (workinfo?.workId !== undefined) {
            LoadData();
        }
    }, [workinfo])

    // #region styles
    const styles = StyleSheet.create({
        mainContainer: { flex: 1, backgroundColor: appcolor.light },
        contentMain: { flex: 1 },
        actionStyle: {}
    })
    // #endregion

    return (
        <View style={styles.mainContainer}>
            <HeaderCustom
                title={kpiinfo.menuNameVN || 'Báo cáo số bán'}
                leftFunc={onBack}
                iconRight='cloud-upload-alt'
                rightFunc={lockReport ? null : onUploadSellout}
            />
            <LoadingView styles={{ zIndex: 200 }} isLoading={showProgress} />
            <View style={styles.contentMain}>
                {sellouts.length > 0 && (
                    <CustomListView
                        data={sellouts}
                        renderItem={({ item, index }) => (
                            <SelloutResRow
                                key={"so" + index}
                                item={item}
                                index={index}
                                selloutLoad={selloutLoad}
                                ShowDetail={() => { }}
                                Props={{ navigation }}
                                workinfo={workinfo}
                                appcolor={appcolor}
                            />
                        )}
                        ListFooterComponent={<View style={{ height: deviceHeight / 3 }} />}
                        keyExtractor={(_, index) => index.toString()}
                    />
                )}
            </View>
            {/* Add + total FAB */}
            <FloatActionButton
                typeAction={TypeFAB.pressItem}
                iconActionName='add-circle'
                titleAction={totalSell > 0 ? `${totalSell}` : undefined}
                containerStyle={styles.actionStyle}
                onAction={handlerCreate}
            />
        </View>
    )
}

export default SellOutScreen;