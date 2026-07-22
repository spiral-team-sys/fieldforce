import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import TrainingApp from './TrainingApp'
import { useSelector } from 'react-redux'
import { Welcome } from '../../../Welcome'
import { ToastSuccess } from '../../../../Core/Helper'
import LoadingDefault from '../../../../Control/ItemLoading/LoadingDefault'
import LoginTraining from './LoginTraining'
import { downloadMobileRaw } from '../../../../Controller/DownloadDataController'

const HomeTraining = ({ navigation, route }) => {
    const { appcolor, userinfo } = useSelector(state => state.GAppState)
    const [welcome, setWelcome] = useState(1)
    const [loading, setLoading] = useState(false)

    const onLoginCallBack = async (serverSync) => {
        await setLoading(true)
        if (serverSync) {
            await downloadMobileRaw(async (e) => {
                await ToastSuccess(e, "Thông báo", "top");
            });
        }
        await setLoading(false)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setWelcome(0)
        }, 3000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        if (route?.params?.welcome) {
            setWelcome(0)
        }
    }, [route?.params?.welcome])

    useEffect(() => {
        console.log('userinfo updated:', userinfo);
    }, [userinfo]);

    if (loading) return <LoadingDefault isLoading={loading} />
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: appcolor.light }}>
            {welcome === 1 ? <Welcome /> : userinfo.employeeId > 0 ?
                <TrainingApp navigation={navigation} /> : <LoginTraining onLoginCallBack={() => onLoginCallBack(true)} />}
        </SafeAreaView>
    )
}

export default HomeTraining