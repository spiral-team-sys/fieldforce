import React, { memo, useCallback, useEffect, useMemo } from "react"
import { View, Text, StyleSheet, ActivityIndicator } from "react-native"
import { Image } from '@rneui/base'
import { useSelector } from "react-redux"
import { URLDEFAULT } from "../../../../../Core/URLs"
import CustomListView from "../../../../../Control/Custom/CustomListView"

// Static styles hoisted outside to avoid recreation on every render
const staticStyles = StyleSheet.create({
    container: { flex: 1, marginTop: 8 },
    photoItem: { flex: 1, marginRight: 8, alignSelf: 'center' },
    photoInner: { width: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 5, marginBottom: 8 },
    photoImage: { width: 180, height: 120, borderRadius: 8 },
    photoType: { fontWeight: '600', fontSize: 12, marginTop: 4 },
    photoTime: { fontWeight: '600', fontSize: 12 },
    photoDistance: { fontWeight: '500', fontSize: 11 },
})

// Stable placeholder element — avoids creating a new instance on every render
const PLACEHOLDER = <ActivityIndicator />

const PhotoItem = memo(({ item, index, showPhoto, appcolor }) => {
    // Stable source object — prevents Image from treating it as a new URL and re-fetching
    const imageSource = useMemo(() => {
        const photo = item?.AttendantPhoto
        if (!photo) return null
        if (photo.includes('https')) return { uri: photo }
        // Trim leading slash on photo path to avoid double-slash when URLDEFAULT ends with '/'
        const trimmed = photo.startsWith('/') ? photo.slice(1) : photo
        return { uri: `${URLDEFAULT}${trimmed}` }
    }, [item?.AttendantPhoto])

    // Only color-dependent styles computed here
    const photoInnerStyle = useMemo(() => [staticStyles.photoInner, { backgroundColor: appcolor.lightgray }], [appcolor.lightgray])
    const placeholderStyle = useMemo(() => [staticStyles.photoImage, { backgroundColor: appcolor.surface }], [appcolor.surface])
    const photoTypeStyle = useMemo(() => [staticStyles.photoType, { color: appcolor.primary }], [appcolor.primary])
    const photoTimeStyle = useMemo(() => [staticStyles.photoTime, { color: appcolor.dark }], [appcolor.dark])
    const photoDistanceStyle = useMemo(() => [staticStyles.photoDistance, { color: appcolor.dark }], [appcolor.dark])

    return (
        <View style={staticStyles.photoItem}>
            <View style={photoInnerStyle}>
                <Image
                    source={imageSource ?? undefined}
                    style={staticStyles.photoImage}
                    placeholderStyle={placeholderStyle}
                    resizeMode="cover"
                    resizeMethod="resize"
                    PlaceholderContent={PLACEHOLDER}
                    onPress={() => showPhoto(index)}
                    transition={false}
                />
                <Text style={photoTypeStyle}>{item.AttendantType}</Text>
                <Text style={photoTimeStyle}>{item.AttendentTime}</Text>
                <Text style={photoDistanceStyle}>{item.Distance}</Text>
            </View>
        </View>
    )
})

const PhotoAttendant = memo(({ lstPhoto, showPhoto }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    const renderItem = useCallback(({ item, index }) => (
        <PhotoItem
            item={item}
            index={index}
            showPhoto={showPhoto}
            appcolor={appcolor}
        />
    ), [showPhoto, appcolor])

    if (lstPhoto.length === 0) {
        return null
    }

    return (
        <View style={staticStyles.container}>
            <CustomListView
                data={lstPhoto}
                renderItem={renderItem}
                numColumns={2}
                bottomView={{ paddingBottom: 0 }}
                scrollEnabled={false}
            />
        </View>
    )
})

export default PhotoAttendant
