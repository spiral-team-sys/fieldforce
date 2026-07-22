import React, { useEffect, useRef, useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, ToastAndroid, Alert } from 'react-native';
import { DashboardAPI } from '../../API/DashboardAPI';
import moment from 'moment';
import Carousel from 'react-native-snap-carousel';
import { useSelector } from 'react-redux';
import { HeaderCustom } from '../../Content/HeaderCustom';
import { deviceWidth } from '../../Core/Utility';
import ViewShot, { captureRef } from 'react-native-view-shot';
import { Divider, Icon } from '@rneui/base';
import Clipboard from "@react-native-clipboard/clipboard";
import Share from 'react-native-share';
import { groupDataByKey } from '../../Core/Helper';
import { Platform } from 'react-native';

const ShareReportInfo = ({ navigation }) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const textRefs = useRef();
	const refShoot = useRef([]);
	const { appcolor } = useSelector((state) => state.GAppState);
	const onLoad = async () => {
		setLoading(true);
		const shopId = 1;
		const reportDate = moment().format('YYYYMMDD');
		const result = await DashboardAPI.GetShareReport(shopId, reportDate);
		setData(result.data);
		setLoading(false);
	};

	const [stockCode, onChangeStockCode] = useState('');
	const [sellOut, onChangeSellOut] = useState('');
	const [oos, onChangeOos] = useState('');
	const [soUpdate, onChangeSoUpdate] = useState('');

	useEffect(() => {
		const _load = onLoad();
		return () => {
			_load;
		};
	}, []);
	const captureAndShare = async (index) => {
		try {
			const ref = refShoot[`${index}`];
			await captureRef(ref, {
				format: 'jpg',
				quality: 0.8,
				result: 'tmpfile',
			}).then((uri) => {
				console.log('uri', uri);
				const options = {
					title: 'ShareReportInfo',
					url: `file://${uri}`,
					message: '',
				};
				Share.open(options)
					.then((res) => {
						console.log('res', res);
					})
					.catch((err) => {
						console.log('err', err);
					});
			});
		} catch (error) {
			console.error('Error capturing or sharing:', error);
		}
	};

	const filterOosList = (arr) => {
		let string = '';
		arr.map((item, index) => {
			item.isParent == true &&
				(string = string + (index > 0 ? '\n' : '') + item.Category + ':' + '\n');
			string = string + item.ProductCode + ', ';
		});
		return string;
	};

	const renderItem = ({ item, index }) => {
		const oosList = JSON.parse(item.oos || '[]');
		const soList = JSON.parse(item.sellOut || '[]');
		const mapSoList = soList?.map((a) => a.Product).join('\n');
		const mapOosList = oosList?.map((a) => a.ProductCode)?.join('\n');
		const { arr } = groupDataByKey({ arr: oosList, key: 'Category' });
		const string = filterOosList(arr);
		return (
			<>
				<ViewShot
					style={{ width: '100%' }}
					ref={(shot) => (refShoot[`${index}`] = shot)}
					options={{
						fileName: item.attendantDate,
						format: 'jpg',
					}}
				>
					<View style={styles.card}>
						<Text style={styles.subtitle}>{item.workDate}</Text>
						<View style={{ borderColor: appcolor.surface, borderWidth: 1, width: '100%' }} />
						<Text style={styles.title}>{item.shopInfo}</Text>
						<Text style={styles.label}>{item.pgName}</Text>
						<Text style={styles.label}>{item.managerName}</Text>
						<Text style={styles.label}>Mã cửa hàng: {item.shopCode}</Text>
						<Text style={styles.label}>Mã kho: </Text>
						<TextInput
							placeholder="Nhập mã kho"
							placeholderTextColor={appcolor.grey}
							style={styles.input}
							value={stockCode}
							onChangeText={onChangeStockCode}
						/>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={styles.title}>Sellout Update: </Text>
							<View style={{ flex: 1, paddingBottom: 5 }}>
								<TextInput
									defaultValue={item.summary}
									onChangeText={onChangeSoUpdate}
									multiline
									style={styles.title}
								/>
							</View>
						</View>

						<TextInput
							defaultValue={mapSoList}
							onChangeText={onChangeSellOut}
							multiline
							style={styles.label}
						/>

						<Text style={[styles.title, { color: appcolor.danger }]}>
							Hàng thiếu:
						</Text>

						<TextInput
							style={styles.label}
							defaultValue={string}
							onChangeText={onChangeOos}
							multiline
						/>
					</View>
				</ViewShot>
				<View style={{ borderColor: appcolor.surface, borderWidth: 1, width: '100%' }} />
				<View
					style={{
						flexDirection: 'row',
						backgroundColor: appcolor.light,
						borderBottomLeftRadius: 6,
						borderBottomRightRadius: 6,
						borderWidth: 0.3,
						borderBottomColor: appcolor.grey,
						paddingBottom: 16,
						paddingTop: 12,
					}}
				>
					<TouchableOpacity
						onPress={() => {
							if (Platform.OS === 'android') {
								ToastAndroid.show('Đã sao chép', ToastAndroid.SHORT);
							} else {
								Alert.alert('Đã sao chép');
							}
							Clipboard.setString(
								`${item.workDate}\n${item.shopInfo}\nNhân viên: ${item.pgName}\n${item.managerName
								}\nMã cửa hàng: ${item.shopCode
								}\nMã kho: ${stockCode}\n SellOut Update: ${soUpdate || item.summary
								} \n${sellOut || mapSoList}\nHàng thiếu: ${oos || string}`
							);
							onChangeSoUpdate('');
							onChangeSellOut('');
							onChangeOos('');
						}}
						style={{
							flexDirection: 'row',
							flexGrow: 1,
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Icon color={appcolor.info} name="content-copy" size={12} />
						<Text
							style={{
								color: appcolor.info,
								fontSize: 12,
								padding: 3,
								textAlignVertical: 'center',
							}}
						>
							Copy nội dung
						</Text>
					</TouchableOpacity>
					<Text style={{ backgroundColor: appcolor.grey, width: 1, height: '100%' }} />
					<TouchableOpacity
						style={{
							flexDirection: 'row',
							flexGrow: 1,
							alignItems: 'center',
							paddingLeft: 20,
						}}
						onPress={() => captureAndShare(index)}
					>
						<Icon color={appcolor.info} name="share" size={16} />
						<Text
							style={{
								color: appcolor.info,
								fontSize: 12,
								padding: 3,
								textAlignVertical: 'center',
							}}
						>
							Share nội dung
						</Text>
					</TouchableOpacity>
				</View>
			</>
		);
	};
	const styles = StyleSheet.create({
		container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: appcolor.light },
		subtitle: { fontSize: 12, padding: 3, fontWeight: '400', fontStyle: 'italic', color: appcolor.dark },
		input: { borderBottomWidth: 0.3, marginBottom: 3, borderColor: appcolor.lightgray, fontSize: 12, color: appcolor.dark, padding: 2 },
		card: { backgroundColor: appcolor.light, marginTop: 16, padding: 16, borderTopLeftRadius: 6, borderTopRightRadius: 6, shadowColor: '#000', shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 5 },
		title: { fontSize: 14, fontWeight: 'bold', color: appcolor.dark },
		label: { fontSize: 12, padding: 5, color: appcolor.dark },
	});
	return (
		<View style={styles.container}>
			<HeaderCustom title={'Chia sẻ thông tin'} leftFunc={() => navigation.goBack()} />
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{ flex: 1 }}>
				<ScrollView>
					<Carousel
						data={data}
						renderItem={renderItem}
						sliderWidth={deviceWidth}
						itemWidth={deviceWidth * 0.9}
					/>
				</ScrollView>
			</KeyboardAvoidingView>
		</View>
	);
};
export default ShareReportInfo;
