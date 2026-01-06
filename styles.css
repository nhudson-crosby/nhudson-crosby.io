:root{
  --card-bg: rgba(12, 14, 12, 0.74);
  --border: rgba(255,255,255,0.18);
  --text: #f7f3ff;
  --soft: rgba(255,255,255,0.10);
}

*{ box-sizing:border-box; }
html, body{ height:100%; }

body{
  margin:0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  color: var(--text);
  overflow-x:hidden;
  cursor: url("assets/ui/cursor.png"), auto;
}

/* BACKGROUND LAYERS */
.bgLayer{
  position:fixed; inset:0;
  background: url("assets/bg-forest.jpg") center/cover no-repeat fixed;
  z-index:-3;
}
.parallaxLayer{
  position:fixed; inset:-20%;
  background:
    radial-gradient(circle at 20% 30%, rgba(255,150,0,0.14), transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(190,120,255,0.14), transparent 45%),
    radial-gradient(circle at 50% 90%, rgba(120,255,190,0.08), transparent 50%);
  animation: drift 18s linear infinite;
  z-index:-2;
}
@keyframes drift{
  0%{transform:translate(0,0)}
  50%{transform:translate(-2%,1%)}
  100%{transform:translate(0,0)}
}

/* LAYOUT */
.container{
  max-width: 1050px;
  margin: 0 auto;
  padding: 24px 14px 60px;
}

.profileHeader{
  background: var(--card-bg);
  border:1px solid var(--border);
  border-radius: 18px;
  padding: 16px 16px 14px;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 34px rgba(0,0,0,0.35);
}

.headerTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}

.badge{
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border:1px solid var(--border);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(255,255,255,0.06);
}

.nowPlaying{
  display:flex;
  align-items:center;
  gap:10px;
  padding:6px 10px;
  border-radius: 999px;
  border:1px solid var(--border);
  background: rgba(255,255,255,0.06);
}
.npLabel{ font-size:12px; opacity:0.85; }
.npText{ font-size:12px; max-width: 380px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

h2{ margin: 10px 0 6px; }
.status{ margin:0; opacity:0.92; }

.sparkle{
  text-shadow: 0 0 10px rgba(255,255,255,0.25);
}

/* Marquee */
.marqueeWrap{
  margin-top: 12px;
  border-radius: 999px;
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.25);
  overflow:hidden;
}
.marquee{
  display:inline-block;
  padding: 8px 0;
  white-space:nowrap;
  animation: scroll 18s linear infinite;
  opacity:0.92;
}
@keyframes scroll{
  0%{ transform: translateX(100%); }
  100%{ transform: translateX(-100%); }
}

/* GRID */
.grid{
  margin-top: 14px;
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.card{
  background: var(--card-bg);
  border:1px solid var(--border);
  border-radius: 18px;
  padding: 16px;
  position:relative;
  overflow:hidden;
  backdrop-filter: blur(6px);
  box-shadow: 0 12px 34px rgba(0,0,0,0.35);
  transition: transform 180ms ease, box-shadow 180ms ease;
}
.card.wide{ grid-column: 1 / -1; }
.card:hover{
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(0,0,0,0.45);
}

/* GLITTER OVERLAY */
.card::after{
  content:"";
  position:absolute;
  inset:-40%;
  background: url("assets/ui/glitter.gif");
  background-size: 220px 220px;
  opacity: 0;
  transform: rotate(10deg);
  transition: opacity 180ms ease;
  pointer-events:none;
  mix-blend-mode: screen;
}
.card:hover::after{ opacity: 0.22; }

/* DIVIDER */
.divider{
  height: 10px;
  margin: 14px 0;
  border-radius: 999px;
  border:1px solid rgba(255,255,255,0.10);
  background-image: repeating-linear-gradient(
    90deg,
    rgba(255,255,255,0.14) 0 10px,
    transparent 10px 20px
  );
  opacity: 0.95;
}

.profileFacts .factRow{
  display:flex;
  gap:10px;
  padding: 8px 10px;
  border: 1px dashed rgba(255,255,255,0.22);
  border-radius: 12px;
  margin: 8px 0;
}
.profileFacts .factRow span{
  min-width: 92px;
  opacity: 0.85;
}

/* LINKS (sparkly) */
a{
  color: #ffe1ff;
  text-decoration: none;
  border-bottom: 1px dashed rgba(255,255,255,0.35);
  transition: filter 180ms ease, text-shadow 180ms ease, border-color 180ms ease;
}
a:hover{
  filter: brightness(1.12);
  text-shadow: 0 0 10px rgba(255,255,255,0.35);
  border-color: rgba(255,255,255,0.65);
}
.linkList{ margin: 8px 0 0 18px; }
.linkList li{ margin: 8px 0; }

/* BLINKIES (no external images needed) */
.blinkiesGrid{
  display:grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
}
.blinkiesRow{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
  margin-bottom: 10px;
}
.blinkie{
  display:inline-block;
  padding: 7px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.06);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  animation: blink 1.2s steps(2, end) infinite;
  box-shadow: 0 0 16px rgba(255,255,255,0.08);
}
.blinkie.alt{
  animation-duration: 0.9s;
}
@keyframes blink{
  0%, 49%{ opacity: 1; }
  50%, 100%{ opacity: 0.55; }
}

