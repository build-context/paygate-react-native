Pod::Spec.new do |s|
  s.name             = 'PaygateReactNative'
  s.version          = '0.1.0'
  s.summary          = 'React Native bindings for Paygate'
  s.homepage         = 'https://github.com/paygate/paygate'
  s.license          = { :type => 'MIT' }
  s.author           = { 'Paygate' => 'support@paygate.dev' }
  s.source           = { :path => '.' }
  s.source_files     = '*.{m,swift}'
  s.platform         = :ios, '15.0'
  s.swift_version    = '5.9'
  s.dependency       'React-Core'
  s.dependency       'PaygateSDK'
end
