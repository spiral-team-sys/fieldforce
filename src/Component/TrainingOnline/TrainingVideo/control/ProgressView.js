import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Progress from 'react-native-progress';

export const ProgressView = ({ title, progressSize = 100 }) => {
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 1) {
                        return 0; // Reset về 0 chứ không chạy ngược
                    }
                    return prev + 0.02; // tăng mượt tay
                });
            }, 50); // điều chỉnh tốc độ tăng
        }

        return () => clearInterval(intervalRef.current);
    }, [isRunning]);

    const styles = StyleSheet.create({
        container: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        text: {
            marginTop: 20,
            fontSize: 16,
        },
    });

    const stopProgress = () => {
        setIsRunning(false);
        setProgress(1); // Dừng và hiển thị hoàn tất
    };

    return (
        <View style={styles.container}>
            <Progress.Circle
                progress={progress}
                size={progressSize}
                showsText={false}
                animated={false}
                color="#1976d2"
                unfilledColor="#e0e0e0"
                borderWidth={2}
                thickness={8}
            />

            <Text style={styles.text}>
                {title ? title : 'Đang xử lý...'}
            </Text>
        </View>
    );
}


