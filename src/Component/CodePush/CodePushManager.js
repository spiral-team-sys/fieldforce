import React, { useEffect } from 'react';
import CodePushUpdateModal from './CodePushUpdateModal';
import { useCodePushUpdate } from '../../Hooks/useCodePushUpdate';

const CodePushManager = ({ checkOnAppStart = true, checkOnAppResume = true }) => {
    const {
        updateInfo, isCheckingUpdate, isDownloadingUpdate, isInstallingUpdate, error, downloadProgress,
        checkForUpdate, downloadAndInstallUpdate, dismissUpdate
    } = useCodePushUpdate();

    useEffect(() => {
        if (checkOnAppStart) {
            checkForUpdate();
        }
    }, []);

    useEffect(() => {
        if (!checkOnAppResume) return;
    }, []);

    const isModalVisible = !!(updateInfo);
    return (
        <CodePushUpdateModal
            visible={isModalVisible}
            updateInfo={updateInfo}
            isCheckingUpdate={isCheckingUpdate}
            isDownloadingUpdate={isDownloadingUpdate}
            isInstallingUpdate={isInstallingUpdate}
            downloadProgress={downloadProgress}
            error={error}
            onUpdate={downloadAndInstallUpdate}
            onDismiss={dismissUpdate}
            onCheckUpdate={checkForUpdate}
        />
    );
};

export default CodePushManager;
