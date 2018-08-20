const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}

global.localStorage = localStorageMock
global.__CLIENT__ = true
global.__DEVELOPMENT__ = false
