const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const filterButtons = [...document.querySelectorAll(".filter-tab")];
const projectCards = [...document.querySelectorAll(".project-card")];
const toolTabs = [...document.querySelectorAll(".tool-tab")];
const toolLists = [...document.querySelectorAll(".tool-list")];
const copyEmail = document.querySelector("#copy-email");

const setHeaderState = () => {
  header.dataset.elevated = String(window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

toolTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const panelId = tab.dataset.panel;
    toolTabs.forEach((item) => item.classList.toggle("is-active", item === tab));
    toolLists.forEach((list) => list.classList.toggle("is-active", list.id === panelId));
  });
});

copyEmail.addEventListener("click", async () => {
  const email = copyEmail.dataset.email;

  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = "Email copied";
    copyEmail.classList.add("is-copied");
  } catch {
    window.location.href = `mailto:${email}`;
  }

  window.setTimeout(() => {
    copyEmail.textContent = "Copy email";
    copyEmail.classList.remove("is-copied");
  }, 1800);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
);

document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));

/* ─── DATA BREACH EFFECT ─── */
const matrixCanvas = document.querySelector("#matrix-canvas");
const matrixCtx = matrixCanvas.getContext("2d");
const crackCanvas = document.querySelector("#crack-canvas");
const crackCtx = crackCanvas.getContext("2d");
const crackCanvasIn = document.querySelector("#crack-canvas-in");
const crackCtxIn = crackCanvasIn.getContext("2d");

const glyphs = "01KRSECATTCKWAZUHSPLUNKFORENSIC<>{}[]#!@$%^&";
const breachWords = [
  "CONFIDENTIAL", "DATA", "RESTRICTED", "ACCESS", "PASSWORDS", "CREDENTIALS", 
  "FINANCIAL", "RECORDS", "USER", "IDENTITY", "BREACH", "LEAK", "PAYLOAD"
];

let particlesOut = [];
let particlesIn = [];
let columns = [];
let matrixFontSize = 14;
let frame = 0;
let w, h;

