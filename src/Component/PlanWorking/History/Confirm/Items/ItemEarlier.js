import React from "react";
import { View, Text } from "react-native";

const ItemEarlier = ({ item, styles, appcolor }) => (
    <View style={{ flex: 1 }}>
        {item.TimeEarlier !== undefined && <Text style={styles.textItem}>{item.TimeEarlier}</Text>}
        {item.NoteEarlier !== undefined && <Text style={styles.textItem}>{item.NoteEarlier}</Text>}
        {item.ConfirmNoteEarlier !== undefined && <Text style={[styles.textItem, { color: appcolor.danger }]}>{item.ConfirmNoteEarlier}</Text>}
    </View>
)

export default ItemEarlier;
