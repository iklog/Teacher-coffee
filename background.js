// Globale variabler
let state = "sleep";
let countdown;
let awakeTime = 45; // Default værdi
let chokTime = 90;  // Default værdi

// Funktion til at nulstille tilstanden
function noCoffee() {
  state = "sleep";
  if (countdown) {
    clearInterval(countdown);
  }
  chrome.power.releaseKeepAwake();
  chrome.action.setIcon({ path: "Icons/Activator-48x48.png" });
  chrome.action.setTitle({ title: chrome.i18n.getMessage("sleepStateMsg1")+awakeTime+chrome.i18n.getMessage("sleepStateMsg2")+chokTime+chrome.i18n.getMessage("sleepStateMsg3") });
}

// Funktion til at starte timeren
function startTimer(seconds, timerState) {
  clearInterval(countdown);
  const then = Date.now() + seconds * 1000;
  displayTimeLeft(seconds);

  countdown = setInterval(() => {
    const secondsLeft = Math.round((then - Date.now()) / 1000);
    if (secondsLeft < 0 || state !== timerState) {
      clearInterval(countdown);
      if (secondsLeft < 0) {
        noCoffee();
      }
      return;
    }
    displayTimeLeft(secondsLeft);
  }, 5000); // Sat til 5 sekund for en mere jævn opdatering
}

// Funktion til at vise resterende tid
function displayTimeLeft(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  const display = `${minutes}:${remainderSeconds < 10 ? "0" : ""}${remainderSeconds}`;
  chrome.action.setTitle({ title: chrome.i18n.getMessage("keepAwake1") + display + chrome.i18n.getMessage("keepAwake2")});
}

// ========== NY INITIALISERINGS-LOGIK ==========

function initializeApp() {
  // Sæt start-tilstanden
  noCoffee();

  // Lytter KUN efter klik, efter indstillinger er hentet
  chrome.action.onClicked.addListener(() => {
    switch (state) {
      case "sleep":
        state = "awake";
        chrome.power.requestKeepAwake("display");
        chrome.action.setIcon({ path: "Icons/kaffe-48.png" });
        startTimer(awakeTime * 60, state);
        break;
      case "awake":
        state = "kaffechok";
        chrome.action.setIcon({ path: "Icons/kaffechok-48.png" });
        startTimer(chokTime * 60, state);
        break;
      case "kaffechok":
        noCoffee();
        break;
    }
  });
}

// Hent administrerede indstillinger FØRST
chrome.storage.managed.get(['awakeTime', 'coffeeChokTime'], (policy) => {
  // Tjek om admin har sat værdier og opdater dem
  if (policy.awakeTime) {
    awakeTime = policy.awakeTime;
  }
  if (policy.coffeeChokTime) {
    chokTime = policy.coffeeChokTime;
  }
  
  // Start applikationen med de korrekte værdier (enten default eller fra policy)
  initializeApp();
});