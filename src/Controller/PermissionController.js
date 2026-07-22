import Permissions, { PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Platform } from 'react-native'

export const PermissionsList = {
    android: [
        { id: 1, name: 'Camera', isResult: RESULTS.DENIED },
        { id: 2, name: 'Location', isResult: RESULTS.DENIED },
        { id: 3, name: 'Storage', isResult: RESULTS.DENIED }
    ],
    ios: [
        { id: 1, name: 'Camera', isResult: RESULTS.DENIED },
        { id: 2, name: 'Location', isResult: RESULTS.DENIED },
        { id: 3, name: 'Contacts', isResult: RESULTS.DENIED }
    ]
}

export const PermissionResult = async () => {
    if (Platform.OS == 'ios') {
        PermissionsList.ios[0].isResult = await Permissions.check(PERMISSIONS.IOS.CAMERA)
        PermissionsList.ios[1].isResult = await Permissions.check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        PermissionsList.ios[2].isResult = await Permissions.check(PERMISSIONS.IOS.CONTACTS)
    } else {
        PermissionsList.android[0].isResult = await Permissions.check(PERMISSIONS.ANDROID.CAMERA)
        PermissionsList.android[1].isResult = await Permissions.check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
        PermissionsList.android[2].isResult = await Permissions.check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE)
    }
}