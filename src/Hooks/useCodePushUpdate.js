import { useEffect, useRef, useState } from 'react';
import CodePush from '@revopush/react-native-code-push';
import RNRestart from 'react-native-restart-newarch';

const logCodePush = (...args) => {
    if (__DEV__) {
        console.log('[CodePushUpdate]', ...args);
    }
};

const logCodePushError = (...args) => {
    if (__DEV__) {
        console.warn('[CodePushUpdate]', ...args);
    }
};

export const useCodePushUpdate = () => {
    const restartTimerRef = useRef(null);
    const [updateInfo, setUpdateInfo] = useState(null);
    const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
    const [isDownloadingUpdate, setIsDownloadingUpdate] = useState(false);
    const [isInstallingUpdate, setIsInstallingUpdate] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(null);
    const [error, setError] = useState(null);
    const [lastCheckedVersion, setLastCheckedVersion] = useState(null);

    useEffect(() => {
        return () => {
            if (restartTimerRef.current) {
                clearTimeout(restartTimerRef.current);
            }
        };
    }, []);

    const restartAppAfterInstall = () => {
        if (restartTimerRef.current) {
            return;
        }

        restartTimerRef.current = setTimeout(() => {
            logCodePush('Restarting app after CodePush install...');
            RNRestart.Restart();
        }, 1000);
    };

    // Kiểm tra xem bản update này đã được cập nhật hay chưa
    const isUpdateAlreadyApplied = async (packageHash) => {
        try {
            const [runningMetadata, latestMetadata] = await Promise.all([
                CodePush.getUpdateMetadata(CodePush.UpdateState.RUNNING),
                CodePush.getUpdateMetadata(CodePush.UpdateState.LATEST),
            ]);
            logCodePush('Current metadata:', {
                runningMetadata,
                latestMetadata,
            });
            return [runningMetadata, latestMetadata].some(
                metadata => metadata?.packageHash === packageHash
            );
        } catch (err) {
            logCodePushError('getUpdateMetadata failed:', err);
            return false;
        }
    };

    const checkForUpdate = async () => {
        try {
            setIsCheckingUpdate(true);
            setError(null);
            logCodePush('Checking for update...');
            const update = await CodePush.checkForUpdate();

            if (update) {
                logCodePush('Update found:', {
                    packageHash: update.packageHash,
                    appVersion: update.appVersion,
                    isMandatory: update.isMandatory,
                });
                const alreadyApplied = await isUpdateAlreadyApplied(update.packageHash);

                if (alreadyApplied) {
                    logCodePush('Update already applied, skipping:', update.packageHash);
                    setUpdateInfo(null);
                    return;
                }

                if (lastCheckedVersion === update.packageHash) {
                    logCodePush('Same update already checked, skipping:', update.packageHash);
                    setUpdateInfo(null);
                    return;
                }
                setLastCheckedVersion(update.packageHash);
                setUpdateInfo({
                    description: update.description,
                    isMandatory: update.isMandatory,
                    isAvailable: true,
                    label: "Chi tiết bản cập nhật",
                    version: update.appVersion,
                    packageHash: update.packageHash,
                });
                logCodePush('Update info set for UI:', update.packageHash);
            } else {
                logCodePush('No update available');
                setUpdateInfo(null);
                setLastCheckedVersion(null);
            }
        } catch (err) {
            logCodePushError('checkForUpdate failed:', err);
            setError(err?.message || 'Lỗi khi kiểm tra cập nhật');
        } finally {
            setIsCheckingUpdate(false);
            logCodePush('Check update finished');
        }
    };
    const downloadAndInstallUpdate = async () => {
        try {
            setError(null);
            setDownloadProgress(null);
            logCodePush('Starting download/install update...');
            await CodePush.sync(
                {
                    updateDialog: false,
                    installMode: CodePush.InstallMode.ON_NEXT_RESTART,
                    mandatoryInstallMode: CodePush.InstallMode.ON_NEXT_RESTART,
                },
                status => {
                    const syncStatusName = {
                        [CodePush.SyncStatus.CHECKING_FOR_UPDATE]: 'CHECKING_FOR_UPDATE',
                        [CodePush.SyncStatus.DOWNLOADING_PACKAGE]: 'DOWNLOADING_PACKAGE',
                        [CodePush.SyncStatus.INSTALLING_UPDATE]: 'INSTALLING_UPDATE',
                        [CodePush.SyncStatus.UPDATE_INSTALLED]: 'UPDATE_INSTALLED',
                        [CodePush.SyncStatus.UP_TO_DATE]: 'UP_TO_DATE',
                        [CodePush.SyncStatus.UNKNOWN_ERROR]: 'UNKNOWN_ERROR',
                    };
                    logCodePush('Sync status:', syncStatusName[status] ?? status);
                    switch (status) {
                        case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
                            setIsDownloadingUpdate(false);
                            setIsInstallingUpdate(false);
                            break;
                        case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
                            setIsDownloadingUpdate(true);
                            setIsInstallingUpdate(false);
                            break;
                        case CodePush.SyncStatus.INSTALLING_UPDATE:
                            setIsDownloadingUpdate(false);
                            setIsInstallingUpdate(true);
                            break;
                        case CodePush.SyncStatus.UPDATE_INSTALLED:
                            setIsDownloadingUpdate(false);
                            setIsInstallingUpdate(true);
                            setDownloadProgress(null);
                            setLastCheckedVersion(null);
                            logCodePush('Update installed, restarting app...');
                            restartAppAfterInstall();
                            break;
                        case CodePush.SyncStatus.UP_TO_DATE:
                            setIsDownloadingUpdate(false);
                            setIsInstallingUpdate(false);
                            setUpdateInfo(null);
                            setDownloadProgress(null);
                            break;
                        case CodePush.SyncStatus.UNKNOWN_ERROR:
                            setError('CodePush gặp lỗi không xác định');
                            setIsDownloadingUpdate(false);
                            setIsInstallingUpdate(false);
                            break;
                        default:
                            break;
                    }
                },
                progress => {
                    const pct =
                        progress.totalBytes > 0
                            ? Math.floor(
                                (progress.receivedBytes / progress.totalBytes) * 100
                            )
                            : 0;
                    setDownloadProgress({
                        receivedBytes: progress.receivedBytes,
                        totalBytes: progress.totalBytes,
                        percent: pct,
                    });
                    logCodePush('Download progress:', {
                        receivedBytes: progress.receivedBytes,
                        totalBytes: progress.totalBytes,
                        percent: pct,
                    });
                }
            );
            logCodePush('CodePush sync completed');
        } catch (err) {
            logCodePushError('downloadAndInstallUpdate failed:', err);
            setError(err?.message || 'Lỗi khi tải cập nhật');
            setIsDownloadingUpdate(false);
            setIsInstallingUpdate(false);
        }
    };
    const dismissUpdate = () => {
        setUpdateInfo(null);
        setError(null);
        setDownloadProgress(null);
        setLastCheckedVersion(null); // Reset khi bỏ qua, để lần sau vẫn có thể check lại
    };

    return {
        updateInfo,
        isCheckingUpdate,
        isDownloadingUpdate,
        isInstallingUpdate,
        downloadProgress,
        error,
        checkForUpdate,
        downloadAndInstallUpdate,
        dismissUpdate,
    };
};
