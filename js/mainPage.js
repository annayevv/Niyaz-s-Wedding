const weddingDate = new Date("2026-09-12T18:00:00+05:00");
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
let musicWasPausedByUser = false;

function updateMusicButton(isPlaying) {
  if (!musicToggle) return;

  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute(
    "aria-label",
    isPlaying ? "Sazy duruz" : "Sazy dowam etdir",
  );
  musicToggle.title = isPlaying ? "Sazy duruz" : "Sazy dowam etdir";
}

async function playMusic() {
  if (!backgroundMusic || musicWasPausedByUser) return false;

  try {
    await backgroundMusic.play();
    updateMusicButton(true);
    return true;
  } catch {
    updateMusicButton(false);
    return false;
  }
}

if (backgroundMusic && musicToggle) {
  backgroundMusic.volume = 0.65;

  musicToggle.addEventListener("click", async () => {
    if (backgroundMusic.paused) {
      musicWasPausedByUser = false;
      await playMusic();
    } else {
      musicWasPausedByUser = true;
      backgroundMusic.pause();
      updateMusicButton(false);
    }
  });

  backgroundMusic.addEventListener("play", () => updateMusicButton(true));
  backgroundMusic.addEventListener("pause", () => updateMusicButton(false));

  playMusic();

  const startAfterFirstTouch = async (event) => {
    if (event.target instanceof Element && event.target.closest("#musicToggle")) {
      return;
    }
    if (!musicWasPausedByUser && backgroundMusic.paused) await playMusic();
    if (!backgroundMusic.paused) {
      document.removeEventListener("pointerdown", startAfterFirstTouch);
      document.removeEventListener("keydown", startAfterFirstTouch);
    }
  };

  document.addEventListener("pointerdown", startAfterFirstTouch);
  document.addEventListener("keydown", startAfterFirstTouch);
}

function updateCountdown() {
  const distance = Math.max(0, weddingDate.getTime() - Date.now());
  const values = {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
  };
  Object.entries(values).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

let scrollAnimation;

function smoothScrollTo(target, duration = 1350) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    target.scrollIntoView();
    return;
  }

  cancelAnimationFrame(scrollAnimation);
  const start = window.scrollY;
  const destination = target.getBoundingClientRect().top + start;
  const distance = destination - start;
  const startedAt = performance.now();
  const previousScrollBehavior = document.documentElement.style.scrollBehavior;

  document.documentElement.style.scrollBehavior = "auto";

  function animate(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased =
      progress < 0.5
        ? 16 * progress ** 5
        : 1 - Math.pow(-2 * progress + 2, 5) / 2;

    window.scrollTo(0, start + distance * eased);

    if (progress < 1) {
      scrollAnimation = requestAnimationFrame(animate);
    } else {
      document.documentElement.style.scrollBehavior = previousScrollBehavior;
    }
  }

  scrollAnimation = requestAnimationFrame(animate);
}

document.querySelectorAll("[data-scroll-to]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.scrollTo);
    if (target) smoothScrollTo(target);
  });
});

const saveDateButton = document.getElementById("saveDateButton");
const calendarMessage = document.getElementById("calendarMessage");

if (saveDateButton) {
  saveDateButton.addEventListener("click", () => {
    const createdAt = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const calendarData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Niyazmyrat we Enesh//Toy Cakylygy//TK",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Niyazmyrat we Eneshing toy dabarasy",
      "X-WR-TIMEZONE:Asia/Ashgabat",
      "BEGIN:VEVENT",
      "UID:niyazmyrat-enesh-20260912@toy-cakylygy",
      `DTSTAMP:${createdAt}`,
      "DTSTART;TZID=Asia/Ashgabat:20260912T180000",
      "DTEND;TZID=Asia/Ashgabat:20260913T000000",
      "SUMMARY:Niyazmyrat we Eneshiň toý dabarasy",
      "DESCRIPTION:Biz sizi toý dabarasyna çagyrýarys.",
      "LOCATION:Aşgabat şäheri\, Türkmenistan",
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Toý dabarasy ertir sagat 18:00-da başlanýar",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const file = new Blob([calendarData], {
      type: "text/calendar;charset=utf-8",
    });
    const fileUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = fileUrl;
    link.download = "Niyazmyrat-we-Enesh-12-09-2026.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1500);

    if (calendarMessage) {
      calendarMessage.textContent =
        "Kalendar faýly taýýarlandy — ony açyp senäni kalendaryňyza goşuň.";
    }
  });
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

const rsvpForm = document.getElementById("rsvpForm");
if (rsvpForm) {
  rsvpForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const message = document.getElementById("formMessage");
    message.textContent = `Sag boluň, ${name}! Jogabyňyz bellige alyndy.`;
    rsvpForm.reset();
  });
}
