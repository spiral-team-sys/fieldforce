import React, { memo, useCallback, useMemo } from "react";
import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";

import { fontWeightBold } from "../../../../../../Themes/AppsStyle";

const MenuPSVCard = ({ appcolor, item, onPress }) => {
    const styles = useMemo(() => createStyles(appcolor), [appcolor]);

    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    return (
        <View style={styles.cardShadow}>
            <TouchableOpacity activeOpacity={0.85} style={styles.card} onPress={handlePress}>
                <View style={styles.topRow}>
                    <LinearGradient
                        colors={[appcolor.primary, appcolor.info]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.iconBox}
                    >
                        <Icon
                            name={item.iconName}
                            type={item.iconType || "font-awesome-5"}
                            color={appcolor.white}
                            size={19}
                        />
                    </LinearGradient>
                </View>
                <Text numberOfLines={2} style={styles.title}>{item.menuNameVN}</Text>
                <View style={styles.bottomRow}>
                    <Text numberOfLines={1} style={styles.subtitle}>{item.menuName || "PSV"}</Text>
                    <View style={styles.arrow}>
                        <Icon name="arrow-right" type="feather" size={12} color={appcolor.primary} />
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (appcolor) => StyleSheet.create({
    cardShadow: {
        flex: 1,
        marginHorizontal: 6,
        marginBottom: 12,
        borderRadius: 18,
        backgroundColor: appcolor.light,
        ...Platform.select({
            ios: {
                shadowColor: appcolor.dark,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 8,
                shadowOpacity: 0.07
            },
            android: {
                elevation: 8,
                shadowColor: appcolor.dark
            }
        })
    },
    card: {
        flex: 1,
        aspectRatio: 1.25,
        padding: 12,
        borderRadius: 18,
        backgroundColor: appcolor.light,
        borderWidth: 1,
        borderColor: appcolor.grayLight,
        overflow: "hidden",
        justifyContent: "space-between"
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    iconBox: {
        width: 43,
        height: 43,
        borderRadius: 13,
        justifyContent: "center",
        alignItems: "center"
    },
    title: {
        color: appcolor.dark,
        fontSize: 13,
        lineHeight: 17,
        fontWeight: fontWeightBold,
        marginTop: 12
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },
    subtitle: {
        color: appcolor.placeholderText,
        fontSize: 10,
        flex: 1
    },
    arrow: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: appcolor.primary + "0D"
    }
});

export default memo(MenuPSVCard);
