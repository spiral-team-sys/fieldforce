import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import ActionSheet, { SheetManager } from 'react-native-actions-sheet';
import { Icon, Text } from '@rneui/themed';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import Video from 'react-native-video';
import { deviceHeight, deviceWidth } from '../../Themes/AppsStyle';

const MultipleShowVideo = ({}) => {
  const insets = useSafeAreaInsets();
  const { appcolor } = useSelector(state => state.GAppState);
  const [dataVideo, setDataVideo] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemVideo, setItemVideo] = useState({ isView: false, uri: null });

  const onCloseSheet = () => {
    setDataVideo([]);
    setItemVideo({ isView: false, uri: null });
    SheetManager.hide('media-video-show');
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const viewabilityConfigCallbackPairs = useRef([
    { viewabilityConfig, onViewableItemsChanged },
  ]);

  const handlerPlay = item => {
    setItemVideo({ isView: !itemVideo.isView, uri: item.photoPath });
  };

  useEffect(() => {
    if (dataVideo && dataVideo.length > 0) {
      setCurrentIndex(0);
    }
  }, [dataVideo]);

  const styles = StyleSheet.create({
    mainContainer: { width: '100%', height: deviceHeight },
    contentSheet: {
      width: '100%',
      height: '100%',
      backgroundColor: appcolor.black,
    },
    itemContainer: {
      width: deviceWidth,
      height: deviceHeight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contentHeader: {
      width: '100%',
      alignContent: 'center',
      zIndex: 10,
      position: 'absolute',
      top: 0,
    },
    titleCount: {
      color: appcolor.light,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
      position: 'absolute',
      top: 8,
      alignSelf: 'center',
      margin: 16,
    },
    titleHeaderClose: {
      color: appcolor.light,
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
    },
    viewHeader: {
      width: 80,
      borderWidth: 0.5,
      borderColor: appcolor.light,
      backgroundColor: appcolor.dark,
      padding: 8,
      borderRadius: 5,
      margin: 8,
      position: 'absolute',
      end: 8,
      top: 8,
    },
    videoContainer: { flex: 1, justifyContent: 'center' },
    video: { width: deviceWidth, height: deviceHeight },
    buttonVideoAction: { position: 'absolute', bottom: 120 },
  });

  const renderItem = ({ item, index }) => {
    const onPlayVideo = () => handlerPlay(item);
    return (
      <View style={styles.itemContainer}>
        {itemVideo.isView && index == currentIndex && (
          <Video
            key={item.id || index}
            source={{ uri: itemVideo.uri }}
            style={styles.video}
            resizeMode="contain"
            controls={false}
            paused={false}
            onError={e => console.log('Video Error:', e)}
          />
        )}
        <TouchableOpacity
          style={styles.buttonVideoAction}
          onPress={onPlayVideo}
        >
          <SpiralIcon
            type="ionicon"
            name={itemVideo.isView ? 'stop' : 'play'}
            size={42}
            color={appcolor.white}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ActionSheet
      id="media-video-show"
      onBeforeShow={setDataVideo}
      containerStyle={StyleSheet.flatten([
        styles.contentSheet,
        { paddingBottom: insets.bottom },
      ])}
    >
      <SafeAreaView style={styles.mainContainer}>
        <View style={styles.contentHeader}>
          {dataVideo.length > 0 && (
            <Text style={styles.titleCount}>{`${currentIndex + 1} / ${
              dataVideo.length
            }`}</Text>
          )}
          <TouchableOpacity style={styles.viewHeader} onPress={onCloseSheet}>
            <Text style={styles.titleHeaderClose}>ĐÓNG</Text>
          </TouchableOpacity>
        </View>
        <FlashList
          keyExtractor={(_item, index) => index.toString()}
          horizontal
          pagingEnabled
          scrollEnabled={!itemVideo.isView}
          data={dataVideo}
          extraData={[dataVideo, itemVideo]}
          renderItem={renderItem}
          estimatedItemSize={deviceWidth}
          viewabilityConfigCallbackPairs={
            viewabilityConfigCallbackPairs.current
          }
          showsHorizontalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      </SafeAreaView>
    </ActionSheet>
  );
};

export default MultipleShowVideo;