/* THRIFT */
.thriftGrid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.thriftRow{
  display:flex;
  gap:10px;
  padding: 10px 12px;
  border: 1px dashed rgba(255,255,255,0.22);
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
}
.thriftRow span{
  min-width: 90px;
  opacity: 0.85;
}

/* TOP 8 */
.top8 h4{ margin: 0 0 10px 0; }
.top8Grid{
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.top8Card{
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.16);
  background: rgba(0,0,0,0.20);
  opacity: 0.95;
}

/* FOOTER */
.footer{
  margin-top: 16px;
  text-align:center;
  opacity:0.85;
  text-shadow: 0 0 10px rgba(255,255,255,0.15);
}

/* OVERLAY */
.overlay{
  position:fixed; inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  background: rgba(0,0,0,0.68);
  z-index:9999;
}
.overlayCard{
  width: min(560px, 92vw);
  background: rgba(20, 22, 20, 0.92);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 18px;
  padding: 18px;
  text-align:center;
  box-shadow: 0 18px 60px rgba(0,0,0,0.55);
}
.enterActions{
  display:flex;
  gap:10px;
  justify-content:center;
  flex-wrap:wrap;
  margin-top: 10px;
}
.tiny{ font-size: 12px; opacity: 0.85; }

/* BUTTONS */
button{
  cursor:pointer;
  border: 1px solid rgba(255,255,255,0.25);
  background: rgba(255,255,255,0.10);
  color: var(--text);
  padding: 10px 12px;
  border-radius: 12px;
  font-weight: 700;
  position:relative;
  overflow:hidden;
}
button.secondary{
  background: rgba(255,255,255,0.06);
}
button:hover{ background: rgba(255,255,255,0.16); }

/* glitter buttons too */
button::after{
  content:"";
  position:absolute;
  inset:-50%;
  background: url("assets/ui/glitter.gif");
  background-size: 180px 180px;
  opacity: 0;
  transition: opacity 160ms ease;
  pointer-events:none;
  mix-blend-mode: screen;
}
button:hover::after{ opacity: 0.28; }

.miniBtn{
  padding: 6px 10px;
  border-radius: 999px;
  font-weight: 800;
}

/* SPRITES */
.sprite{
  position: fixed;
  pointer-events:none;
  z-index: 10;
  filter: drop-shadow(0 10px 14px rgba(0,0,0,0.5));
}
.kitty{
  width: 84px;
  height:auto;
  z-index: 12;
}
.mushroom{
  width: 72px;
  height:auto;
  z-index: 11;
  opacity: 0.98;
  transform-origin: 50% 100%;
}

/* mushroom bob */
@keyframes mushBob{
  0%{ transform: translateY(0) rotate(-1deg); }
  50%{ transform: translateY(-8px) rotate(1deg); }
  100%{ transform: translateY(0) rotate(-1deg); }
}
.mushroom.bob{
  animation: mushBob 3.2s ease-in-out infinite;
}
.mushroom.bob.fast{
  animation-duration: 2.6s;
}

/* HOP (keeps facing direction via CSS var) */
@keyframes hop {
  0%   { transform: translateY(0) scaleX(var(--facing, 1)); }
  35%  { transform: translateY(-34px) scaleX(var(--facing, 1)); }
  70%  { transform: translateY(-34px) scaleX(var(--facing, 1)); }
  100% { transform: translateY(0) scaleX(var(--facing, 1)); }
}
.kitty.hopping{
  animation: hop 520ms ease-out 1;
}

/* GAME */
.hidden{ display:none; }
.gameWrap{ margin-top: 10px; }
.choices{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
  margin-top:10px;
}
.resultText{
  font-weight: 800;
  text-shadow: 0 0 12px rgba(255,255,255,0.18);
}
.sky{
  margin-top: 14px;
  height: 140px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.18);
  position: relative;
  overflow:hidden;
  background: rgba(255,255,255,0.06);
}
.dragon, .rider{
  position:absolute;
  top: 55%;
  transform: translateY(-50%);
  font-size: 44px;
}
.dragon{ left: 10px; }
.rider{ left: 60px; }
.sparkTrail{
  position:absolute;
  inset:0;
  background: radial-gradient(circle at 20% 60%, rgba(255,255,255,0.14), transparent 55%);
  pointer-events:none;
  opacity:0.9;
}
