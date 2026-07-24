import React, { useMemo, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { REPORT } from '../../../../API/ReportAPI';
import { removeVietnameseTones } from '../../../../Core/Helper';
import { toastError, toastSuccess } from '../../../../Utils/configToast';
import _ from 'lodash';
import { LoadingView } from '../../../../Control/ItemLoading';
import { SearchData } from '../../../../Control/SearchData/SearchData';
import CustomListView from '../../../../Control/Custom/CustomListView';
import { Text } from '@rneui/base';
import moment from 'moment';
import StepHeader from '../Steps/StepHeader';
import StepSummaryCard from '../Steps/StepSummaryCard';
import StepArea from '../Steps/StepArea';
import StepShop from '../Steps/StepShop';
import StepSchedule from '../Steps/StepSchedule';
import EmployeeItem from '../Items/EmployeeItem';
import { TODAY } from '../../../../Core/Utility';

const stepItems = [
  { id: 1, title: 'Khu vực' },
  { id: 2, title: 'Cửa hàng' },
  { id: 3, title: 'Nhân viên' },
  { id: 4, title: 'Lên lịch' },
];

const PlanEvaluation = () => {
  const { appcolor, shopinfo, kpiinfo, userinfo } = useSelector(
    state => state.GAppState,
  );
  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [dataMain, setDataMain] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState({
    area: 'ALL',
    province: 'ALL',
    shop: 'ALL',
  });
  const [selectedPC, setSelectedPC] = useState([]);
  const [isShowCalendar, setShowCalendar] = useState(false);
  const [workDate, setWorkDate] = useState(moment().format('YYYY-MM-DD'));
  const [coVisitName, setCoVisitName] = useState('');
  const [selectedCriteria, setSelectedCriteria] = useState([]);
  const [selectedCriteriaCate, setSelectedCriteriaCate] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [searchArea, setSearchArea] = useState('');
  const [searchShop, setSearchShop] = useState('');
  const normalizeText = value =>
    removeVietnameseTones(String(value || ''))
      .toLowerCase()
      .trim();

  const roleName = useMemo(() => {
    const source = [
      userinfo?.positionName,
      userinfo?.titleName,
      userinfo?.roleName,
      userinfo?.accountType,
    ].join(' ');
    return normalizeText(source);
  }, [userinfo]);

  const roleTokens = useMemo(
    () => roleName.split(/[^a-z0-9]+/).filter(Boolean),
    [roleName],
  );

  const isSUPRole = useMemo(
    () => roleTokens.includes('sup') || roleTokens.includes('supervisor'),
    [roleTokens],
  );

  const isTrainerOrAuthorizedRole = useMemo(() => {
    if (isSUPRole) return false;
    return (
      roleTokens.includes('trainer') ||
      roleTokens.includes('training') ||
      roleTokens.includes('admin') ||
      roleTokens.includes('manager') ||
      roleTokens.includes('asm') ||
      roleTokens.includes('rsm') ||
      roleTokens.includes('head')
    );
  }, [isSUPRole, roleTokens]);

  const readField = (item, keys = []) => {
    for (let i = 0; i < keys.length; i++) {
      const value = item?.[keys[i]];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return '';
  };

  const parseJsonData = (value, fallback = []) => {
    if (!value) return fallback;
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  const isITPItem = item => {
    const value = [
      readField(item, [
        'categoryName',
        'cateName',
        'productCategoryName',
        'typeName',
      ]),
      readField(item, ['cateCode', 'categoryCode', 'category']),
    ]
      .join(' ')
      .toUpperCase();
    return value.includes('ITP');
  };

  const isSUPManageEmployee = item => {
    const identity = [
      userinfo?.employeeId,
      userinfo?.employeeCode,
      userinfo?.employeeName,
    ]
      .filter(Boolean)
      .map(e => normalizeText(e));
    const managerData = [
      readField(item, ['supId', 'supervisorId', 'managerId']),
      readField(item, ['supCode', 'supervisorCode', 'managerCode']),
      readField(item, ['supName', 'supervisorName', 'managerName']),
    ]
      .filter(Boolean)
      .map(e => normalizeText(e));
    if (managerData.length === 0) return true;
    return managerData.some(manager => {
      return identity.some(
        id => manager === id || manager.includes(id) || id.includes(manager),
      );
    });
  };

  const getHistorySummary = item => {
    const historyList =
      parseJsonData(
        readField(item, ['jsonHistory', 'historyJson', 'historyData']),
        [],
      ) || [];
    const lastHistory = _.last(historyList) || {};
    const totalScore =
      readField(lastHistory, ['TotalScore', 'totalScore', 'SummaryScore']) ||
      readField(item, ['totalScore']);
    const criteriaScore = parseJsonData(
      readField(lastHistory, [
        'criteriaScores',
        'CriteriaScore',
        'jsonCriteriaScore',
      ]),
      readField(lastHistory, ['criteriaScore', 'CriteriaScoreName']),
    );
    const categoryScore = parseJsonData(
      readField(lastHistory, [
        'categoryScores',
        'CategoryScore',
        'jsonCategoryScore',
      ]),
      readField(lastHistory, ['categoryScore', 'CategoryScoreName']),
    );
    const note =
      readField(lastHistory, ['ReviewNote', 'note', 'notes']) ||
      readField(item, ['reviewNote']);
    const todo =
      readField(lastHistory, ['NeedToDo', 'todo', 'nextAction']) ||
      readField(item, ['needToDo']);
    return {
      count:
        readField(item, [
          'evaluateCount',
          'evaluationCount',
          'countEvaluate',
        ]) ||
        historyList.length ||
        0,
      date:
        readField(lastHistory, ['ReportDate', 'reportDate', 'createdDate']) ||
        '--',
      totalScore: totalScore || '--',
      criteriaScore,
      categoryScore,
      note,
      todo,
    };
  };

  const convertToPCData = (rawList = []) => {
    const result = {};
    _.forEach(rawList, (row, index) => {
      const employeeCode = String(
        readField(row, ['employeeCode', 'pcCode', 'code']) || `PC_${index}`,
      );
      const employeeId = readField(row, ['employeeId', 'pcId']);
      const shopId = readField(row, ['shopId']);
      const key = `${employeeCode}_${employeeId}_${shopId}`;
      if (!result[key]) {
        result[key] = {
          key,
          area: readField(row, ['area', 'regionName', 'region']) || 'N/A',
          province: readField(row, ['provinceName', 'province']) || 'N/A',
          shopName: readField(row, ['shopName']) || 'N/A',
          shopCode: readField(row, ['shopCode']) || '--',
          shopId: readField(row, ['shopId']) || 0,
          employeeId,
          employeeCode,
          employeeName:
            readField(row, ['employeeName', 'pcName']) || 'Chưa có tên',
          phone: readField(row, ['phoneNumber', 'phone', 'mobile']) || '--',
          workingDate:
            readField(row, ['workingDate', 'experience', 'tenure']) || '',
          supName:
            readField(row, ['supName', 'supervisorName', 'managerName']) ||
            '--',
          categoryPermision:
            readField(row, [
              'categoryPermision',
              'categoryPermission',
              'categoryAccess',
            ]) || '--',
          history: getHistorySummary(row),
          isITP: isITPItem(row),
        };
      }
    });
    const dataConverted = Object.values(result).map(item => {
      return {
        ...item,
        experience: item.workingDate,
        category: item.categoryPermision,
      };
    });
    return dataConverted;
  };

  const applyPermission = (rawData = []) => {
    if (isSUPRole) {
      const filterBySUP = _.filter(rawData, isSUPManageEmployee);
      return filterBySUP.length > 0 ? filterBySUP : rawData;
    }
    if (isTrainerOrAuthorizedRole) return _.filter(rawData, e => !isITPItem(e));
    return rawData;
  };

  const LoadData = async () => {
    setLoading(true);
    const params = {
      shopId: shopinfo.shopId || 0,
      reportId: kpiinfo.id,
    };
    await REPORT.GetDataReportByShop_RealTime(
      params,
      async (mData, message) => {
        message && toastError('Thông báo', message);
        const dataByPermission = applyPermission(mData || []);
        const dataByPC = convertToPCData(dataByPermission);
        setData(dataByPC || []);
        setDataMain(dataByPC || []);
      },
    );
    setLoading(false);
  };

  const getFilterOptions = (field, source = dataMain) => {
    const list = _.chain(source)
      .map(e => readField(e, [field]))
      .filter(e => !!e)
      .uniq()
      .sortBy(e => removeVietnameseTones(String(e)).toLowerCase())
      .value();
    return ['ALL', ...list];
  };

  const areaOptions = useMemo(
    () => getFilterOptions('area', dataMain),
    [dataMain],
  );
  const provinceOptions = useMemo(() => {
    const byArea =
      filter.area === 'ALL'
        ? dataMain
        : _.filter(dataMain, e => e.area === filter.area);
    return getFilterOptions('province', byArea);
  }, [dataMain, filter.area]);
  const shopOptions = useMemo(() => {
    let byFilter = dataMain;
    if (filter.area !== 'ALL')
      byFilter = _.filter(byFilter, e => e.area === filter.area);
    if (filter.province !== 'ALL')
      byFilter = _.filter(byFilter, e => e.province === filter.province);
    return getFilterOptions('shopName', byFilter);
  }, [dataMain, filter.area, filter.province]);

  const dataFiltered = useMemo(() => {
    const valueSearch = removeVietnameseTones(searchText || '').toLowerCase();
    return _.filter(dataMain, e => {
      const byArea = filter.area === 'ALL' || e.area === filter.area;
      const byProvince =
        filter.province === 'ALL' || e.province === filter.province;
      const byShop = filter.shop === 'ALL' || e.shopName === filter.shop;
      if (!valueSearch) return byArea && byProvince && byShop;
      const searchSource = [
        e.area,
        e.province,
        e.shopName,
        e.shopCode,
        e.employeeCode,
        e.employeeName,
      ].join(' ');
      const searchValue = removeVietnameseTones(searchSource).toLowerCase();
      return (
        byArea && byProvince && byShop && searchValue.includes(valueSearch)
      );
    });
  }, [dataMain, filter, searchText]);

  const onSelectFilter = (key, value) => {
    const next = { ...filter, [key]: value };
    if (key === 'area') {
      next.shop = 'ALL';
      if (next.province !== 'ALL' && value !== 'ALL') {
        const isProvinceInArea = _.some(
          dataMain,
          e => e.area === value && e.province === next.province,
        );
        if (!isProvinceInArea) next.province = 'ALL';
      }
    }
    if (key === 'province') {
      next.shop = 'ALL';
      if (value === 'ALL') {
        next.area = 'ALL';
      } else {
        const matchedAreas = _.chain(dataMain)
          .filter(e => e.province === value)
          .map(e => e.area)
          .filter(Boolean)
          .uniq()
          .value();
        if (matchedAreas.length === 1) {
          next.area = matchedAreas[0];
        }
      }
    }
    setFilter(next);
    if (key === 'province' && value !== 'ALL') setCurrentStep(2);
    if (key === 'shop' && value !== 'ALL') setCurrentStep(3);
  };

  const toggleSelectedPC = item => {
    const isSelected = selectedPC.includes(item.key);
    const next = isSelected
      ? selectedPC.filter(e => e !== item.key)
      : [...selectedPC, item.key];
    setSelectedPC(next);
  };

  const getCriteriaIdentity = (criteria = {}) => {
    return String(
      criteria.id ??
        criteria.Id ??
        `${criteria.groupId || ''}_${criteria.kpi || ''}_${
          criteria.kpiName || ''
        }`,
    );
  };

  const onChooseCriteria = criteriaObject => {
    if (!criteriaObject) return;
    const nextId = getCriteriaIdentity(criteriaObject);
    const isSelected = selectedCriteria.some(
      c => getCriteriaIdentity(c) === nextId,
    );
    const isGroupItem = criteriaObject?.selectionType === 'group';
    const willChoose = isGroupItem
      ? typeof criteriaObject?.isChooseGroup === 'boolean'
        ? criteriaObject.isChooseGroup
        : !isSelected
      : typeof criteriaObject?.isChoose === 'boolean'
      ? criteriaObject.isChoose
      : !isSelected;

    if (isGroupItem) {
      criteriaObject.isChooseGroup = willChoose;
      criteriaObject.isChoose = false;
    } else {
      criteriaObject.isChoose = willChoose;
      criteriaObject.isChooseGroup = false;
    }

    const next = willChoose
      ? [
          ...selectedCriteria.filter(e => getCriteriaIdentity(e) !== nextId),
          criteriaObject,
        ]
      : selectedCriteria.filter(e => getCriteriaIdentity(e) !== nextId);
    setSelectedCriteria(next);
  };

  const onChooseCriteriaCategory = (criteriaKey, value) => {
    const list = selectedCriteriaCate[criteriaKey] || [];
    const isSelected = list.includes(value);
    const next = isSelected ? list.filter(e => e !== value) : [...list, value];
    setSelectedCriteriaCate({ ...selectedCriteriaCate, [criteriaKey]: next });
  };

  const onSubmitSchedule = async () => {
    if (selectedPC.length === 0) {
      toastError('Thông báo', 'Vui lòng chọn ít nhất 1 PC để đánh giá');
      return;
    }
    if (!workDate) {
      toastError('Thông báo', 'Vui lòng chọn thời gian đánh giá');
      return;
    }
    // if (!coVisitName.trim()) {
    //     toastError('Thông báo', 'Vui lòng nhập tên Co-visit')
    //     return
    // }
    if (selectedCriteria.length === 0) {
      toastError('Thông báo', 'Vui lòng chọn tối thiểu 1 tiêu chí đánh giá');
      return;
    }
    const selectedGroups = selectedCriteria.filter(
      item => item?.selectionType === 'group' && item?.isChooseGroup === true,
    );
    const selectedSubItems = selectedCriteria.filter(
      item => item?.selectionType === 'sub' && item?.isChoose === true,
    );

    const groupMissingSubItem = selectedGroups.find(
      group =>
        group.hasSubItems === true &&
        !selectedSubItems.some(sub => sub.groupId === group.groupId),
    );
    if (groupMissingSubItem) {
      toastError(
        'Thông báo',
        `Vui lòng chọn ít nhất 1 tiêu chí con cho: ${groupMissingSubItem.groupName}`,
      );
      return;
    }

    const criteriaPayload = selectedGroups.map(group => ({
      groupId: group.groupId,
      groupName: group.groupName,
      kpi: group.kpi,
      kpiType: group.kpiType,
      point: group.point,
      isPointFloat: group.isPointFloat,
      subItems: selectedSubItems
        .filter(sub => sub.groupId === group.groupId)
        .map(sub => ({
          kpi: sub.kpi,
          kpiName: sub.kpiName,
          point: sub.point,
          isPointFloat: sub.isPointFloat,
        })),
    }));

    // Step 3: selected PC info
    console.log(selectedPC);

    const selectedPCInfo = _.filter(dataMain, e =>
      selectedPC.includes(e.key),
    ).map(pc => ({
      key: pc.key,
      employeeId: pc.employeeId,
      employeeCode: pc.employeeCode,
      employeeName: pc.employeeName,
      phone: pc.phone,
      shopId: pc.shopId,
      shopName: pc.shopName,
      shopCode: pc.shopCode,
    }));

    // Step 1+2: location from filter or first selected PC
    const refPC = selectedPCInfo[0] || {};
    const jsonData = {
      // Step 1
      area: filter.area !== 'ALL' ? filter.area : refPC.area || '',
      province:
        filter.province !== 'ALL' ? filter.province : refPC.province || '',
      // Step 2
      shopId: refPC.shopId || shopinfo.shopId || 0,
      shopName: filter.shop !== 'ALL' ? filter.shop : refPC.shopName || '',
      shopCode: refPC.shopCode || '',
      // Step 3
      pcList: selectedPCInfo,
      // Step 4
      workDate: workDate,
      coVisitName: coVisitName.trim(),
      criteriaList: criteriaPayload,
    };

    // Upload lịch đánh giá
    setLoading(true);
    const itemUpload = {
      ...jsonData,
      reportId: kpiinfo.id,
      reportDate: TODAY,
    };
    const upload_result = await REPORT.UploadDataRaw_Realtime(
      itemUpload,
      shopinfo,
      kpiinfo.id,
    );
    setLoading(false);
    if (upload_result?.statusId === 200) {
      toastSuccess('Thông báo', 'Lên lịch đánh giá thành công');
      setSelectedPC([]);
      setWorkDate(moment().format('YYYY-MM-DD'));
      setCoVisitName('');
      setSelectedCriteria([]);
      setSelectedCriteriaCate({});
      setFilter({ area: 'ALL', province: 'ALL', shop: 'ALL' });
      setSearchText('');
      setSearchArea('');
      setSearchShop('');
      setCurrentStep(1);
    } else {
      toastError(
        'Thông báo',
        upload_result?.messager || 'Lên lịch thất bại, vui lòng thử lại',
      );
    }
  };

  const onChangeStep = stepId => {
    if (stepId >= 3 && filter.shop === 'ALL') {
      toastError('Thông báo', 'Vui lòng chọn cửa hàng trước');
      return;
    }
    if (stepId >= 3 && data.length === 0) {
      toastError(
        'Thông báo',
        'Không có dữ liệu nhân viên theo khu vực và cửa hàng đã chọn',
      );
      return;
    }
    if (stepId === 4 && selectedPC.length === 0) {
      toastError(
        'Thông báo',
        'Vui lòng chọn ít nhất 1 nhân viên trước khi lên lịch',
      );
      return;
    }
    setCurrentStep(stepId);
    if (stepId === 1) {
      setSearchArea('');
      setSearchShop('');
    }
    if (stepId === 2) setSearchShop('');
  };

  useEffect(() => {
    LoadData();
  }, []);

  useEffect(() => {
    setData(dataFiltered);
  }, [dataFiltered]);

  const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: appcolor.light },
    contentContainer: { flex: 1, padding: 8, paddingTop: 0 },
    contentBody: { paddingBottom: 8 },
    loadingView: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    sectionContainer: {
      width: '100%',
      marginBottom: 10,
      borderRadius: 10,
      borderWidth: 0.5,
      borderColor: appcolor.grayLight,
      backgroundColor: appcolor.white,
      padding: 8,
    },
    subTitleName: {
      fontSize: 11,
      fontWeight: '500',
      color: appcolor.placeholderText,
      marginBottom: 8,
    },
  });

  const renderItem = ({ item, index }) => (
    <EmployeeItem
      item={item}
      index={index}
      isSelected={selectedPC.includes(item.key)}
      onPress={() => toggleSelectedPC(item)}
    />
  );

  const onRefreshEmployeeList = () => {
    setFilter({ area: 'ALL', province: 'ALL', shop: 'ALL' });
    setSearchText('');
    setCurrentStep(1);
    LoadData();
  };

  const renderListEmpty = () => {
    if (currentStep !== 3) return <View />;
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.subTitleName}>Không có dữ liệu nhân viên</Text>
      </View>
    );
  };

  const renderListHeader = () => (
    <>
      <StepSummaryCard
        stepItems={stepItems}
        currentStep={currentStep}
        filter={filter}
        selectedPC={selectedPC}
        workDate={workDate}
        coVisitName={coVisitName}
        selectedCriteria={selectedCriteria}
      />
      <StepHeader
        stepItems={stepItems}
        currentStep={currentStep}
        onChangeStep={onChangeStep}
      />
      {currentStep === 1 && (
        <StepArea
          areaOptions={areaOptions}
          provinceOptions={provinceOptions}
          filter={filter}
          onSelectFilter={onSelectFilter}
          dataMain={dataMain}
          searchArea={searchArea}
          onSearchArea={setSearchArea}
        />
      )}
      {currentStep === 2 && (
        <StepShop
          shopOptions={shopOptions}
          filter={filter}
          onSelectFilter={onSelectFilter}
          dataMain={dataMain}
          searchShop={searchShop}
          onSearchShop={setSearchShop}
        />
      )}
      {currentStep === 3 && (
        <SearchData
          placeholder="Tìm nhân viên theo tên hoặc mã"
          onSearchData={text => setSearchText(text)}
        />
      )}
      {currentStep === 4 && (
        <StepSchedule
          selectedPC={selectedPC}
          workDate={workDate}
          setWorkDate={setWorkDate}
          coVisitName={coVisitName}
          setCoVisitName={setCoVisitName}
          selectedCriteria={selectedCriteria}
          onChooseCriteria={onChooseCriteria}
          selectedCriteriaCate={selectedCriteriaCate}
          onChooseCriteriaCategory={onChooseCriteriaCategory}
          onSubmitSchedule={onSubmitSchedule}
          isShowCalendar={isShowCalendar}
          setShowCalendar={setShowCalendar}
        />
      )}
    </>
  );

  return (
    <View style={styles.mainContainer}>
      <LoadingView isLoading={isLoading} styles={styles.loadingView} />
      <CustomListView
        data={currentStep === 3 ? data : []}
        extraData={{
          currentStep,
          data,
          selectedPC,
          selectedCriteria,
          selectedCriteriaCate,
          filter,
          searchArea,
          searchShop,
          workDate,
          coVisitName,
          isShowCalendar,
        }}
        renderItem={currentStep === 3 ? renderItem : () => <View />}
        ListEmpty={renderListEmpty()}
        containerStyle={styles.contentContainer}
        contentContainerStyle={styles.contentBody}
        bottomView={{ paddingBottom: 0 }}
        onRefresh={currentStep === 3 ? onRefreshEmployeeList : undefined}
        ListHeader={renderListHeader()}
      />
    </View>
  );
};

export default PlanEvaluation;
