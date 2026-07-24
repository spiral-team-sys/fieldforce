import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';

import { EmployeeAPI } from '../../../API/EmployeeAPI';
import { WorkingPlanAPI } from '../../../API/WorkingPlanApi';
import { CalendarView } from '../Control/CalendarView';
import CustomListView from '../../../Control/Custom/CustomListView';
import { URLDEFAULT } from '../../../Core/URLs';
import { Icon } from '@rneui/base';
import SpiralIcon from '../../../Control/Icon/SpiralIcon';

const EmployeeItem = memo(({ item, appcolor }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: appcolor.surface }]}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => setExpanded(v => !v)}
      >
        <Image
          source={{ uri: `${URLDEFAULT}${item.photo}` }}
          style={styles.avatar}
        />

        <View style={styles.info}>
          <Text style={[styles.name, { color: appcolor.dark }]}>
            {item.employeeName || ''}
          </Text>
          <Text style={[styles.group, { color: appcolor.dark }]}>
            {item.groupType || '0'}
          </Text>
        </View>
        <SpiralIcon
          type="ionicon"
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={appcolor.greylight}
        />
      </TouchableOpacity>

      {expanded && <CalendarView dataPlanMonth={item.plan} Control={false} />}
    </View>
  );
});
const MyTeam = ({ filter }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await EmployeeAPI.GetEmployeeManager();
      const empRes = result.data.filter(e => !e.isMe);
      const dataWithPlan = await Promise.all(
        empRes.map(async emp => {
          try {
            const planRes = await WorkingPlanAPI.GetTeamPlan(
              filter.year,
              filter.month,
              emp.employeeId,
            );
            return { ...emp, plan: planRes.data };
          } catch {
            return { ...emp, plan: [] };
          }
        }),
      );

      setEmployees(dataWithPlan);
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [filter.year, filter.month]);

  useEffect(() => {
    if (filter?.year && filter?.month) {
      fetchData();
    }
  }, [fetchData]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={appcolor.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: appcolor.danger }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: appcolor.light }}>
      <CustomListView
        data={employees}
        keyExtractor={item => `${item.employeeId}`}
        renderItem={({ item }) => (
          <EmployeeItem item={item} appcolor={appcolor} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 4,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 56,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  group: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

export default MyTeam;
