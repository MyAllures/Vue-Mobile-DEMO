module.exports = {
  before: function (browser) {
    browser
      .url(browser.launch_url + '/#/login')
      .waitForElementVisible('#username input', 3000)
      .setValue('#username input', 'eeeeee')
      .setValue('#password input', 'Aa111111')
      .click('.actions > button')
      .url(browser.launch_url + '/#/game')
      .waitForElementVisible('a.weui-grid', 5000)
      .click('a.weui-grid:nth-child(1)')
  },
  after: function (browser) {
    browser.end()
  },
  'init page Test': function (browser) {
    browser
    .waitForElementVisible('a.weui-grid.play', 5000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible
  },
  'change page Test': function (browser) {
    browser
    .click('div.left-trigger')
    .waitForElementVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    .click('li.arrow-right:nth-child(2)')
    .waitForElementNotVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible

    browser
    .click('div.left-trigger')
    .waitForElementVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    .click('li.arrow-right:nth-child(3)')
    .waitForElementNotVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible

    browser
    .click('div.left-trigger')
    .waitForElementVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    .click('li.arrow-right:nth-child(4)')
    .waitForElementNotVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible

    browser
    .click('div.left-trigger')
    .waitForElementVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    .click('li.arrow-right:nth-child(5)')
    .waitForElementNotVisible('ul.popup-menu', 5000)
    browser.pause(1000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible
  },
  'browser history back Test': function (browser) {
    browser
    .back()
    .back()
    .back()
    .waitForElementVisible('a.weui-grid.play', 5000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible
  },
  'eneter by url Test': function (browser) {
    browser
      .url(browser.launch_url + '/#/game/192/1855')
      .refresh()
      .waitForElementVisible('a.weui-grid.play', 5000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible

    browser
    .url(browser.launch_url)
    .refresh()
    .url(browser.launch_url + '/#/game')
    .waitForElementVisible('a.weui-grid.play', 5000)
    browser.expect.element('a.weui-grid.play').to.be.visible
    browser.expect.element('div.vux-cell-box.weui-cell.vux-cell-no-border-intent.category-menu-item.active').to.be.visible
  }
}
