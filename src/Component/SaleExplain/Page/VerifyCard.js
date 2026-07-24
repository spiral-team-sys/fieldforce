import { Text, TouchableOpacity, View } from 'react-native';
import { CountTime } from '../Control/ExplanControl';
import { formatDate } from '../../../Core/Helper';

const getTabField = (tab = {}) => tab.ref_Name || tab.ref_Field || 'confirm';

const normalizeTabValue = value => {
  if (value === false) return '0';
  if (value === true) return '1';
  return String(value);
};

const getDisplayStatusTab = (item = {}, dataTab = []) => {
  const customTab = dataTab.find(tab => {
    const field = getTabField(tab);
    return (
      tab.ref_Id != null &&
      field !== 'confirm' &&
      normalizeTabValue(item?.[field]) === normalizeTabValue(tab.ref_Id)
    );
  });

  if (customTab) return customTab;

  return dataTab.find(tab => {
    const field = getTabField(tab);
    return (
      tab.ref_Id != null &&
      field === 'confirm' &&
      normalizeTabValue(item?.confirm) === normalizeTabValue(tab.ref_Id)
    );
  });
};

export const VerifyCard = ({
  item,
  onPress,
  colorStatus,
  lableStatus,
  dataTab = [],
  styles,
}) => {
  const datePC = [item.startDatePC, item.endDatePC]
    .filter(Boolean)
    .map(formatDate)
    .join(' - ');
  const explainRequired =
    item.yeuCauGiaiTrinh === false || item.yeuCauGiaiTrinh == 0
      ? 'Không cần giải trình'
      : 'Cần giải trình';
  const displayStatusTab = getDisplayStatusTab(item, dataTab);
  const statusColor =
    displayStatusTab?.isColor || colorStatus[item.confirm] || '#9CA3AF';
  const statusLabel =
    displayStatusTab?.nameVN || lableStatus[item.confirm] || 'Không xác định';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardTop}>
        <Text style={styles.cardDate}>{formatDate(item.salesDate)}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor }]}>
          <Text style={styles.badgeText}>{statusLabel}</Text>
        </View>
      </View>

      <Text style={styles.cardModel}>{item.model}</Text>
      <Text style={styles.cardSub}>Channel: {item.channel || '--'}</Text>
      <Text style={styles.cardSub}>
        Mã shop: {item.ShopCode || item.shopCode || '--'}
      </Text>
      <Text style={styles.cardSub}>Shop: {item.shopNameVN || '--'}</Text>
      <Text style={styles.cardSub}>Yêu cầu giải trình: {explainRequired}</Text>
      <Text style={styles.cardSub}>IMEI1: {item.imei1}</Text>
      <Text style={styles.cardSub}>SN: {item.sn}</Text>
      <Text style={styles.cardReason}>Lý do: {item.lyDoCanGT}</Text>
      {!!item.ffcommentGiaiTrinh && (
        <Text numberOfLines={2} style={styles.cardNote}>
          FF ghi chú: {item.ffcommentGiaiTrinh}
        </Text>
      )}

      {!!item.verifyNote && (
        <Text numberOfLines={2} style={styles.cardNote}>
          Giải trình: {item.verifyNote}
        </Text>
      )}
      {!!item.confirmNote && (
        <Text numberOfLines={2} style={styles.cardSub}>
          Quản lí ghi chú: {item.confirmNote}
        </Text>
      )}

      {item.confirm == 0 && <CountTime item={item} styles={styles} />}
    </TouchableOpacity>
  );
};
