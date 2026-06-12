// Bitrise CI exports NODE_ENV=production for the build steps and the test step
// inherits it; Jest only defaults NODE_ENV to 'test' when it is unset. Under
// 'production' React resolves to its production build and act()/Testing Library
// throw. Force the standard Jest value before any test module (and React) loads.
process.env.NODE_ENV = 'test';
