import React from 'react';
import { View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Text, Badge, Icon } from '@rneui/themed';
import { deviceWidth, scaleSize } from '../Themes/AppsStyle';
import {
	AppNameBuild,
	artApp,
	mitsuApp,
	demoApp,
	hafeleApp,
	CONTENT_COLOR,
	DEFAULT_COLOR,
	bekoApp,
	psvApp,
	daikinApp,
	signifyApp,
} from '../Core/URLs';
import { useSelector } from 'react-redux';
export const HeaderInApp = ({
	iconLeft,
	iconMiddle,
	iconRight,
	leftFunc,
	middleFunc,
	rightFunc,
	title,
	titleRight,
	countNotify,
	isHome = false,
}) => {
	const appcolor = useSelector((state) => state.GAppState.appcolor);
	let bgColorHeader = appcolor.primary;
	switch (AppNameBuild) {
		case bekoApp:
			bgColorHeader = appcolor.homebackground;
			break;
		case daikinApp:
		case psvApp:
			bgColorHeader = appcolor.light;
			break;
		case signifyApp:
			bgColorHeader = appcolor.light;
			break;
		default:
			bgColorHeader = appcolor.primary;
			break;
	}
	let colorContent = CONTENT_COLOR;
	switch (AppNameBuild) {
		case daikinApp:
		case bekoApp:
		case psvApp:
			colorContent = isHome ? appcolor.dark : appcolor.light;
			break;
		case signifyApp:
			colorContent = appcolor.dark;
			break;
		default:
			colorContent = CONTENT_COLOR;
			break;
	}
	let bgColorBadgeMessage = appcolor.danger;
	switch (AppNameBuild) {
		case mitsuApp:
		case demoApp:
		case hafeleApp:
			bgColorBadgeMessage = appcolor.light;
			break;
		case artApp:
			bgColorBadgeMessage = appcolor.light;
			break;
		default:
			bgColorBadgeMessage = appcolor.danger;
			break;
	}
	return (
		<View
			style={{
				backgroundColor: isHome ? bgColorHeader : DEFAULT_COLOR,
				flexDirection: 'row',
				justifyContent: 'space-between',
				width: deviceWidth,
				minHeight: 42,
				borderBottomWidth: 0.0,
				borderBottomColor: appcolor.white,
			}}
		>
			<View
				style={{
					width: '20%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'flex-start',
					paddingLeft: 8,
				}}
			>
				{typeof leftFunc === 'function' && (
					<TouchableOpacity
						onPress={leftFunc}
						style={{ padding: 10, paddingRight: 15, borderRadius: 20, width: 45 }}
					>
						<Icon
							name={iconLeft ? iconLeft : 'chevron-left'}
							size={scaleSize(23)}
							solid={true}
							color={colorContent}
						/>
					</TouchableOpacity>
				)}
			</View>
			<View
				style={{
					width: '60%',
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				{typeof middleFunc === 'function' ? (
					<TouchableOpacity
						onPress={middleFunc}
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center',
							padding: 5,
						}}
					>
						{iconMiddle && (
							<Icon
								name={iconMiddle}
								size={scaleSize(23)}
								style={{ padding: 8 }}
								color={colorContent}
							/>
						)}
						<Text
							style={{
								textAlign: 'center',
								fontSize: scaleSize(18),
								fontWeight: '700',
								color: colorContent,
							}}
						>
							{title}
						</Text>
					</TouchableOpacity>
				) : (
					title && (
						<Text
							numberOfLines={2}
							style={{
								textAlign: 'center',
								fontSize: scaleSize(18),
								fontWeight: '700',
								padding: 5,
								color: colorContent,
							}}
						>
							{title}
						</Text>
					)
				)}
			</View>
			<View
				style={{
					width: '20%',
					display: 'flex',
					paddingRight: 12,
					justifyContent: 'center',
					alignItems: 'flex-end',
				}}
			>
				{typeof rightFunc === 'function' && (
					<TouchableOpacity
						onPress={rightFunc}
						style={{
							position: 'relative',
							padding: 10,
							paddingLeft: 15,
							flexDirection: 'row',
							alignItems: 'center',
						}}
					>
						{typeof iconRight === 'string' && (
							<Icon size={scaleSize(23)} name={iconRight} color={colorContent} />
						)}
						{typeof iconRight === 'string' && countNotify > 0 && (
							<Badge
								value={countNotify > 99 ? '99+' : countNotify}
								textStyle={{ fontSize: 9, color: appcolor.dark }}
								badgeStyle={{
									width: 25,
									borderRadius: 25,
									backgroundColor: bgColorBadgeMessage,
									borderColor: bgColorBadgeMessage,
								}}
								status="error"
								containerStyle={{ position: 'absolute', top: 0, right: 0 }}
								onPress={rightFunc}
							/>
						)}
						{typeof titleRight === 'string' && (
							<Text
								style={{
									color: 'black',
									fontSize: scaleSize(18),
									fontWeight: '700',
								}}
								numberOfLines={1}
							>
								{titleRight}
							</Text>
						)}
					</TouchableOpacity>
				)}
			</View>
		</View>
	);
};
