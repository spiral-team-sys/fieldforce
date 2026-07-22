import Foundation
import DeviceCheck
import React
import CryptoKit // Bắt buộc phải import để sử dụng thuật toán SHA-256 băm dữ liệu Challenge

@objc(AppAttestModule)
class AppAttestModule: NSObject, RCTBridgeModule {
  
  @objc static func moduleName() -> String! {
    return "AppAttestModule"
  }
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // 1. Hàm sinh Attestation Key (Giữ nguyên logic chuẩn của bạn)
  @objc
  func generateAttestationKey(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let service = DCAppAttestService.shared
    
    guard service.isSupported else {
      reject("NOT_SUPPORTED", "App Attest không hỗ trợ thiết bị này (Yêu cầu thiết bị thật iOS 14+)", nil)
      return
    }
    
    service.generateKey { keyId, error in
      if let error = error {
        reject("KEY_GEN_ERROR", error.localizedDescription, error)
        return
      }
      resolve(keyId)
    }
  }

  // 2. BỔ SUNG: Hàm chứng thực Key với chuỗi Challenge từ Server (Gửi về .NET)
  @objc
  func attestKey(_ keyId: String, challenge: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let service = DCAppAttestService.shared
    
    guard service.isSupported else {
      reject("NOT_SUPPORTED", "App Attest không hỗ trợ thiết bị này", nil)
      return
    }
    
    // Quy định của Apple: Chuỗi challenge truyền vào bắt buộc phải được băm SHA-256 trước khi gửi lên Apple Server
    guard let challengeData = challenge.data(using: .utf8) else {
      reject("INVALID_CHALLENGE", "Không thể mã hóa chuỗi challenge thành dữ liệu Data", nil)
      return
    }
    
    // Băm SHA-256 chuỗi Challenge bằng CryptoKit
    let challengeHash = SHA256.hash(data: challengeData)
    let clientDataHash = Data(challengeHash)
    
    // Gọi API của Apple để chứng thực cặp khóa nội bộ trong Secure Enclave
    service.attestKey(keyId, clientDataHash: clientDataHash) { attestationObject, error in
      if let error = error {
        reject("ATTESTATION_ERROR", error.localizedDescription, error)
        return
      }
      
      // Chuyển đổi dữ liệu nhị phân thành chuỗi Base64 để truyền về phía React Native JS dễ dàng
      if let attestationData = attestationObject {
        let base64String = attestationData.base64EncodedString()
        resolve(base64String)
      } else {
        reject("EMPTY_ATTESTATION", "Dữ liệu chứng thực trả về bị rỗng", nil)
      }
    }
  }
}
