// -- start helpers -----------------------------------
function getLoggedIn() {
  let signInBtn = document.getElementsByClassName('style-scope ytd-button-renderer style-suggestive size-small');
  if (signInBtn.length && [...signInBtn].find(d => d.innerText === 'Sign in')) return false;
  return true;
}
async function likeVideo() {
  let like = await chrome.storage.local.get('like');
  like = like.like;
  if (like && !getLoggedIn) return;

  let videoBtns = document.getElementsByClassName('style-scope ytd-video-primary-info-renderer');
  videoBtns = videoBtns[0]?.children[5]?.children[2]?.children[0]?.children[0]?.children[0];
  const likeBtn = videoBtns?.children[0];
  if (likeBtn?.classList && !likeBtn.classList.contains('style-default-active')) {
    likeBtn.click();
  }
  commentVideo();  
}
function commentVideo() {
  // in progress
}
function muteVideo() {
  const muteBtn = document.getElementsByClassName('ytp-mute-button ytp-button');
  console.log('MUTE', muteBtn);
  if (muteBtn?.length && muteBtn[0] && muteBtn[0].title?.indexOf('Mute') === 0) {
    muteBtn[0].click();
  }
}
function muteVideoOnce() {
  console.log('MUTEONCE');
  // need to clean unused props
  document.dispatchEvent(new KeyboardEvent('keydown', {
    altKey: false,
    bubbles: true,
    cancelBubble: false,
    cancelable: true,
    charCode: 0,
    code: "KeyM",
    composed: true,
    ctrlKey: false,
    currentTarget: null,
    defaultPrevented: false,
    detail: 0,
    eventPhase: 0,
    isComposing: false,
    key: "m",
    keyCode: 77,
    location: 0,
    metaKey: false,
    repeat: false,
    returnValue: true,
    shiftKey: false
  }));
}
function changeVideoQuality() {
  window.focus()
  const btn = document.getElementsByClassName('ytp-button ytp-settings-button');
  if (btn.length) {
    btn[0].cilck();
  }
}
function getVideoStart(video) {
  // get random length
  const randomMultiplier = (0.5 + Math.random() * 1);
  let watchTimeSec = Math.floor(randomMultiplier * 60 + 100, 0); // random time + ads
  watchTimeSec = 15; // for testing

  // get video duration
  let timer1 = video?.children[0]?.children[1]?.children[0]?.children[0]?.children[2]?.children[1]?.children[1];
  let timer2 = video?.children[0]?.children[0]?.children[0]?.children[2]?.children[2]?.children[1];
  let timer3 = video?.children[1]?.children[0]?.children[0]?.children[0]?.children[2]?.children[2]?.children[1];
  let timer = timer1?.innerHTML || timer2?.innerHTML || timer3?.innerHTML;
  if (!timer) return [watchTimeSec, 0, 0];
  const timeArr = timer.replaceAll(' ', '').replaceAll('\n', '').split(':');
  if (timeArr.length === 2) timeArr.unshift(0);
  let [hours, minutes, seconds] = timeArr;
  seconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);

  // get start time
  watchTimeSec = Math.min(watchTimeSec, seconds);
  const startSeconds = seconds - watchTimeSec;
  return [watchTimeSec, startSeconds, seconds];
}
// -- end helpers -------------------------



async function continuePlaylist(tab) {
  // continue playing videos in a tab
  const { tabIndex, videoIndex, mute: muteFlag, openTab, loopLength, nTabs, offset } = tab;

  setTimeout(() => {
    console.log('nextTab:', tabIndex, muteFlag);
    if (muteFlag) muteVideoOnce();
    setTimeout(() => muteVideo(), 500);
    likeVideo();
  }, 2000);

  setTimeout(async () => {
    let tabs = await chrome.storage.local.get('tabs');
    tabs = tabs.tabs;
    tabs[tabIndex][videoIndex].openTab = false;
    tabs.forEach(t => { t.forEach(v => { v.mute = false; }) });
    chrome.storage.local.set({ tabs });

    // loop videos in the same tab
    const newVideoIndex = (videoIndex + 1) % loopLength;
    const watchTime = tabs[tabIndex][newVideoIndex]?.watchTime || 40;
    let newUrl = tabs[tabIndex][newVideoIndex].url;
    console.log('NEW TABS:', tabIndex, newVideoIndex, newUrl, watchTime, tabs);
    
    setTimeout(async () => {
      // update timer
      let tabsTimer = await chrome.storage.local.get('tabsTimer');
      tabsTimer = tabsTimer.tabsTimer;
      tabsTimer[tabIndex] = { ...tabs[tabIndex][newVideoIndex], openTime: (new Date()).getTime() };
      chrome.storage.local.set({ tabsTimer });
      location.replace(newUrl);
    }, 1000 * watchTime);

    // open new tab if not all of them were opened yet
    if (openTab && tabIndex + 1 < tabs.length) {
      // update timer
      let newTabIndex = tabIndex + 1;
      let tabsTimer = await chrome.storage.local.get('tabsTimer');
      tabsTimer = tabsTimer.tabsTimer;
      tabsTimer[newTabIndex] = { ...tabs[newTabIndex][0], openTime: (new Date()).getTime() };
      chrome.storage.local.set({ tabsTimer });
      
      setTimeout(() => window.open(tabs[newTabIndex][0].url), 100);
    }
  }, 4000);
}



