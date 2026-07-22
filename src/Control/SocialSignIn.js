import React from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
// import { appleAuth } from '@invertase/react-native-apple-authentication';
//import auth from '@react-native-firebase/auth';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
// import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
const PR0VIDER = {
    F: "Facebook",
    G: "Google",
    A: "Apple",
    Z: "Zalo"
}
// const onAppleButtonPress = async () => {
//     // Start the sign-in request
//     const appleAuthRequestResponse = await appleAuth.performRequest({
//         requestedOperation: appleAuth.Operation.LOGIN,
//         requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
//     });
//     // Ensure Apple returned a user identityToken
//     if (!appleAuthRequestResponse.identityToken) {
//         throw 'Apple Sign-In failed - no identify token returned';
//     }
//     // Create a Firebase credential from the response
//     const { identityToken, nonce } = appleAuthRequestResponse;
//     const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
//     // Sign the user in with the credential
//     return auth().signInWithCredential(appleCredential);
// }
const onFacebookSignIn = async () => {
    // Attempt login with permissions
    // const result = await LoginManager.logInWithPermissions(['public_profile', 'email'], 'enabled');
    // if (result.isCancelled) {
    //     throw 'User cancelled the login process';
    // }
    // // Once signed in, get the users AccesToken
    // const data = await AccessToken.getCurrentAccessToken();
    // if (!data) {
    //     throw 'Something went wrong obtaining access token';
    // }
    // // Create a Firebase credential with the AccessToken
    // const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
    // Sign-in the user with the credential
    //return auth().signInWithCredential(facebookCredential);
    return null;
}
const signFaceBook = async () => {
    await onFacebookSignIn();
}
//Google Action
const onGoogleSignIn = async () => {
    // Get the users ID token
    // await GoogleSignin.configure();
    // await GoogleSignin.hasPlayServices();
    // const { idToken } = await GoogleSignin.signIn();
    // console.log(idToken, "GoogleSignin");
    // Create a Google credential with the token
    // const googleCredential = await auth.GoogleAuthProvider.credential(idToken);
    // Sign-in the user with the credential
    // return auth().signInWithCredential(googleCredential);
    return null;
}
const signGoogle = async () => {
    const result = await onGoogleSignIn();
    // await console.log(result, "sign sucess")
}
const signWithOut = async (provider, item) => {
    let jProfile = {};
    let socialId;
    switch (provider) {
        case PR0VIDER.F:
            const Fres = await onFacebookSignIn();
            jProfile = await Fres.additionalUserInfo;
            socialId = await jProfile.profile.email;
            break;
        case PR0VIDER.G:
            const Gres = await onGoogleSignIn();
            jProfile = await Gres.additionalUserInfo;
            socialId = await jProfile.profile.email;
            break;
        default:
            break;
    }
    if (jProfile.profile !== undefined) {
        try {
            const data = {
                "provider": provider,
                "status": 1,
                "socialId": socialId,
                "profile": JSON.stringify(jProfile.profile),
                "deviceId": item.deviceId,
                "deviceToken": item.deviceToken,
                "deviceType": item.deviceType
            }
            // console.log(data, "alll");
            const requestInfo = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
            const response = await fetch(`${URLDEFAULT}users/signwithout`, requestInfo)
            const result = await response.json()
            return await result;
        } catch (err) {
            // console.log(err,"signwithout")
            alert(JSON.stringify(err))
            return [];
        }
    } else
        await alert("unsucces");
}
const connectSocial = async (provider) => {
    let jProfile = {};
    let socialId;
    switch (provider) {
        case PR0VIDER.F:
            const Fres = await onFacebookSignIn();
            console.log(await Fres.user, "D")
            jProfile = await Fres.additionalUserInfo;
            socialId = await jProfile.profile.email;
            break;
        case PR0VIDER.G:
            const Gres = await onGoogleSignIn();
            console.log(await Gres, "D")
            jProfile = await Gres.additionalUserInfo;
            socialId = await jProfile.profile.email;
            break;
        default:
            break;
    }
    if (jProfile.profile !== undefined) {
        try {
            const token = await GetToken()
            const data = {
                "provider": provider,
                "status": 1,
                "socialId": socialId,
                "profile": JSON.stringify(jProfile.profile)
            }
            const requestInfo = {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data),
            }
            const response = await fetch(`${URLDEFAULT}employee/connectSocial`, requestInfo)
            const result = await response.json();
            if (await result.statusId === 200) {
                await AsyncStorage.setItem(provider, JSON.stringify(data));
                return true;
            }
            else return false
        } catch (e) {
            return false;
        }
    } else {
        console.log(jProfile, "deme")
        return false;
    }
}
const disconnectSocial = async (provider) => {
    try {
        const token = await GetToken()
        let data = JSON.parse(await AsyncStorage.getItem(provider)) || {};
        data.status = 0;
        const requestInfo = {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        }
        // console.log(data, "disconnect")
        const response = await fetch(`${URLDEFAULT}employee/connectSocial`, requestInfo)
        const result = await response.json();
        if (await result.statusId === 200) {
            await AsyncStorage.removeItem(provider);
            return true;
        }
        else return false
    } catch (e) {
        console.log(e, "Error");
        return false;
    }
}
export const Social = { PR0VIDER, signGoogle, signFaceBook, connectSocial, disconnectSocial, signWithOut }
