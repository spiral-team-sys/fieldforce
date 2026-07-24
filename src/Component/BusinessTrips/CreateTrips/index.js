import React from 'react';
import { useSelector } from 'react-redux';
import { CreateTripsSR } from './CreateTripsSR';
import { CreateTrips } from './CreateTrips';
import { StyleSheet, View } from 'react-native';
import {
  AppNameBuild,
  aquaApp,
  bshApp,
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
import { CreateTripMultiple } from './CreateTripMultiple';
import { VSMCreateTripsSR } from './VSMCreateTripsSR';
import { MODE } from '../UtilityBusiness';
import { HSSCreateTripsSR } from './HSSCreateTripsSR';
import { ToshibaCreateTripsSR } from './ToshibaCreateTripsSR';
import { SharpCreateTripsSR } from './SharpCreateTripSR';
import { GSVCreateTripsSR } from './GSVCreateTripSR';
import { AquaCreateTripsSR } from './AquaCreateTripsSR';
import { BoschCreateTripsSR } from './BoschCreateTripsSR';
import { HPICreateTrips } from './HPICreateTrips';
import { HonorCreateTrips } from './HonorCreateTrips';
import { HafeleCreateTrips } from './HafeleCreateTrips';
import { LGCreateTrips } from './LGCreateTrip';

export const CreateNewTrip = ({
  onCloseCreate,
  onNextCreate,
  dateFilter,
  dataTrips,
  onReSelectCopyDate,
}) => {
  const { appcolor, userinfo } = useSelector(state => state.GAppState);
  const typeArrow = {
    titleHeader: 'Địa điểm công tác',
    typeBack: 'close',
    typeForward: 'arrow-forward',
  };
  const limitCost =
    dateFilter?.modeDefault == MODE.UPDATE
      ? JSON.parse(dateFilter?.limitCost || '[]')[0] || {}
      : JSON.parse(dateFilter?.limitCostMain || '[]')[0] || {};
  const listProvince = JSON.parse(dateFilter?.listProvince || '[]') || [];
  const quotaData = JSON.parse(dateFilter?.quotaData || '{}') || {};
  const tripConfig = JSON.parse(dateFilter?.tripConfig || '{}') || {};
  //
  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
  });

  const itemCreate = () => {
    switch (AppNameBuild) {
      case psvApp:
        return userinfo.groupType == 'SUP' ? (
          <CreateTripMultiple
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            tripConfig={tripConfig}
            dataTrips={dataTrips}
          />
        ) : userinfo.groupType == 'SR' ? (
          <CreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            tripConfig={tripConfig}
            dataTrips={dataTrips}
            onReSelectCopyDate={onReSelectCopyDate}
          />
        ) : (
          <CreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            tripConfig={tripConfig}
            dataTrips={dataTrips}
          />
        );
      case viessmannApp:
        return (
          <VSMCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            limitCost={limitCost}
          />
        );
      case hisenApp:
        return (
          <HSSCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
          />
        );
      case toshibaApp:
        return (
          <ToshibaCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
          />
        );
      case sharpApp:
        return (
          <SharpCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
          />
        );
      case tefalApp:
        return (
          <GSVCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            quotaData={quotaData}
            tripConfig={tripConfig}
            dataTrips={dataTrips}
          />
        );
      case aquaApp:
        return (
          <AquaCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            quotaData={quotaData}
            tripConfig={tripConfig}
          />
        );
      case bshApp:
        return (
          <BoschCreateTripsSR
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
            tripConfig={tripConfig}
          />
        );
      case hpiApp:
        return (
          <HPICreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
            tripConfig={tripConfig}
          />
        );
      case honorApp:
        return (
          <HonorCreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
            tripConfig={tripConfig}
          />
        );
      case hafeleApp:
        return (
          <HafeleCreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
            tripConfig={tripConfig}
          />
        );
      case lgApp:
        return (
          <LGCreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
            listProvince={listProvince}
            quotaData={quotaData}
          />
        );
      default:
        return (
          <CreateTrips
            dateFilter={dateFilter}
            onCloseCreate={onCloseCreate}
            onNextCreate={onNextCreate}
          />
        );
    }
  };
  return <View style={styles.mainContainer}>{itemCreate()}</View>;
};
