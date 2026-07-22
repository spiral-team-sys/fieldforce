#import <React/RCTBridgeModule.h>

// Ánh xạ class Swift sang React Native
@interface RCT_EXTERN_MODULE(AppAttestModule, NSObject)

// Ánh xạ hàm sinh Key
RCT_EXTERN_METHOD(generateAttestationKey:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

// Ánh xạ hàm chứng thực với chuỗi Challenge từ Server
RCT_EXTERN_METHOD(attestKey:(NSString *)keyId
                  challenge:(NSString *)challenge
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
