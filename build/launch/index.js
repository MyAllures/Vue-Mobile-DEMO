const style = `
<style>
  #launch-screen {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    text-align: center;
    background-color: #f0f0f0;
    opacity: 1;
    transition: opacity 1.1s, top .1s ease-in-out .5s;
  }

  #orbit-spinner {
    position: relative;
    width: 2em;
    height: 2em;
    margin: auto;
    margin-top: 45vh;
    border: 0.5em solid rgba(0,0,0,0.1);
    border-radius: 50%;
  }

  #orbit-spinner::before {
    content: '';
    position: absolute;
    top: -0.5em;
    left: 50%;
    width: 0.5em;
    height: 0.5em;
    transform-origin: 50% 1.5em;
    margin-left: -0.25em;
    background-color: #eee;
    border-radius: 50%;
    animation: orbit 2s linear infinite;
  }

  @keyframes orbit {
    100% { transform: rotate(360deg); }
  }
</style>
`
const html = `<div id="launch-screen"><div id="orbit-spinner"></div></div>`
const script = `
<script>
  var skeletonDOM = document.getElementById('skeleton');
  var launchScreenDOM = document.getElementById('launch-screen')
  var currentUrl = window.location.hash
  let isHome = (currentUrl === '#/')
  function hideLaunchScreen () {
    launchScreenDOM.style.opacity = '0'
    launchScreenDOM.style.top = '9999px'
  }
  function hideSkeleton () {
    skeletonDOM.style.display = 'none'
    hideLaunchScreen()
    window.removeEventListener('load', hideSkeleton);
  }
  if (isHome) { // or the page has the static skeleton
    setTimeout(() => {
      hideLaunchScreen()
    }, 2500)
    window.addEventListener('load', hideSkeleton);
  } else {
    skeletonDOM.style.display = 'none';
    window.addEventListener('load', hideLaunchScreen);
  }
</script>
`
module.exports = {
  html,
  style,
  script,
}
