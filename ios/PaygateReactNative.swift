import Foundation
import PaygateSDK
import React
import UIKit

@objc(PaygateReactNative)
class PaygateReactNative: NSObject {

    @objc static func requiresMainQueueSetup() -> Bool { true }

    private func topViewController() -> UIViewController? {
        guard let scene = UIApplication.shared.connectedScenes
            .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
              let window = scene.windows.first(where: { $0.isKeyWindow }) else {
            return nil
        }
        var vc = window.rootViewController
        while let presented = vc?.presentedViewController {
            vc = presented
        }
        return vc
    }

    @objc func initialize(
        _ apiKey: String,
        baseURL: String?,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            await Paygate.initialize(apiKey: apiKey, baseURL: baseURL)
            resolve(nil)
        }
    }

    @objc func launchFlow(
        _ flowId: String,
        bounces: Bool,
        presentationStyle: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            guard let vc = topViewController() else {
                reject("NO_VC", "No view controller available to present from.", nil)
                return
            }
            let style: PaygatePresentationStyle = presentationStyle == "fullScreen" ? .fullScreen : .sheet
            do {
                let result = try await Paygate.launchFlow(flowId, bounces: bounces, presentationStyle: style)
                resolve(Self.launchResultToMap(result))
            } catch {
                reject("LAUNCH_ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc func launchGate(
        _ gateId: String,
        bounces: Bool,
        presentationStyle: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            guard let vc = topViewController() else {
                reject("NO_VC", "No view controller available to present from.", nil)
                return
            }
            let style: PaygatePresentationStyle = presentationStyle == "fullScreen" ? .fullScreen : .sheet
            do {
                let result = try await Paygate.launchGate(gateId, bounces: bounces, presentationStyle: style)
                resolve(Self.launchResultToMap(result))
            } catch {
                reject("LAUNCH_ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc func purchase(
        _ productId: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            do {
                let purchased = try await Paygate.purchase(productId)
                let active = await Array(Paygate.activeSubscriptionProductIDs)
                if let purchased = purchased {
                    resolve([
                        "action": "purchased",
                        "productId": purchased,
                        "activeSubscriptionProductIDs": active,
                    ] as [String: Any])
                } else {
                    resolve([
                        "action": "cancelled",
                        "activeSubscriptionProductIDs": active,
                    ] as [String: Any])
                }
            } catch {
                reject("PURCHASE_ERROR", error.localizedDescription, nil)
            }
        }
    }

    @objc func getActiveSubscriptionProductIDs(
        _ resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        Task { @MainActor in
            let active = await Array(Paygate.activeSubscriptionProductIDs)
            resolve(active)
        }
    }

    private static func launchResultToMap(_ r: PaygateLaunchResult) -> [String: Any] {
        var map: [String: Any] = ["status": r.status.rawValue]
        if let productId = r.productId {
            map["productId"] = productId
        }
        if let data = r.data {
            map["data"] = data
        }
        return map
    }
}
