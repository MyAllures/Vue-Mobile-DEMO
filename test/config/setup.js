function StorageMock () {

}
StorageMock.prototype.getItem = function (key) {
  return this[key] || null
}

StorageMock.prototype.setItem = function (key, value) {
  this[key] = value.toString()
}

StorageMock.prototype.removeItem = function (key) {
  delete this[key]
}

Object.defineProperty(window, 'localStorage', {
  value: new StorageMock()
})

global.__CLIENT__ = true
global.__DEVELOPMENT__ = false
