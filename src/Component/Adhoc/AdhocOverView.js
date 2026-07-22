import React, { useEffect, useState, Fragment } from "react";
import { useSelector } from "react-redux";
import { View, Text, TouchableOpacity } from "react-native";
import { scaleSize } from "../../Themes/AppsStyle";
import { GetFormOverView } from "../../Controller/AdhocController";
import { colorList } from "../../Core/Helper";

export const AdhocOverView = ({ isLoading }) => {
    const { appcolor } = useSelector(state => state.GAppState);
    const [formTask, setFormTask] = useState({})
    const onLoadData = async () => {
        const result = await GetFormOverView();
        if (result.length > 0) {
            await setFormTask(result[0])
        }
    }
    useEffect(() => {
        onLoadData()
        return () => false
    }, [isLoading])
    return (
        <Fragment>
            <Text style={{ marginLeft: 12, color: appcolor.dark, padding: 7, fontWeight: 'bold' }}>Adhoc Task</Text>
            <TouchableOpacity>
                <View style={{ padding: 12, margin: 7, borderRadius: 12, backgroundColor: appcolor.surface }}>
                    <View style={{ flexGrow: 1, flexDirection: 'row', alignItems: 'center', marginBottom: 7 }}>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(16), width: '70%' }}>{formTask.l1}</Text>
                        <View style={{ padding: 3, flexGrow: 1, backgroundColor: appcolor.danger, borderRadius: 20 }}>
                            <Text style={{ textAlign: 'center', fontSize: scaleSize(16), color: appcolor.white }}>{formTask.v1 || 0}</Text>
                        </View>
                    </View>
                    <View style={{ flexGrow: 1, alignItems: 'center', flexDirection: 'row', marginBottom: 7 }}>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(16), width: '70%' }}>{formTask.l3}</Text>
                        <View style={{ padding: 3, flexGrow: 1, backgroundColor: appcolor.info, borderRadius: 20 }}>
                            <Text style={{
                                textAlign: 'center', color: appcolor.white,
                                fontSize: scaleSize(16),
                            }}>{formTask.v3}</Text>
                        </View>
                    </View>
                    <View style={{ flexGrow: 1, alignItems: 'center', flexDirection: 'row', marginBottom: 7, }}>
                        <Text style={{ color: appcolor.dark, fontSize: scaleSize(16), width: '70%' }}>{formTask.l2}</Text>
                        <View style={{ padding: 3, flexGrow: 1, backgroundColor: appcolor.warning, borderRadius: 20 }}>
                            <Text style={{ textAlign: 'center', color: appcolor.black, fontSize: scaleSize(16) }}>{formTask.v2}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Fragment>
    )
}