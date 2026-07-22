import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";

export const ItemChoose = ({ }) => {
    const { appcolor } = useSelector(state => state.GAppState)

    useEffect(() => {

        return () => false
    }, [])

    const styles = StyleSheet.create({
        mainContainer: {}
    })

    return (
        <View style={styles.mainContainer}>

        </View>
    )
}