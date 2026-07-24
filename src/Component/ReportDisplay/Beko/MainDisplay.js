import React, { useEffect } from 'react';
import { View } from 'react-native';
// import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { _competitorName } from '../../../Core/URLs';
import { HeaderCustom } from '../../../Content/HeaderCustom';
import { useSelector } from 'react-redux';
import DisplayAndStock from './DisplayAndStock';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { TabForm } from '../../../Control/TabForm';

const MainDisplay = ({ navigation }) => {
  const { appcolor, workinfo, kpiinfo } = useSelector(state => state.GAppState);
  const [routes, setRoutes] = useState([{ key: 'first', title: 'Trưng bày' }]);

  useEffect(() => {
    return () => false;
  }, []);

  const renderScene = SceneMap({
    first: () => <DisplayAndStock key={'formDisplay'} tabLabel="Trưng bày" />,
  });
  return (
    <View style={{ flex: 1 }}>
      <HeaderCustom
        title={kpiinfo.menuNameVN}
        leftFunc={() => navigation.goBack()}
        iconRight={'cloud-upload-alt'}
      />
      <TabForm renderScene={renderScene} routes={routes} />
      {/* <ScrollableTabView
                initialPage={0}
                tabBarBackgroundColor={appcolor.primary}
                tabBarTextStyle={{ fontSize: 16, color: appcolor.light }}
                tabBarUnderlineStyle={{ height: 2, backgroundColor: appcolor.light }}
                renderTabBar={() => <ScrollableTabBar tabStyle={{ height: 42 }} style={{ height: 42 }} />}>
                <DisplayAndStock key={'formDisplay'} tabLabel='Trưng bày' />
            </ScrollableTabView> */}
    </View>
  );
};
export default MainDisplay;
