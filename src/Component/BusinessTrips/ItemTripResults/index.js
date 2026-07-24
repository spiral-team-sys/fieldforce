import React from 'react';
import {
  AppNameBuild,
  aquaApp,
  bshApp,
  casperApp,
  hafeleApp,
  hisenApp,
  honorApp,
  hpiApp,
  lgApp,
  psvApp,
  sharpApp,
  tefalApp,
  toshibaApp,
  viessmannApp,
} from '../../../Core/URLs';
import { ViewResultCasper } from './ViewResultCasper';
import { useSelector } from 'react-redux';
import { ViewResultPNSMultiple } from './ViewResultPNSMultiple';
import { ViewResultDefault } from './ViewResultDefault';
import { ViewResultViessmann } from './ViewResultViessmann';
import { ViewResultHisense } from './ViewResultHisense';
import { ViewResultToshiba } from './ViewResultToshiba';
import { ViewResultSharp } from './ViewResultSharp';
import { ViewResultGSV } from './ViewResultGSV';
import { ViewResultAqua } from './ViewResultAqua';
import { ViewResultBosch } from './ViewResultBosch';
import { ViewResultHPI } from './ViewResultHPI';
import { ViewResultHonor } from './ViewResultHonor';
import { ViewResultHafele } from './ViewResultHafale';
import { ViewResultLG } from './ViewResultLG';

export const ItemTripResults = ({ tripResult, quotaData }) => {
  const ItemView = () => {
    switch (AppNameBuild) {
      case psvApp:
        return tripResult.provinceList !== undefined &&
          tripResult.provinceList?.length > 0 ? (
          <ViewResultPNSMultiple tripResult={tripResult} />
        ) : (
          <ViewResultDefault tripResult={tripResult} />
        );
      case casperApp:
        return <ViewResultCasper tripResult={tripResult} />;
      case viessmannApp:
        return <ViewResultViessmann tripResult={tripResult} />;
      case hisenApp:
        return <ViewResultHisense tripResult={tripResult} />;
      case toshibaApp:
        return <ViewResultToshiba tripResult={tripResult} />;
      case sharpApp:
        return <ViewResultSharp tripResult={tripResult} />;
      case tefalApp:
        return <ViewResultGSV tripResult={tripResult} />;
      case aquaApp:
        return <ViewResultAqua tripResult={tripResult} quotaData={quotaData} />;
      case bshApp:
        return <ViewResultBosch tripResult={tripResult} />;
      case hpiApp:
        return <ViewResultHPI tripResult={tripResult} />;
      case honorApp:
        return (
          <ViewResultHonor tripResult={tripResult} quotaData={quotaData} />
        );
      case hafeleApp:
        return (
          <ViewResultHafele tripResult={tripResult} quotaData={quotaData} />
        );
      case lgApp:
        return <ViewResultLG tripResult={tripResult} quotaData={quotaData} />;

      default:
        return <ViewResultDefault tripResult={tripResult} />;
    }
  };
  return ItemView();
};