async function openFirstTab() {
  // open first tab
  let nTabs = await chrome.storage.local.get('nTabs');
  nTabs = nTabs.nTabs;

  setTimeout(async () => {
    const videos1 = document.getElementsByClassName('yt-simple-endpoint style-scope ytd-playlist-panel-video-renderer'); 
    const videos2 = document.querySelectorAll("ytd-playlist-video-renderer.style-scope.ytd-playlist-video-list-renderer");

    let videos = videos1.length ? [...videos1] : [...videos2];
    if (!videos.length) {
      chrome.storage.local.set({ playlistType: null });
      chrome.storage.local.set({ videos: [] });
      return;
    }
  
    const urls = [...videos].map((v, i) => {
      const [watchTime, startTime, duration] = getVideoStart(v);
      const randomMultiplier = (0.5 + Math.random() * 1);
      const validWatchTime = (isNaN(watchTime) || !watchTime) ? Math.floor(randomMultiplier * 60 + 100, 0) : watchTime;
      const validStartTime = isNaN(startTime) ? 0 : startTime;
      let url = v.href || v?.children[1]?.children[0]?.children[0]?.children[0]?.href;
      return { url: url + '&t=' + validStartTime + 's', watchTime: validWatchTime, duration };
    });

    if (!urls.length) {
      alert('Cannot find videos. Open YouTube playlist.');
      return;
    }

    let maxN = Math.min(urls.length, 300);
    loopLength = Math.floor(maxN / nTabs, 0) || 1;

    let tabs = [];
    for (let tIndex = 0; tIndex < nTabs; tIndex += 1) {
      let offset = tIndex * loopLength;
      let tabUrls = urls.slice(offset, offset + loopLength);
      tabUrls = tabUrls.map((v, vIndex) => {
        return {
          duration: v.duration,
          watchTime: v.watchTime,
          url: v.url,
          openTab: !vIndex,
          offset,
          loopLength,
          tabIndex: tIndex,
          videoIndex: vIndex,
          mute: !tIndex && !vIndex,
        };
      });
      tabs.push(tabUrls);
    }
    chrome.storage.local.set({ tabs });
    console.log('tabsFirstLoad:', tabs);

    setTimeout(() => {
      console.log('open:', tabs[0][0].url);
      // update timer
      let tabsTimer = tabs.map(d => ({}));
      tabsTimer[0] = { ...tabs[0][0], openTime: (new Date()).getTime() };
      chrome.storage.local.set({ tabsTimer });
      // window.open(tabs[0][0].url); // for debugging
      location.replace(tabs[0][0].url);
    }, 100);

  }, 5000);
}


// sometimes parameters are lost in url - using storage instead of url to pass all parameters
// saving time before tab is opened and url of the new tab to storate, then grabbing parameters from storage based on url and if time interval < 2-5 sec
const loc = window.location.href;
async function checkFirstTabFlag() {
  // first tab logic
  // in the first tab it grabs videos from the playlist and generates a list of videos for each tab
  let openFirstTabFlag = false;
  let startUrl = await chrome.storage.local.get('startUrl');
  let openTime = await chrome.storage.local.get('openTime');

  if (!startUrl.startUrl || !openTime.openTime) return;
  let [origin, search] = startUrl.startUrl.split('?');
  let playlist = (new URLSearchParams('?' + search)).get('list');

  openFirstTabFlag = loc.includes(playlist) && ((new Date()).getTime() - openTime.openTime) / 1000 < 2;

  if (openFirstTabFlag) {
    openFirstTab();
  }
}
checkFirstTabFlag();


async function checkContinueFlag() {
  // on url updated
  // continue playing videos in the list, and open a new tab if not all of them were opened yet
  let video = (new URLSearchParams(window.location.search)).get('v');
  let playlist = (new URLSearchParams(window.location.search)).get('list');

  let tabsTimer = await chrome.storage.local.get('tabsTimer');
  tabsTimer = tabsTimer.tabsTimer;
  if (!tabsTimer?.length) return;

  const tab = tabsTimer.find(t => t.url?.includes(video) && t.url?.includes(playlist));
  if (!tab?.openTime) return;
  let timeStamp = tab.openTime;
  let tabUrl = tab.url;

  let timeOffset = 5;
  if (tabUrl.includes(video) && tabUrl.includes(playlist) && ((new Date()).getTime() - timeStamp) / 1000 < timeOffset) {
    setTimeout(() => { continuePlaylist(tab); }, 100);
  }
}
checkContinueFlag();
