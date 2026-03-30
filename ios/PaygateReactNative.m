#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(PaygateReactNative, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString *)apiKey
                  baseURL:(NSString *)baseURL
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(launchFlow:(NSString *)flowId
                  bounces:(BOOL)bounces
                  presentationStyle:(NSString *)style
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(launchGate:(NSString *)gateId
                  bounces:(BOOL)bounces
                  presentationStyle:(NSString *)style
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(purchase:(NSString *)productId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getActiveSubscriptionProductIDs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
