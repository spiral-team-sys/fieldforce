import React from 'react';
import {
  AppNameBuild,
  aquaApp,
  bekoApp,
  cuckooApp,
  daikinApp,
  lgApp,
  officeApp,
  psvApp,
  realmeApp,
  viessmannApp,
  tefalApp,
} from '../../Core/URLs';
import LoadingViewBeko from './LoadingViewBeko';
import LoadingViewLG from './LoadingViewLG';
import LoadingDefault from './LoadingDefault';
import LoadingViewPSV from './LoadingViewPSV';
import LoadingViewCuckoo from './LoadingViewCuckoo';
import LoadingViewDaikin from './LoadingViewDaikin';
import LoadingViewAqua from './LoadingViewAqua';
import LoadingViewVSM from './LoadingViewVSM';
import LoadingViewTF from './LoadingViewTF';
import LoadingViewOffice from './LoadingViewOffice';

export const LoadingView = ({
  title,
  isLoading,
  styles,
  isHome,
  titleStyle,
}) => {
  let uiView = null;
  switch (AppNameBuild) {
    case bekoApp:
      uiView = (
        <LoadingViewBeko
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
    case realmeApp:
    case lgApp:
      uiView = (
        <LoadingViewLG
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
    case psvApp:
      uiView = (
        <LoadingViewPSV
          title={title}
          isLoading={isLoading}
          styles={styles}
          isHome={isHome}
          titleStyle={titleStyle}
        />
      );
      break;
    case cuckooApp:
      uiView = (
        <LoadingViewCuckoo
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
    case daikinApp:
      uiView = (
        <LoadingViewDaikin
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
    case aquaApp:
      uiView = (
        <LoadingViewAqua
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
    case viessmannApp:
      uiView = (
        <LoadingViewVSM
          title={title}
          isLoading={isLoading}
          styles={styles}
          isHome={isHome}
          titleStyle={titleStyle}
        />
      );
      break;
    case tefalApp:
      uiView = (
        <LoadingViewTF
          title={title}
          isLoading={isLoading}
          styles={styles}
          isHome={isHome}
          titleStyle={titleStyle}
        />
      );
      break;
    case officeApp:
      uiView = (
        <LoadingViewOffice
          title={title}
          isLoading={isLoading}
          styles={styles}
          isHome={isHome}
          titleStyle={titleStyle}
        />
      );
      break;
    default:
      uiView = (
        <LoadingDefault
          title={title}
          isLoading={isLoading}
          styles={styles}
          titleStyle={titleStyle}
        />
      );
      break;
  }
  return uiView;
};
