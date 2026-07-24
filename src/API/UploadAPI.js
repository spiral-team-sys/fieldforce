import { GetToken } from '../Core/Helper';
import { URLDEFAULT } from '../Core/URLs';
import { toastError, toastInfo } from '../Utils/configToast';

const buildUploadFormData = (dataFiles = [], fileDate) => {
  const formData = new FormData();

  dataFiles.forEach((file, index) => {
    formData.append(`files[${index}].file`, {
      uri: file.localUrl,
      type: file.fileType,
      name: file.fileName,
    });
    formData.append(`files[${index}].guid`, file.guid);
  });
  formData.append('fileDate', fileDate);

  return formData;
};
const parseResponseResult = async response => {
  const responseText = await response.text();

  if (!responseText) {
    return {
      statusId: response.status,
      messager: response.ok ? 'Empty response' : `HTTP ${response.status}`,
    };
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    return {
      statusId: response.status || 500,
      messager: responseText,
      parseError: `${error}`,
    };
  }
};
const uploadFileBatch = async (dataFiles = [], fileDate, token) => {
  const requestInfo = {
    method: 'POST',
    headers: {
      Authorization: token,
      Accept: 'application/json',
    },
    body: buildUploadFormData(dataFiles, fileDate),
  };
  const response = await fetch(
    `${URLDEFAULT}upload/file-formdata`,
    requestInfo,
  );
  const result = await parseResponseResult(response);

  if (!response.ok) {
    return {
      ...result,
      statusId: result.statusId || response.status,
      messager: result.messager || `Upload failed with HTTP ${response.status}`,
    };
  }

  return result;
};
const buildSkipItem = (file, error, batchNumber) => {
  return {
    guid: file.guid,
    fileName: file.fileName,
    batchNumber,
    messager: error?.messager || 'Unknown error',
  };
};

const uploadBatchWithFallback = async (dataFiles = [], fileDate, token) => {
  const batchNumber = 1;
  const batchResult = await uploadFileBatch(dataFiles, fileDate, token);

  if (batchResult?.statusId === 200) {
    return {
      uploadedFiles: dataFiles,
      skippedFiles: [],
    };
  }

  if (dataFiles.length === 1) {
    return {
      uploadedFiles: [],
      skippedFiles: [buildSkipItem(dataFiles[0], batchResult, batchNumber)],
    };
  }

  const uploadedFiles = [];
  const skippedFiles = [];

  for (let index = 0; index < dataFiles.length; index++) {
    const file = dataFiles[index];
    const fileResult = await uploadFileBatch([file], fileDate, token);

    if (fileResult?.statusId === 200) {
      uploadedFiles.push(file);
    } else {
      skippedFiles.push(buildSkipItem(file, fileResult, batchNumber));
    }
  }

  return { uploadedFiles, skippedFiles };
};

const UploadDataNonReport = async (data, actionResult, progressCallback) => {
  try {
    const token = await GetToken();
    const requestInfo = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(URLDEFAULT + 'upload/uploadraw', requestInfo);
    const result = await response.json();
    if (result.statusId === 200) {
      const uploadResult = await UploadFilesFormData(
        data.dataFiles || [],
        data.reportDate,
        progressCallback,
      );

      if (uploadResult?.statusId === 200 || uploadResult?.statusId === 206) {
        if (uploadResult?.statusId === 206) {
          toastInfo('Thông báo', uploadResult?.messager);
        }
        actionResult && (await actionResult(true, uploadResult?.messager));
      } else {
        actionResult && (await actionResult(false, uploadResult?.messager));
      }
    } else {
      toastError('Thông báo', result.messager);
      actionResult && (await actionResult(false, result.messager));
    }
  } catch (e) {
    toastError('Lỗi dữ liệu', `${e}`);
    actionResult && (await actionResult(false, `${e}`));
  }
};
const UploadFilesFormData = async (
  dataFiles = [],
  fileDate,
  progressCallback,
) => {
  try {
    if (dataFiles.length == 0) {
      return { statusId: 404, messager: 'Dữ liệu Files không tồn tại' };
    }
    const token = await GetToken();
    const uploadedFiles = [];
    const skippedFiles = [];
    const totalFiles = dataFiles.length;
    const result = await uploadBatchWithFallback(dataFiles, fileDate, token);

    uploadedFiles.push(...(result?.uploadedFiles || []));
    skippedFiles.push(...(result?.skippedFiles || []));

    const currentProgress = uploadedFiles.length + skippedFiles.length;
    progressCallback &&
      progressCallback({ current: currentProgress, total: totalFiles });

    if (uploadedFiles.length === 0) {
      return {
        statusId: 404,
        messager: `Không upload được file nào. Bỏ qua ${skippedFiles.length}/${dataFiles.length} file.`,
        skippedFiles,
      };
    }

    const isPartialSuccess = skippedFiles.length > 0;
    const successResult = {
      statusId: isPartialSuccess ? 206 : 200,
      messager: isPartialSuccess
        ? `Đã upload ${uploadedFiles.length}/${dataFiles.length} file. Bỏ qua ${skippedFiles.length} file lỗi.`
        : 'Upload files successfully',
      uploadedFiles,
      skippedFiles,
    };
    return successResult;
  } catch (error) {
    return { statusId: 404, messager: `${error}` };
  }
};
//
export const UPLOADAPI = { UploadDataNonReport, UploadFilesFormData };
