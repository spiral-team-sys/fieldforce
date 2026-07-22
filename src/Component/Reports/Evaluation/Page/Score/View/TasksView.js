import { Text } from "@rneui/base";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deviceHeight } from "../../../../../../Themes/AppsStyle";
import ScoringHeader from "./ScoringHeader";

const TasksView = ({
    styles,
    appcolor,
    item,
    tasks,
    setTasks,
    onClose,
    onBack,
    onConfirm,
}) => (
    <SafeAreaView style={styles.container}>
        <ScoringHeader styles={styles} appcolor={appcolor} item={item} onClose={onClose} />
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                contentContainerStyle={{ paddingBottom: deviceHeight / 3.5 }}
            >
                <View style={styles.tasksSection}>
                    <Text style={styles.tasksTitle}>Công việc cần làm</Text>
                    <Text style={styles.tasksSubtitle}>Nhập các công việc cần nhân viên thực hiện trong thời gian tới</Text>
                    <TextInput
                        style={styles.tasksInput}
                        value={tasks}
                        onChangeText={setTasks}
                        placeholder='Nhập công việc cần làm...'
                        placeholderTextColor={appcolor.placeholderText}
                        multiline
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        <View style={styles.navRow}>
            <TouchableOpacity style={styles.navBtn} onPress={onBack}>
                <Text style={styles.navBtnText}>Trước</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={onConfirm}>
                <Text style={styles.navBtnTextPrimary}>Tiếp theo</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
)

export default TasksView;
