import React from 'react';

import FontAwesome from '@react-native-vector-icons/fontawesome';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import Ionicons from '@react-native-vector-icons/ionicons';

import Registry from './IconRegistry';

export type IconType =
    | 'fontawesome'
    | 'font-awesome-5'
    | 'font-awesome-6'
    | 'material'
    | 'material-community'
    | 'ionicon';

export interface SpiralIconProps {
    type?: string;
    name: string;
    size?: number;
    color?: string;
    style?: any;
    onPress?: () => void;
}

const ICON_COMPONENT = {
    fontawesome: FontAwesome,
    'font-awesome-5': FontAwesome5,
    'font-awesome-6': FontAwesome6,
    material: MaterialIcons,
    'material-community': MaterialCommunityIcons,
    ionicon: Ionicons,
};

const TYPE_ALIAS: Record<string, IconType> = {
    material: 'material',
    MaterialIcons: 'material',
    'material-icons': 'material',

    'material-community': 'material-community',
    MaterialCommunityIcons: 'material-community',
    'material-design-icons': 'material-community',

    ionicon: 'ionicon',
    ionic: 'ionicon',
    ionicons: 'ionicon',
    Ionicons: 'ionicon',

    fontawesome: 'fontawesome',
    'font-awesome': 'fontawesome',

    'font-awesome-5': 'font-awesome-5',
    fontawesome5: 'font-awesome-5',

    'font-awesome-6': 'font-awesome-6',
    fontawesome6: 'font-awesome-6',
};

function normalizeType(type?: string): IconType {
    return TYPE_ALIAS[type ?? ''] ?? 'material';
}

const FA_NAME_MAP: Record<string, string> = {
    'store-alt': 'store',
    'poll-h': 'square-poll-horizontal',
    poll: 'square-poll-vertical',
    walking: 'person-walking',
    'house-user': 'house-chimney-user',
    'chalkboard-teacher': 'person-chalkboard',
    'hand-holding-usd': 'hand-holding-dollar',
    'share-alt-square': 'square-share-nodes',
    'file-upload': 'file-arrow-up',
};

function mapName(type: IconType, name: string) {
    if (
        type === 'font-awesome-5' ||
        type === 'font-awesome-6'
    ) {
        return FA_NAME_MAP[name] ?? name;
    }

    return name;
}

function getIconStyle(type: IconType, name: string) {
    const reg: any = (Registry as any)[type];

    if (!reg)
        return undefined;

    if (
        type === 'font-awesome-5' ||
        type === 'font-awesome-6'
    ) {
        if (reg.solid?.[name])
            return 'solid';

        if (reg.regular?.[name])
            return 'regular';

        if (reg.brand?.[name])
            return 'brand';

        if (reg.brands?.[name])
            return 'brand';

        return undefined;
    }

    return reg[name] ? true : undefined;
}

export default function SpiralIcon({
    type = 'material',
    name,
    size = 20,
    color = '#333',
    ...props
}: SpiralIconProps) {

    const iconType = normalizeType(type);

    const Component =
        ICON_COMPONENT[iconType] ?? MaterialIcons;

    const finalName = mapName(iconType, name);

    const style = getIconStyle(
        iconType,
        finalName
    );

    if (!style) {
        console.warn(
            `[SpiralIcon] ${iconType}:${finalName} not found`
        );

        return (
            <MaterialIcons
                name="help-outline"
                size={size}
                color={color}
            />
        );
    }

    if (

        iconType === 'font-awesome-5' ||
        iconType === 'font-awesome-6'
    ) {
        return (
            <Component
                {...props}
                name={finalName as any}
                iconStyle={style as any}
                size={size}
                color={color}
            />
        );
    }

    return (
        <Component
            {...props}
            name={finalName as any}
            size={size}
            color={color}
        />
    );
}