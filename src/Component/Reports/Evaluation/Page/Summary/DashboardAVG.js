import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

const DashboardAVG = ({ title, data }) => {
  const { appcolor } = useSelector(state => state.GAppState);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setRows(Array.isArray(parsed) ? parsed : []);
    } catch {
      setRows([]);
    }
  }, [data]);

  const s = StyleSheet.create({
    root: { backgroundColor: appcolor.light, paddingTop: 12 },
    sectionHeader: { paddingHorizontal: 16, paddingBottom: 8 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#0f172a' },
    emptyWrap: { paddingVertical: 32, alignItems: 'center' },
    emptyText: { fontSize: 13, color: '#9ca3af' },
    card: {
      marginHorizontal: 12,
      marginBottom: 8,
      borderRadius: 20,
      backgroundColor: appcolor.light,
      borderWidth: 1,
      borderColor: appcolor.primary + '20',
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: appcolor.primary + '18',
      borderBottomWidth: 1,
      borderBottomColor: appcolor.border || '#f1f5f9',
    },
    cardHeaderLeft: { flex: 1 },
    dateText: {
      fontSize: 11,
      color: appcolor.blacklight || '#6b7280',
      marginBottom: 3,
    },
    pcText: {
      fontSize: 14,
      fontWeight: '700',
      color: appcolor.dark || '#1e293b',
    },
    picText: {
      fontSize: 12,
      color: appcolor.blacklight || '#6b7280',
      marginTop: 2,
    },
    scoreBadge: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: appcolor.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
    scoreValue: { fontSize: 17, fontWeight: '700', color: '#ffffff' },
    scoreLabel: { fontSize: 9, color: '#ffffffcc', marginTop: -2 },
    cardBody: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 8 },
    fieldBlock: { marginBottom: 8 },
    fieldLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: appcolor.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    fieldValue: {
      fontSize: 13,
      color: appcolor.dark || '#374151',
      lineHeight: 19,
    },
    divider: {
      height: 1,
      backgroundColor: appcolor.border || '#f1f5f9',
      marginBottom: 8,
    },
    noteRow: {
      marginBottom: 6,
      paddingLeft: 8,
      borderLeftWidth: 2,
      borderLeftColor: appcolor.primary + '55',
    },
    noteKpi: {
      fontSize: 11,
      fontWeight: '700',
      color: appcolor.dark || '#1e293b',
    },
    noteText: {
      fontSize: 12,
      color: appcolor.blacklight || '#475569',
      lineHeight: 17,
      marginTop: 1,
    },
  });

  const formatDate = val => {
    if (!val) return '—';
    const str = String(val);
    const m = str.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (m) return `${m[3]}/${m[2]}/${m[1]}  ${m[4]}:${m[5]}`;
    return str.substring(0, 16);
  };

  const parseNotes = raw => {
    if (!raw) return [];
    try {
      const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!Array.isArray(arr)) return [];
      return arr.filter(n => n && (n.Note ?? n.note));
    } catch {
      return [];
    }
  };

  const renderCard = (row, i) => {
    console.log(row);

    const visitDate =
      row.evaluationDate ?? row.VisitDate ?? row.visitDate ?? row.Visit_Date;
    const pc = row.typeName ?? '';
    const pic =
      row.employeeName ??
      (row.employeeId != null ? `NV #${row.employeeId}` : '');
    const diemRaw = row.avgPoint ?? row.Diem;
    const diem = diemRaw != null && diemRaw !== '' ? Number(diemRaw) : '—';
    const notes = parseNotes(row.dataNote);
    const tasks = row.tasks ?? row.Tasks;
    const hasBody = notes.length > 0 || !!tasks;
    return (
      <View key={i} style={s.card}>
        <View style={s.cardHeader}>
          <View style={s.cardHeaderLeft}>
            <Text style={s.dateText}>{formatDate(visitDate)}</Text>
            <Text style={s.pcText} numberOfLines={1}>
              {pc || '—'}
            </Text>
            {!!pic && (
              <Text style={s.picText} numberOfLines={1}>
                Nhân viên: {pic}
              </Text>
            )}
            {!!row.employeeCode && (
              <Text style={s.picText} numberOfLines={1}>
                Code: {row.employeeCode}
              </Text>
            )}
          </View>
          <View style={s.scoreBadge}>
            <Text style={s.scoreValue}>{diem}</Text>
            <Text style={s.scoreLabel}>điểm</Text>
          </View>
        </View>
        {hasBody && (
          <View style={s.cardBody}>
            {notes.length > 0 && (
              <View style={s.fieldBlock}>
                <Text style={s.fieldLabel}>Ghi chú</Text>
                {notes.map((n, idx) => (
                  <View key={idx} style={s.noteRow}>
                    <Text style={s.noteKpi} numberOfLines={2}>
                      {n.KPIName ?? n.kpiName ?? ''}
                    </Text>
                    <Text style={s.noteText}>{n.Note ?? n.note}</Text>
                  </View>
                ))}
              </View>
            )}
            {!!tasks && (
              <>
                {notes.length > 0 && <View style={s.divider} />}
                <View style={s.fieldBlock}>
                  <Text style={s.fieldLabel}>Công việc cần làm</Text>
                  <Text style={s.fieldValue}>{tasks}</Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={s.root}>
      {title && (
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>{title}</Text>
        </View>
      )}
      {rows.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyText}>Không có dữ liệu</Text>
        </View>
      ) : (
        rows.map((row, i) => renderCard(row, i))
      )}
    </View>
  );
};

export default DashboardAVG;