const resizeCanvas = () => {
  const dpr = window.devicePixelRatio || 1;
  w = window.innerWidth;
  const matrixH = window.innerHeight;
  const crackH = window.innerHeight * 1.2; // 120vh
  
  matrixCanvas.width = Math.floor(w * dpr);
  matrixCanvas.height = Math.floor(matrixH * dpr);
  matrixCanvas.style.width = `${w}px`;
  matrixCanvas.style.height = `${matrixH}px`;
  matrixCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  [crackCanvas, crackCanvasIn].forEach(canvas => {
    if(!canvas) return;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(crackH * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${crackH}px`;
    canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  });

  matrixFontSize = w < 720 ? 12 : 14;
  columns = Array.from({ length: Math.ceil(w / matrixFontSize) }, () => Math.floor(Math.random() * matrixH));
  h = crackH;
};

class BreachParticle {
  constructor(isInward = false) {
    this.isInward = isInward;
    this.reset();
  }

  reset() {
    if (this.isInward) {
      // Spawn scattered from the left/center and fly INWARDS to the right crack
      this.x = Math.random() * (w * 0.7);
      this.y = h * 0.5 + (Math.random() - 0.5) * (h * 0.8);
      
      // Fly towards the sink on the right
      const targetX = w * 0.85;
      const targetY = h * 0.5;
      const dx = targetX - this.x;
      const dy = targetY - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const speed = 0.8 + Math.random() * 1.5; // SLOWED DOWN
      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
      this.alpha = 0; // fade in
      this.decay = -0.01 - Math.random() * 0.01; // negative decay means it grows opacity
    } else {
      // Spawn from inside the Nether portal
      this.x = w * 0.15 + (Math.random() - 0.5) * 60;
      this.y = h * 0.5 + (Math.random() - 0.5) * 100;
      
      // Fly outwards to the right and slightly up/down (SLOWER)
      this.vx = 0.5 + Math.random() * 1.2; // SLOWED DOWN
      this.vy = (Math.random() - 0.5) * 1; // SLOWED DOWN
      this.alpha = 1;
      this.decay = 0.002 + Math.random() * 0.006; // Slower decay
    }
    
    // Choose between a word or a single character
    this.isWord = Math.random() > 0.6;
    this.text = this.isWord ? breachWords[Math.floor(Math.random() * breachWords.length)] : glyphs[Math.floor(Math.random() * glyphs.length)];
    
    // Scale and opacity
    this.scale = 0.5 + Math.random() * 1.5;
    
    // Color: Blue or Red
    this.isRed = Math.random() > 0.5;
    
    // Occasional cube particle
    this.isCube = Math.random() > 0.9;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    
    if (this.isInward) {
      if (this.alpha > 1) this.decay = 0; // stop fading in
      if (this.x > w * 0.85) this.reset(); // reset if it reaches the sink
    } else {
      if (this.alpha <= 0 || this.x > w) this.reset();
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    
    ctx.globalAlpha = Math.max(0, Math.min(0.35, this.alpha)); // Capped opacity for faint look
    
    if (this.isCube) {
      ctx.fillStyle = this.isRed ? `rgba(255, 77, 106, ${this.alpha})` : `rgba(77, 139, 255, ${this.alpha})`;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillRect(-4, -4, 8, 8);
    } else {
      ctx.font = `10px "Press Start 2P", monospace`;
      ctx.fillStyle = this.isRed ? `rgba(255, 77, 106, ${this.alpha})` : `rgba(77, 139, 255, ${this.alpha})`;
      ctx.shadowBlur = 8;
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillText(this.text, 0, 0);
    }
    
    ctx.restore();
  }
}

const initParticles = () => {
  particlesOut = Array.from({ length: 45 }, () => new BreachParticle(false));
  particlesIn = Array.from({ length: 45 }, () => new BreachParticle(true));
  // Pre-warm out particles
  for(let i=0; i<100; i++) particlesOut.forEach(p => p.update());
};

const drawNetherPortal = (ctx, isSink = false) => {
  const cx = isSink ? w * 0.85 : w * 0.15;
  const cy = h * 0.5;
  
  // Twitch effect (glitching)
  const isTwitch = Math.random() > 0.85;
  const twitchX = isTwitch ? (Math.random() - 0.5) * 6 : 0;
  const twitchY = isTwitch ? (Math.random() - 0.5) * 6 : 0;
  
  ctx.save();
  ctx.translate(cx + twitchX, cy + twitchY);
  
  const blockSize = 40;
  const wBlocks = 2; // interior width in blocks
  const hBlocks = 3; // interior height in blocks
  const iW = wBlocks * blockSize;
  const iH = hBlocks * blockSize;
  
  // Obsidian Frame (Dark Purple-Black)
  ctx.fillStyle = '#150824';
  ctx.shadowBlur = 15;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  
  // Left pillar
  ctx.fillRect(-iW/2 - blockSize, -iH/2 - blockSize, blockSize, iH + 2*blockSize);
  // Right pillar
  ctx.fillRect(iW/2, -iH/2 - blockSize, blockSize, iH + 2*blockSize);
  // Top bar
  ctx.fillRect(-iW/2, -iH/2 - blockSize, iW, blockSize);
  // Bottom bar
  ctx.fillRect(-iW/2, iH/2, iW, blockSize);
  
  // Pixel highlights for obsidian
  ctx.fillStyle = '#2d164d';
  ctx.shadowBlur = 0;
  ctx.fillRect(-iW/2 - blockSize + 4, -iH/2 - blockSize + 4, 12, 12);
  ctx.fillRect(iW/2 + 8, iH/2 + 8, 12, 12);
  ctx.fillRect(-iW/2 + 12, -iH/2 - blockSize + 8, 12, 12);
  
  // Portal Interior (Purple)
  ctx.fillStyle = 'rgba(144, 20, 255, 0.7)';
  ctx.shadowBlur = 40;
  ctx.shadowColor = 'rgba(180, 50, 255, 1)';
  ctx.fillRect(-iW/2, -iH/2, iW, iH);
  ctx.shadowBlur = 0;
  
  // Swirling pixel blocks inside the portal
  for(let i=0; i<10; i++) {
    const sx = -iW/2 + Math.random() * (iW - 12);
    const sy = -iH/2 + Math.random() * (iH - 12);
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(215, 120, 255, 0.8)' : 'rgba(80, 10, 180, 0.8)';
    ctx.fillRect(Math.floor(sx/8)*8, Math.floor(sy/8)*8, 12, 12);
  }
  
  ctx.restore();
};

const animate = () => {
  frame++;
  
  // 1. Matrix Background Noise - SLOWED DOWN
  // Update matrix only every 4th frame (simulates ~15 fps matrix speed)
  if (frame % 4 === 0) {
    matrixCtx.fillStyle = "rgba(8, 8, 15, 0.2)";
    matrixCtx.fillRect(0, 0, w, window.innerHeight);
    matrixCtx.font = `${matrixFontSize}px "Press Start 2P", monospace`;

    columns.forEach((y, index) => {
      const isRed = (frame * 0.02 + index * 0.1) % 2 > 1;
      matrixCtx.fillStyle = isRed ? `rgba(255, 77, 106, 0.3)` : `rgba(77, 139, 255, 0.3)`;
      const glyph = glyphs[Math.floor(Math.random() * glyphs.length)];
      matrixCtx.fillText(glyph, index * matrixFontSize, y);
      columns[index] = y > window.innerHeight + Math.random() * 10000 ? 0 : y + matrixFontSize;
    });
  }

  // 2. Outward Portal (Left Side)
  crackCtx.clearRect(0, 0, w, h);
  drawNetherPortal(crackCtx, false);
  particlesOut.forEach(p => { p.update(); p.draw(crackCtx); });

  // 3. Inward Portal (Right Side Sink)
  if (crackCtxIn) {
    crackCtxIn.clearRect(0, 0, w, h);
    drawNetherPortal(crackCtxIn, true);
    particlesIn.forEach(p => { p.update(); p.draw(crackCtxIn); });
  }

  requestAnimationFrame(animate);
};

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  resizeCanvas();
  initParticles();
  animate();
  window.addEventListener("resize", resizeCanvas);
}
