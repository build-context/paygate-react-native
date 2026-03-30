require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name             = 'PaygateReactNative'
  s.version          = package['version']
  s.summary          = 'React Native bindings for Paygate'
  s.homepage         = 'https://github.com/build-context/paygate-react-native'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Paygate' => 'support@paygate.dev' }
  s.source           = { :git => 'https://github.com/build-context/paygate-react-native.git', :tag => "v#{s.version}" }
  s.source_files     = '*.{m,swift}'
  s.platform         = :ios, '15.0'
  s.swift_version    = '5.9'
  s.dependency       'React-Core'
  s.dependency       'Paygate'
end
