// =========================
// 固定内部画布尺寸：所有素材按 1920 x 1197 制作
// 显示时：居中 + 等比缩放
// =========================
const BASE_W = 1920;
const BASE_H = 1197;

// =========================
// 三地主题配色
// =========================
let guangxiColors = ["#4076A2", "#A13324", "#291514", "#F2E596", "#E472A6"];
let guizhouColors = ["#8B0110", "#C98240", "#EC509A", "#357843", "#3246DB"];
let chongqingColors = ["#08468F", "#86ADBE", "#A25F34", "#DCBC45"];

// =========================
// 可调参数区
// =========================
const CFG = {
  floatingCount: 100,
  floatingSizeMin: 20,
  floatingSizeMax: 60,
  floatingSpeedMin: 0.08,
  floatingSpeedMax: 0.22,
  floatingDrift: 0.12,
  floatingPushRadius: 120,
  floatingPushStrength: 3,
  floatingAlphaBase: 80,
  floatingAlphaPulse: 30,

  trailLength: 22,
  trailAlphaMax: 42,
  trailWeightMax: 6,

  homeBgBreathe: 0.006,
  titleBaseSize: 0.45,
  titleHoverScale: 1.055,

  mapInSpeed: 0.016,
  mapSlideAmount: 0.14,

  nodeHitScale: 0.52,
  nodeIdleBreathe: 0.005,
  nodeHoverScale: 1.025,
  nodeGlowSizeOuter: 1.08,
  nodeGlowSizeInner: 0.94,
  nodeGlowAlphaOuter: 52,
  nodeGlowAlphaInner: 140,
  nodeGlowWeightOuter: 17,
  nodeGlowWeightInner: 3.2,

  tagW: 220,
  tagH: 52,
  tagOffsetY: 0.62,
  cursorTextOffsetX: 18,
  cursorTextOffsetY: -22,

  pathStart1: 0.7,
  pathStart2: 1.5,
  pathDuration: 1.25,
  pathGlowWeightOuter: 14,
  pathGlowWeightMiddle: 5,
  pathGlowWeightCore: 2.2,

  doorInSpeed: 0.018,
  doorBgStartScale: 0.965,
  doorBgEndScale: 1.0,
  doorBgBreathe: 0.002,
  doorDarken: 24,
  leafFloatX: 4,
  leafFloatY: 3,
  leafAlpha: 220,

  centerXRatio: 0.5,
  centerYRatio: 0.55,
  centerSizeRatio: 0.34,
  centerHitScale: 0.52,
  centerHoverBoost: 0.035,
  centerBreathe: 0.012,
  centerAuraPulse: 0.035,
  centerAuraOuterAlpha: 38,
  centerAuraMiddleAlpha: 95,
  centerAuraThinAlpha: 105,
  centerAuraOuterWeight: 26,
  centerAuraMiddleWeight: 5,
  centerAuraThinWeight: 1.3,

  colorBgAlpha: 32,
  colorCenterScale: 0.62,
  colorBallSize: 126,
  colorBallHoverScale: 1.12,
  colorBallSelectedScale: 1.18,
  colorLineAlpha: 150,
  colorLineWeight: 3,
  colorInvalidTime: 70,
  colorClearW: 170,
  colorClearH: 58,

  resultImageFadeEdge: 58,
  resultImageAlpha: 238,
  resultGhostAlpha: 34,
  resultTextX: 185,
  resultTextY: 250,
  resultTextW: 610,

  // 手势控制参数
  controlMode: "mouse", // 默认鼠标；按空格切换到手势
  handEnabled: true,
  handSmoothing: 0.08,
  handDeadZone: 14,
  handLostTolerance: 60,
  handPinchThreshold: 34,
  handReleaseThreshold: 88,
  handPinchConfirmFrames: 5,
  handReleaseConfirmFrames: 5,
  handClickCooldown: 30,
  handCursorSize: 34
};

// =========================
// 图片变量
// =========================
let homeBg, titleImg;
let journeyBg, mapImg;
let iconGx, iconGz, iconCq;

let bgDoorGuangxi, leafOverlayGuangxi, drumCenterGuangxi;
let bgDoorGuizhou, leafOverlayGuizhou, patternCenterGuizhou;
let bgDoorChongqing, leafOverlayChongqing, centerBridgeChongqing;

let resultImages = {};
let resultFeatherCache = {};

// =========================
// 页面状态
// =========================
let page = "home";
let previousPage = null;
let lastDoorProvince = null;
let currentProvince = null;

let homeFade = 0;
let titleScale = 1;
let journeyStartFrame = 0;
let mapProgress = 0;
let doorStartFrame = 0;
let doorProgress = 0;
let centerScale = 1;
let hoverIndex = -1;
let hoverTimer = 0;
let textTimer = 0;

let points = [];
let floatingChars = [];
let trail = [];

let selectedColors = [];
let selectedPattern = null;
let colorHoverIndex = -1;
let invalidTimer = 0;
let colorPageStartFrame = 0;
let colorScales = [];

let resultPageStartFrame = 0;

// =========================
// 手势识别变量
// =========================
let handVideo = null;
let handPoseModel = null;
let handPredictions = [];
let handReady = false;
let handDetected = false;

let handX = BASE_W / 2;
let handY = BASE_H / 2;
let rawHandX = BASE_W / 2;
let rawHandY = BASE_H / 2;

let handLostFrames = 0;
let pinchWasDown = false;
let pinchConfirmFrames = 0;
let releaseConfirmFrames = 0;
let handClickCooldown = 0;
let lastToggleFrame = -9999;

// =========================
// 预加载图片
// 这版会直接弹窗告诉你哪个图片名错了
// =========================
function preload() {
  function L(fileName) {
    return loadImage(
      fileName,
      function () {
        console.log("加载成功：" + fileName);
      },
      function () {
        console.error("缺少图片或文件名不对：" + fileName);
        alert("缺少图片或文件名不对：\n" + fileName);
      }
    );
  }

  homeBg = L("home-bg.png");
  titleImg = L("title.png");

  journeyBg = L("journey-bg.png");
  mapImg = L("map.png");

  iconGx = L("icon-gx.png");
  iconGz = L("icon-gz.png");
  iconCq = L("icon-cq.png");

  bgDoorGuangxi = L("bg_door_guangxi.png");
  leafOverlayGuangxi = L("leaf_overlay_guangxi.png");
  drumCenterGuangxi = L("drum_center_guangxi.png");

  bgDoorGuizhou = L("bg_door_guizhou.png");
  leafOverlayGuizhou = L("leaf_overlay_guizhou.png");
  patternCenterGuizhou = L("pattern_center_guizhou.png");

  bgDoorChongqing = L("bg_door_chongqing.png");
  leafOverlayChongqing = L("leaf_overlay_chongqing.png");
  centerBridgeChongqing = L("center_bridge_chongqing.png");

  resultImages["gx_01"] = L("result_gx_01.png");
  resultImages["gx_02"] = L("result_gx_02.png");
  resultImages["gx_03"] = L("result_gx_03.png");
  resultImages["gx_04"] = L("result_gx_04.png");
  resultImages["gx_05"] = L("result_gx_05.png");

  resultImages["gz_01"] = L("result_gz_01.png");
  resultImages["gz_02"] = L("result_gz_02.png");
  resultImages["gz_03"] = L("result_gz_03.png");
  resultImages["gz_04"] = L("result_gz_04.png");
  resultImages["gz_05"] = L("result_gz_05.png");

  resultImages["cq_01"] = L("result_cq_01.png");
  resultImages["cq_02"] = L("result_cq_02.png");
  resultImages["cq_03"] = L("result_cq_03.png");
  resultImages["cq_04"] = L("result_cq_04.png");
  resultImages["cq_05"] = L("result_cq_05.png");
}

function setup() {
  pixelDensity(2);
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  textFont("LiSu");
  smooth();

  points = [
    { id: "guangxi", name: "廣西｜巖之形", x: 0.505, y: 0.83, img: iconGx, scale: 1 },
    { id: "guizhou", name: "貴州｜織之紋", x: 0.77, y: 0.48, img: iconGz, scale: 1 },
    { id: "chongqing", name: "重慶｜刻之痕", x: 0.51, y: 0.19, img: iconCq, scale: 1 }
  ];

  let culturalChars = [
    "巖", "刻", "舞", "蛙", "鼓", "祭", "越", "江",
    "痕", "繪", "隱", "現", "蝕", "紋", "跡",
    "鑿", "鑄", "印", "拓", "裂", "滲", "崖", "光", "影"
  ];

  for (let i = 0; i < CFG.floatingCount; i++) {
    floatingChars.push({
      x: random(BASE_W),
      y: random(BASE_H),
      char: random(culturalChars),
      speed: random(CFG.floatingSpeedMin, CFG.floatingSpeedMax),
      size: random(CFG.floatingSizeMin, CFG.floatingSizeMax),
      phase: random(TWO_PI)
    });
  }

  for (let i = 0; i < 5; i++) colorScales.push(1);

  initHandTracking();
}

function draw() {
  // 外部留白统一改成米白色，不再是黑边
  background(244, 237, 220);

  updateHandPointer();

  beginStage();

  if (page === "home") drawHome();
  else if (page === "journey") drawJourney();
  else if (page === "door") drawDoorPage();
  else if (page === "color") drawColorSelectionPage();
  else if (page === "result") drawResultPage();

  drawCursorTrail();
  drawBackButton();
  drawModeBadge();

  if (CFG.controlMode === "hand") {
    drawHandCursor();
    cursor("none");
  }

  endStage();
}

// =========================
// 舞台适配
// =========================
function beginStage() {
  let s = min(width / BASE_W, height / BASE_H);
  let ox = (width - BASE_W * s) / 2;
  let oy = (height - BASE_H * s) / 2;
  push();
  translate(ox, oy);
  scale(s);
}

function endStage() {
  pop();
}

function realMouseStageX() {
  let s = min(width / BASE_W, height / BASE_H);
  let ox = (width - BASE_W * s) / 2;
  return (mouseX - ox) / s;
}

function realMouseStageY() {
  let s = min(width / BASE_W, height / BASE_H);
  let oy = (height - BASE_H * s) / 2;
  return (mouseY - oy) / s;
}

function stageMouseX() {
  if (CFG.controlMode === "hand") return handX;
  return realMouseStageX();
}

function stageMouseY() {
  if (CFG.controlMode === "hand") return handY;
  return realMouseStageY();
}

// =========================
// 首页
// =========================
function drawHome() {
  homeFade = min(homeFade + 3, 255);
  let breathe = sin(frameCount * 0.018) * CFG.homeBgBreathe;

  push();
  tint(255, homeFade);
  translate(BASE_W / 2, BASE_H / 2);
  scale(1.01 + breathe);
  image(homeBg, 0, 0, BASE_W, BASE_H);
  noTint();
  pop();

  drawVignette(0.28);

  let x = BASE_W / 2;
  let y = BASE_H / 2;
  let titleW = BASE_W * CFG.titleBaseSize * titleScale;
  let titleH = titleW * titleImg.height / titleImg.width;

  let mx = stageMouseX();
  let my = stageMouseY();
  let hover =
    mx > x - titleW / 2 &&
    mx < x + titleW / 2 &&
    my > y - titleH / 2 &&
    my < y + titleH / 2;

  titleScale = lerp(titleScale, hover ? CFG.titleHoverScale : 1, 0.1);
  image(titleImg, x, y, titleW, titleH);

  fill(43, 31, 26, 80 + sin(frameCount * 0.035) * 28);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(18);
  text(CFG.controlMode === "hand" ? "捏合进入｜空格切换模式" : "点击进入｜空格切换模式", BASE_W / 2, BASE_H * 0.9);

  if (CFG.controlMode !== "hand") {
    cursor(hover ? "pointer" : "default");
  }
}

// =========================
// 路径页
// =========================
function drawJourney() {
  let journeyTime = (frameCount - journeyStartFrame) / 60;

  image(journeyBg, BASE_W / 2, BASE_H / 2, BASE_W, BASE_H);
  drawSoftAtmosphere();
  drawVignette(0.32);

  mapProgress = min(mapProgress + CFG.mapInSpeed, 1);
  let eased = easeInOutCubic(mapProgress);

  push();
  translate((1 - eased) * BASE_W * CFG.mapSlideAmount, 0);
  tint(255, eased * 255);
  image(mapImg, BASE_W / 2, BASE_H / 2, BASE_W, BASE_H);
  noTint();
  pop();

  drawPathGlow(journeyTime);
  drawFloatingChars();
  drawNodes(journeyTime);
  drawHoverLabel();
}

function drawNodes(journeyTime) {
  hoverIndex = -1;
  let mx = stageMouseX();
  let my = stageMouseY();

  for (let i = 0; i < points.length; i++) {
    let appear = constrain((journeyTime - 1.05 - i * 0.34) / 0.75, 0, 1);
    let a = easeOutCubic(appear);

    let p = points[i];
    let x = BASE_W * p.x;
    let y = BASE_H * p.y;
    let nodeSize = getNodeSize();

    let d = dist(mx, my, x, y);
    let hover = d < nodeSize * CFG.nodeHitScale && appear >= 1;
    if (hover) hoverIndex = i;

    let idle = sin(frameCount * 0.025 + i * 1.4) * CFG.nodeIdleBreathe;
    let targetScale = hover ? CFG.nodeHoverScale : 1 + idle;
    p.scale = lerp(p.scale, targetScale, 0.12);

    push();
    translate(x, y);
    scale(p.scale);
    tint(255, a * 255);
    image(p.img, BASE_W / 2 - x, BASE_H / 2 - y, BASE_W, BASE_H);
    noTint();
    pop();

    drawNodeGlow(x, y, nodeSize, a, hover);
  }

  if (hoverIndex !== -1) {
    hoverTimer = min(hoverTimer + 3, 60);
    textTimer = min(textTimer + 0.7, 60);
  } else {
    hoverTimer = max(hoverTimer - 3, 0);
    textTimer = max(textTimer - 1.4, 0);
  }
}

function drawNodeGlow(x, y, size, alpha01, active) {
  drawingContext.globalCompositeOperation = "lighter";
  noFill();

  let pulse = 1 + sin(frameCount * 0.035) * 0.025;
  let activeBoost = active ? 1.45 : 1;

  stroke(255, 205, 120, CFG.nodeGlowAlphaOuter * alpha01 * activeBoost);
  strokeWeight(active ? 24 : CFG.nodeGlowWeightOuter);
  ellipse(x, y, size * CFG.nodeGlowSizeOuter * pulse, size * CFG.nodeGlowSizeOuter * pulse);

  stroke(255, 235, 180, CFG.nodeGlowAlphaInner * alpha01 * activeBoost);
  strokeWeight(active ? 5 : CFG.nodeGlowWeightInner);
  ellipse(x, y, size * CFG.nodeGlowSizeInner, size * CFG.nodeGlowSizeInner);

  drawingContext.globalCompositeOperation = "source-over";
}

function drawHoverLabel() {
  if (hoverIndex === -1) {
    if (CFG.controlMode !== "hand") cursor("default");
    return;
  }

  let p = points[hoverIndex];
  let x = BASE_W * p.x;
  let y = BASE_H * p.y;
  let nodeSize = getNodeSize();
  let alpha = map(textTimer, 0, 60, 0, 235);

  drawNodeTag(x, y + nodeSize * CFG.tagOffsetY, p.name, "点击进入", alpha);

  fill(255, 240, 200, 180);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(32);
  text("点击", stageMouseX() + CFG.cursorTextOffsetX, stageMouseY() + CFG.cursorTextOffsetY);

  if (CFG.controlMode !== "hand") cursor("pointer");
}

function drawNodeTag(x, y, title, sub, alpha) {
  let tagW = CFG.tagW;
  let tagH = CFG.tagH;

  x = constrain(x, tagW / 2 + 18, BASE_W - tagW / 2 - 18);
  y = constrain(y, tagH / 2 + 18, BASE_H - tagH / 2 - 18);

  push();
  rectMode(CENTER);
  drawingContext.shadowColor = `rgba(0, 0, 0, ${0.22 * alpha / 255})`;
  drawingContext.shadowBlur = 14;
  fill(35, 29, 23, alpha * 0.7);
  stroke(255, 225, 168, alpha * 0.18);
  strokeWeight(1);
  rect(x, y, tagW, tagH, 14);
  drawingContext.shadowBlur = 0;

  fill(255, 240, 205, alpha);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(23);
  text(title, x, y - 8);

  fill(255, 226, 178, alpha * 0.7);
  textSize(14);
  text(sub, x, y + 15);
  pop();
}

// =========================
// 三省门页
// =========================
function drawDoorPage() {
  doorProgress = min(doorProgress + CFG.doorInSpeed, 1);
  let a = easeInOutCubic(doorProgress);

  let assets = getDoorAssets(currentProvince);

  let bgScale =
    lerp(CFG.doorBgStartScale, CFG.doorBgEndScale, a) +
    sin(frameCount * 0.008) * CFG.doorBgBreathe;

  push();
  translate(BASE_W / 2, BASE_H / 2);
  scale(bgScale);
  tint(255, 255 * a);
  image(assets.bg, 0, 0, BASE_W, BASE_H);
  noTint();
  pop();

  noStroke();
  fill(0, 0, 0, CFG.doorDarken * a);
  rect(0, 0, BASE_W, BASE_H);

  let leafX = sin(frameCount * 0.01) * CFG.leafFloatX;
  let leafY = cos(frameCount * 0.008) * CFG.leafFloatY;

  push();
  tint(255, CFG.leafAlpha * a);
  image(assets.leaf, BASE_W / 2 + leafX, BASE_H / 2 + leafY, BASE_W, BASE_H);
  noTint();
  pop();

  let centerX = BASE_W * CFG.centerXRatio;
  let centerY = BASE_H * CFG.centerYRatio;
  let centerSize = BASE_H * CFG.centerSizeRatio;

  let mx = stageMouseX();
  let my = stageMouseY();
  let centerHover = dist(mx, my, centerX, centerY) < centerSize * CFG.centerHitScale;

  let breathe = sin(frameCount * 0.028) * CFG.centerBreathe;
  let hoverBoost = centerHover ? CFG.centerHoverBoost : 0;
  centerScale = lerp(centerScale, 1 + breathe + hoverBoost, 0.08);

  if (CFG.controlMode !== "hand") {
    cursor(centerHover ? "pointer" : "default");
  }

  drawCenterAura(centerX, centerY, centerSize, a);

  push();
  translate(centerX, centerY);
  scale(centerScale);
  tint(255, 255 * a);
  image(assets.center, BASE_W / 2 - centerX, BASE_H / 2 - centerY, BASE_W, BASE_H);
  noTint();
  pop();
}

function getDoorAssets(id) {
  if (id === "guizhou") {
    return {
      bg: bgDoorGuizhou,
      leaf: leafOverlayGuizhou,
      center: patternCenterGuizhou
    };
  }

  if (id === "chongqing") {
    return {
      bg: bgDoorChongqing,
      leaf: leafOverlayChongqing,
      center: centerBridgeChongqing
    };
  }

  return {
    bg: bgDoorGuangxi,
    leaf: leafOverlayGuangxi,
    center: drumCenterGuangxi
  };
}

function drawCenterAura(x, y, size, a) {
  drawingContext.globalCompositeOperation = "lighter";
  noFill();

  let pulse = 1 + sin(frameCount * 0.025) * CFG.centerAuraPulse;

  stroke(188, 130, 54, CFG.centerAuraOuterAlpha * a);
  strokeWeight(CFG.centerAuraOuterWeight);
  ellipse(x, y, size * 1.28 * pulse, size * 1.28 * pulse);

  stroke(238, 188, 92, CFG.centerAuraMiddleAlpha * a);
  strokeWeight(CFG.centerAuraMiddleWeight);
  ellipse(x, y, size * 1.16, size * 1.16);

  stroke(255, 230, 160, CFG.centerAuraThinAlpha * a);
  strokeWeight(CFG.centerAuraThinWeight);
  ellipse(x, y, size * 1.40 * pulse, size * 1.40 * pulse);

  drawingContext.globalCompositeOperation = "source-over";
}

// =========================
// 颜色推演页
// =========================
function drawColorSelectionPage() {
  let assets = getDoorAssets(currentProvince);
  let title = getProvinceTitle(currentProvince);
  let colors = getProvinceColors(currentProvince);

  drawColorPageBackground(assets);
  drawColorPageTitle(title);

  let centerX = BASE_W * 0.5;
  let centerY = BASE_H * 0.55;

  let matched = getCurrentMatchedPattern();
  drawColorPageCenter(assets, centerX, centerY, CFG.colorCenterScale, matched);

  let positions = getColorPositions(colors.length, centerX, centerY);

  drawColorConnections(colors, positions, centerX, centerY);
  drawColorBalls(colors, positions);
  drawClearButton();

  if (invalidTimer > 0) {
    invalidTimer--;
    drawInvalidHint();
  }

  drawColorInstruction(matched);
}

function drawColorPageBackground(assets) {
  background(242, 232, 212);

  push();
  tint(255, CFG.colorBgAlpha);
  image(assets.bg, BASE_W / 2, BASE_H / 2, BASE_W, BASE_H);
  noTint();
  pop();

  let g = drawingContext.createRadialGradient(
    BASE_W * 0.5,
    BASE_H * 0.45,
    120,
    BASE_W * 0.5,
    BASE_H * 0.45,
    850
  );

  g.addColorStop(0, "rgba(255, 248, 226, 0.92)");
  g.addColorStop(0.62, "rgba(242, 232, 212, 0.80)");
  g.addColorStop(1, "rgba(206, 184, 145, 0.30)");

  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);

  noFill();
  stroke(172, 134, 78, 38);
  strokeWeight(1);

  let cx = BASE_W * 0.5;
  let cy = BASE_H * 0.55;
  ellipse(cx, cy, 510 + sin(frameCount * 0.02) * 6, 510 + sin(frameCount * 0.02) * 6);
  ellipse(cx, cy, 680, 680);

  stroke(172, 134, 78, 20);
  line(cx - 360, cy, cx + 360, cy);
  line(cx, cy - 360, cx, cy + 360);
}

function drawColorPageTitle(title) {
  fill(66, 48, 32, 230);
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(58);
  text(title + " · 色彩推演", 210, 96);

  fill(100, 78, 54, 160);
  textSize(26);
  text("选择颜色，系统将保留可成立的色路", 214, 154);
}

function drawColorInstruction(matched) {
  fill(95, 72, 50, 120);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(20);

  if (matched) {
    text("中心图标已点亮：可点击进入", BASE_W / 2, BASE_H - 66);
  } else {
    text("亮起的颜色可继续推演，暗下的颜色暂不可选", BASE_W / 2, BASE_H - 66);
  }
}

function drawColorPageCenter(assets, x, y, scaleValue, matched) {
  let mx = stageMouseX();
  let my = stageMouseY();
  let hover = dist(mx, my, x, y) < BASE_H * 0.18;

  let glowAlpha = matched ? 112 : 42;
  let glowWeight = matched ? 28 : 16;
  let breathe = matched ? sin(frameCount * 0.04) * 0.035 : sin(frameCount * 0.025) * 0.01;

  push();
  translate(x, y);
  scale(scaleValue + breathe + (hover && matched ? 0.035 : 0));
  tint(255, matched ? 255 : 145);
  image(assets.center, BASE_W / 2 - x, BASE_H / 2 - y, BASE_W, BASE_H);
  noTint();
  pop();

  drawingContext.globalCompositeOperation = "lighter";
  noFill();

  stroke(231, 190, 110, glowAlpha);
  strokeWeight(glowWeight);
  ellipse(x, y, matched ? 370 : 330, matched ? 370 : 330);

  stroke(255, 230, 170, matched ? 150 : 70);
  strokeWeight(2.2);
  ellipse(x, y, 350 + sin(frameCount * 0.04) * 12, 350 + sin(frameCount * 0.04) * 12);

  drawingContext.globalCompositeOperation = "source-over";

  if (matched && CFG.controlMode !== "hand") cursor("pointer");
}

function getColorPositions(count, cx, cy) {
  if (count === 4) {
    return [
      { x: cx - 330, y: cy - 190 },
      { x: cx + 330, y: cy - 190 },
      { x: cx - 330, y: cy + 175 },
      { x: cx + 330, y: cy + 175 }
    ];
  }

  return [
    { x: cx, y: cy - 335 },
    { x: cx - 390, y: cy - 110 },
    { x: cx + 390, y: cy - 110 },
    { x: cx - 300, y: cy + 270 },
    { x: cx + 300, y: cy + 270 }
  ];
}

function drawColorConnections(colors, positions, cx, cy) {
  drawingContext.globalCompositeOperation = "lighter";

  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    if (!selectedColors.includes(c.key)) continue;

    let p = positions[i];

    stroke(c.hex + hexAlpha(CFG.colorLineAlpha));
    strokeWeight(CFG.colorLineWeight);
    noFill();

    let midX = lerp(p.x, cx, 0.55);
    let midY = lerp(p.y, cy, 0.55);
    bezier(p.x, p.y, midX, p.y, midX, cy, cx, cy);

    noStroke();
    fill(c.hex);
    ellipse(lerp(p.x, cx, 0.26), lerp(p.y, cy, 0.26), 10, 10);
    ellipse(lerp(p.x, cx, 0.48), lerp(p.y, cy, 0.48), 7, 7);
  }

  drawingContext.globalCompositeOperation = "source-over";
}

function drawColorBalls(colors, positions) {
  colorHoverIndex = -1;

  let mx = stageMouseX();
  let my = stageMouseY();

  for (let i = 0; i < colors.length; i++) {
    let c = colors[i];
    let p = positions[i];

    let selected = selectedColors.includes(c.key);
    let available = isColorAvailable(c.key);
    let hover = dist(mx, my, p.x, p.y) < CFG.colorBallSize * 0.55 && available;

    if (hover) colorHoverIndex = i;

    let targetScale = 1;
    if (selected) targetScale = CFG.colorBallSelectedScale;
    else if (hover) targetScale = CFG.colorBallHoverScale;

    colorScales[i] = lerp(colorScales[i] || 1, targetScale, 0.12);

    drawOneColorBall(p.x, p.y, CFG.colorBallSize, c.hex, selected, hover, available, colorScales[i]);
    drawColorLabel(c, p.x, p.y, available, selected);
  }

  if (colorHoverIndex !== -1 && CFG.controlMode !== "hand") cursor("pointer");
}

function drawOneColorBall(x, y, size, hexColor, selected, hover, available, scaleValue) {
  push();
  translate(x, y);
  scale(scaleValue);

  drawingContext.shadowColor = hexToShadow(hexColor, hover || selected ? 0.52 : 0.18);
  drawingContext.shadowBlur = hover || selected ? 28 : 10;

  noStroke();
  fill(hexColor + hexAlpha(available ? 255 : 55));
  ellipse(0, 0, size, size);

  drawingContext.shadowBlur = 0;

  noFill();
  stroke(255, 250, 230, available ? 210 : 70);
  strokeWeight(5);
  ellipse(0, 0, size * 1.05, size * 1.05);

  if (selected) {
    drawingContext.globalCompositeOperation = "lighter";
    stroke(255, 220, 140, 150 + sin(frameCount * 0.05) * 45);
    strokeWeight(8);
    ellipse(0, 0, size * 1.22, size * 1.22);
    drawingContext.globalCompositeOperation = "source-over";
  }

  if (!available) {
    noStroke();
    fill(242, 232, 212, 125);
    ellipse(0, 0, size * 1.08, size * 1.08);
  }

  pop();
}

function drawColorLabel(c, x, y, available, selected) {
  let side = x < BASE_W / 2 ? -1 : 1;
  let labelX = x + side * 110;
  let labelY = y;

  if (abs(x - BASE_W / 2) < 80) {
    labelX = x;
    labelY = y + 105;
  }

  let alignMode = LEFT;
  if (abs(x - BASE_W / 2) < 80) alignMode = CENTER;
  else if (side < 0) alignMode = RIGHT;

  fill(c.hex + hexAlpha(available ? 230 : 80));
  noStroke();
  textAlign(alignMode, CENTER);
  textSize(28);
  text(c.name, labelX, labelY - 18);

  fill(80, 60, 42, available ? 138 : 62);
  textSize(19);
  text(selected ? "已选" : c.hex, labelX, labelY + 18);
}

function drawClearButton() {
  let x = BASE_W / 2;
  let y = BASE_H - 158;
  let mx = stageMouseX();
  let my = stageMouseY();
  let hover = pointInRect(mx, my, x, y, CFG.colorClearW, CFG.colorClearH);

  push();
  rectMode(CENTER);
  fill(250, 244, 229, hover ? 230 : 170);
  stroke(148, 112, 75, hover ? 160 : 90);
  strokeWeight(1.6);
  rect(x, y, CFG.colorClearW, CFG.colorClearH, 14);

  fill(74, 52, 35, hover ? 230 : 150);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(25);
  text("清空", x, y + 1);
  pop();
}

function drawInvalidHint() {
  let alpha = map(invalidTimer, 0, CFG.colorInvalidTime, 0, 230);
  let shake = sin(frameCount * 0.8) * 6;

  push();
  rectMode(CENTER);
  fill(60, 42, 28, alpha * 0.82);
  noStroke();
  rect(BASE_W / 2 + shake, BASE_H - 250, 330, 54, 12);

  fill(255, 230, 190, alpha);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("此颜色暂不可选", BASE_W / 2 + shake, BASE_H - 250);
  pop();
}

// =========================
// 颜色逻辑
// =========================
function isColorAvailable(key) {
  if (selectedColors.includes(key)) return true;
  if (selectedColors.length === 0) return true;

  let test = [...selectedColors, key];
  let rules = getPatternRules(currentProvince);

  for (let r of rules) {
    if (isSubset(test, r.colors)) return true;
  }

  return false;
}

function getCurrentMatchedPattern() {
  let rules = getPatternRules(currentProvince);

  for (let r of rules) {
    if (sameColorSet(selectedColors, r.colors)) return r;
  }

  return null;
}

function getProvinceTitle(id) {
  if (id === "guizhou") return "贵州";
  if (id === "chongqing") return "重庆";
  return "广西";
}

function getProvinceColors(id) {
  if (id === "guizhou") {
    return [
      { key: "deepRed", name: "深红", hex: "#8B0110" },
      { key: "orange", name: "橙", hex: "#C98240" },
      { key: "pink", name: "粉红", hex: "#EC509A" },
      { key: "green", name: "绿", hex: "#357843" },
      { key: "blue", name: "蓝", hex: "#3246DB" }
    ];
  }

  if (id === "chongqing") {
    return [
      { key: "deepBlue", name: "深蓝", hex: "#08468F" },
      { key: "lightBlue", name: "浅蓝灰", hex: "#86ADBE" },
      { key: "ochre", name: "赭石棕", hex: "#A25F34" },
      { key: "gold", name: "暖金", hex: "#DCBC45" }
    ];
  }

  return [
    { key: "blue", name: "蓝", hex: "#4076A2" },
    { key: "red", name: "红", hex: "#A13324" },
    { key: "brown", name: "深褐", hex: "#291514" },
    { key: "yellow", name: "暖黄", hex: "#F2E596" },
    { key: "pink", name: "粉", hex: "#E472A6" }
  ];
}

function getPatternRules(id) {
  if (id === "guizhou") {
    return [
      {
        id: "gz_01",
        name: "圆形花卉绣片",
        colors: ["deepRed", "pink", "orange"],
        big: "花",
        desc: "圆形花卉绣片以环形结构组织花枝、飞鸟与彩色瓣面，像一枚可以旋转的生命图腾。花卉代表生机，鸟纹与枝蔓象征守护与繁衍。"
      },
      {
        id: "gz_02",
        name: "银饰点缀团花刺绣",
        colors: ["green", "pink", "orange", "deepRed"],
        big: "团",
        desc: "中心团花向四周展开，花瓣、卷草与银饰形成强烈的对称秩序。它不是单纯装饰，而是一种把自然、祝福与身体记忆缝合在一起的苗绣结构。"
      },
      {
        id: "gz_03",
        name: "蓝底花鸟刺绣",
        colors: ["orange", "blue", "pink"],
        big: "鸟",
        desc: "蓝色底布上展开对称花鸟纹，飞鸟与大花共同构成守护性的图案场。彩色羽翎与花瓣让纹样像在布面上呼吸。"
      },
      {
        id: "gz_04",
        name: "人龙共生蛇龙纹绣片",
        colors: ["deepRed"],
        big: "龙",
        desc: "人物立于龙身与水族纹样之间，呈现苗族神话中人与龙、蛇、鱼共生的关系。龙蛇纹象征祖先、力量、护佑与生命循环。"
      },
      {
        id: "gz_05",
        name: "百鸟衣 / 苗族刺绣服饰",
        colors: ["deepRed", "orange"],
        big: "衣",
        desc: "百鸟衣以服饰作为叙事载体，鸟纹、龙纹、蝴蝶纹共同记录祖先迁徙与万物起源。下摆羽毛回应鸟图腾，也强化了身体与自然之间的连接。"
      }
    ];
  }

  if (id === "chongqing") {
    return [
      {
        id: "cq_01",
        name: "石窟室内造像场景",
        colors: ["deepBlue", "ochre"],
        big: "龛",
        desc: "石窟室内造像把佛、菩萨、侍从与洞窟空间组织在同一画面中。斑驳彩绘与岩壁肌理共同留下时间痕迹，形成一种被岁月包裹的叙事空间。"
      },
      {
        id: "cq_02",
        name: "千手千眼观音",
        colors: ["gold"],
        big: "观音",
        desc: "千手千眼观音以层层展开的金色手臂形成巨大的光环。千手象征护持众生，千眼象征遍察苦难，慈悲与智慧在同一身体中被放大。"
      },
      {
        id: "cq_03",
        name: "红色崖壁造像群",
        colors: ["lightBlue", "deepBlue"],
        big: "崖",
        desc: "红色崖壁上的造像群以横向展开的方式呈现众神并列的秩序。蓝灰色彩绘与石质灰面相互叠压，使雕刻既像图像，也像残存的壁画。"
      },
      {
        id: "cq_04",
        name: "释迦涅槃圣迹图",
        colors: ["ochre", "deepBlue", "gold"],
        big: "涅槃",
        desc: "释迦涅槃造像以横卧佛身贯穿画面，弟子与菩萨环侍其侧。涅槃不是普通死亡，而是超越生死的解脱，造像用克制的构图制造出安静而巨大的力量。"
      },
      {
        id: "cq_05",
        name: "青绿装饰纹样石刻局部",
        colors: ["deepBlue", "ochre", "lightBlue"],
        big: "刻",
        desc: "青绿装饰纹样与人物造像交织在一起，花瓣、云纹、衣褶和石面裂痕共同构成重庆石刻的视觉层次。它更像一块被时间冲刷后的立体纹样。"
      }
    ];
  }

  return [
    {
      id: "gx_01",
      name: "红地缠枝牡丹纹妆花缎",
      colors: ["red", "blue"],
      big: "缎",
      desc: "红地与蓝绿花叶形成强烈对比，缠枝牡丹连续蔓延，象征富贵、生长与不断延展的生命秩序。它适合作为广西织物纹样的华丽开场。"
    },
    {
      id: "gx_02",
      name: "粉黄色菱形织物",
      colors: ["brown", "yellow", "pink"],
      big: "织",
      desc: "粉黄与深褐构成柔和的菱形秩序，重复的几何结构像山地、田垄与织线交叠。它强调的是织物本身的节奏感。"
    },
    {
      id: "gx_03",
      name: "壮锦几何花鸟纹挂饰",
      colors: ["brown", "red", "blue"],
      big: "锦",
      desc: "壮锦以菱形、鸟纹与连续边饰组织画面，红、蓝、褐形成稳定的民族织造结构。图案像被编码的路径，也像一段可阅读的地方记忆。"
    },
    {
      id: "gx_04",
      name: "红底缠枝花卉纹背带绣片",
      colors: ["red"],
      big: "花",
      desc: "红底花卉纹以高密度重复构成视觉场，花枝在布面上持续生长。单一红色加强了仪式感，也让纹样具有更强的整体识别度。"
    },
    {
      id: "gx_05",
      name: "绿地菱形花卉纹蜀锦",
      colors: ["blue", "yellow", "red"],
      big: "菱",
      desc: "绿色底面上排列菱形花卉，蓝、黄、红在格纹中跳动。它的重点不是单个图案，而是连续纹样形成的织造秩序。"
    }
  ];
}

function sameColorSet(a, b) {
  if (a.length !== b.length) return false;

  let aa = [...a].sort();
  let bb = [...b].sort();

  for (let i = 0; i < aa.length; i++) {
    if (aa[i] !== bb[i]) return false;
  }

  return true;
}

function isSubset(small, big) {
  for (let item of small) {
    if (!big.includes(item)) return false;
  }
  return true;
}

function toggleColor(key) {
  if (!isColorAvailable(key)) {
    invalidTimer = CFG.colorInvalidTime;
    return;
  }

  let index = selectedColors.indexOf(key);

  if (index !== -1) {
    selectedColors.splice(index, 1);
  } else {
    selectedColors.push(key);
  }
}

function resetColorSelection() {
  selectedColors = [];
  selectedPattern = null;
  invalidTimer = 0;
  colorHoverIndex = -1;
  for (let i = 0; i < colorScales.length; i++) colorScales[i] = 1;
}

// =========================
// 结果页
// =========================
function drawResultPage() {
  let data = selectedPattern || getPatternRules(currentProvince)[0];
  let img = resultImages[data.id];

  let t = constrain((frameCount - resultPageStartFrame) / 55, 0, 1);
  let a = easeOutCubic(t);

  drawResultBackground(data, a);
  drawResultBigText(data, a);
  drawResultInfo(data, a);
  drawResultImage(data, img, a);
  drawResultBottomHint(a);
}

function drawResultBackground(data, a) {
  background(244, 237, 220);

  let baseGrad = drawingContext.createLinearGradient(0, 0, BASE_W, BASE_H);
  baseGrad.addColorStop(0, "rgba(247,241,226,1)");
  baseGrad.addColorStop(0.42, "rgba(236,225,201,1)");
  baseGrad.addColorStop(1, "rgba(220,202,170,1)");
  drawingContext.fillStyle = baseGrad;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);

  let sweep = drawingContext.createLinearGradient(BASE_W * 0.18, 0, BASE_W * 0.92, BASE_H);
  sweep.addColorStop(0, "rgba(255,255,255,0.00)");
  sweep.addColorStop(0.38, `rgba(255,244,220,${0.10 * a})`);
  sweep.addColorStop(0.62, `rgba(255,232,188,${0.14 * a})`);
  sweep.addColorStop(1, "rgba(255,255,255,0.00)");
  drawingContext.fillStyle = sweep;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);

  let spot = drawingContext.createRadialGradient(
    BASE_W * 0.73,
    BASE_H * 0.50,
    80,
    BASE_W * 0.73,
    BASE_H * 0.50,
    620
  );
  spot.addColorStop(0, `rgba(255,252,245,${0.95 * a})`);
  spot.addColorStop(0.24, `rgba(255,245,228,${0.55 * a})`);
  spot.addColorStop(0.58, `rgba(233,212,177,${0.18 * a})`);
  spot.addColorStop(1, "rgba(233,212,177,0)");
  drawingContext.fillStyle = spot;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);

  push();
  noStroke();
  let panelX = BASE_W * 0.2;
  let panelY = BASE_H * 0.03;
  let panelW = 700;
  let panelH = 760;
  fill(255, 251, 242, 30 * a);
  rectMode(CENTER);
  rect(panelX, panelY, panelW, panelH, 28);

  let pulse = 0.5 + 0.5 * sin(frameCount * 0.02);
  drawingContext.shadowColor = `rgba(255, 228, 176, ${0.26 * a + pulse * 0.04 * a})`;
  drawingContext.shadowBlur = 65;
  noFill();
  stroke(255, 246, 225, 92 * a);
  strokeWeight(2.1);
  rect(panelX, panelY, panelW, panelH, 28);
  drawingContext.shadowBlur = 0;
  pop();

  noFill();
  stroke(128, 96, 58, 13 * a);
  strokeWeight(1);
  for (let i = 0; i < 15; i++) {
    let y = 118 + i * 70 + sin(frameCount * 0.01 + i * 0.8) * 3;
    line(110, y, BASE_W - 110, y);
  }

  stroke(145, 112, 76, 26 * a);
  for (let i = 0; i < 5; i++) {
    let x = 145 + i * 18;
    line(x, 168, x, BASE_H - 146);
  }

  drawPaperVignette(0.24 * a);
}

function drawResultBigText(data, a) {
  let layout = getResultImageLayout(resultImages[data.id]);
  let lines = splitResultTitleLines(data.name);
  let blockX = layout.x + layout.w * 0.001;
  let blockY = BASE_H * 0.02;

  push();
  textAlign(LEFT, TOP);
  noStroke();
  textFont("sans-serif");
  textStyle(BOLD);

  let titleSize = lines.length >= 3 ? 120 : 138;
  let lineGap = titleSize * 1.22;
  for (let i = 0; i < lines.length; i++) {
    let yy = blockY + i * lineGap;

    drawingContext.shadowColor = `rgba(255, 238, 205, ${0.18 * a})`;
    drawingContext.shadowBlur = 20;
    fill(92, 70, 48, (i === 0 ? 34 : 28) * a);
    textSize(titleSize);
    text(lines[i], blockX, yy);
    drawingContext.shadowBlur = 0;
  }

  fill(110, 78, 42, 10 * a);
  textSize(data.big.length > 2 ? 240 : 310);
  text(data.big, layout.x - layout.w * 0.10, BASE_H * 0.50);

  textStyle(NORMAL);
  textSize(17);
  fill(96, 73, 48, 82 * a);
  text(getProvinceTitle(currentProvince).toUpperCase() + "  ·  DIGITAL REBIRTH", layout.x - 4, BASE_H * 0.235);

  pop();
}

function drawResultInfo(data, a) {
  push();

  let province = getProvinceTitle(currentProvince);
  let x = 184;
  let y = 228;
  let maxW = 610;

  textAlign(LEFT, CENTER);
  noStroke();

  textFont("sans-serif");
  textStyle(NORMAL);
  fill(106, 82, 55, 122 * a);
  textSize(22);
  text(province + " / 数字重生", x, y - 72);

  textFont("serif");
  textStyle(BOLD);
  fill(46, 33, 24, 236 * a);
  textSize(56);
  text(data.name, x, y);

  stroke(140, 96, 48, 118 * a);
  strokeWeight(1.6);
  line(x, y + 46, x + 352, y + 46);

  noStroke();
  textFont("sans-serif");
  textStyle(NORMAL);
  fill(120, 92, 58, 116 * a);
  textSize(17);
  text("ARCHIVE NOTE", x, y + 82);

  textFont("serif");
  textStyle(NORMAL);
  fill(74, 55, 38, 205 * a);
  drawWrappedText(data.desc, x, y + 116, maxW, 28, 47, 205 * a);

  let keywordX = x;
let keywordY = BASE_H - 340;
let colorRoadY = BASE_H - 185;

fill(112, 84, 56, 112 * a);
textFont("sans-serif");
textSize(17);
text("关键词", keywordX, keywordY);

textFont("serif");
textSize(24);
fill(68, 49, 34, 178 * a);
text(data.big + " · " + province, keywordX, keywordY + 36);

drawSelectedColorResultDots(keywordX, colorRoadY, a);
  pop();
}

function drawSelectedColorResultDots(x, y, a) {
  let colors = getProvinceColors(currentProvince);
  let selected = selectedColors;

  push();
  textAlign(LEFT, CENTER);
  noStroke();
  textFont("sans-serif");
  textSize(20);
  fill(88, 64, 44, 135 * a);
  text("生成色路", x, y - 42);

  for (let i = 0; i < selected.length; i++) {
    let c = getColorObjectByKey(colors, selected[i]);
    let cx = x + i * 54;

    drawingContext.shadowColor = hexToShadow(c.hex, 0.22 * a);
    drawingContext.shadowBlur = 12;

    noStroke();
    fill(c.hex + hexAlpha(230 * a));
    ellipse(cx, y, 34, 34);

    drawingContext.shadowBlur = 0;

    noFill();
    stroke(255, 246, 220, 150 * a);
    strokeWeight(1.4);
    ellipse(cx, y, 42, 42);
  }

  pop();
}

function drawResultImage(data, img, a) {
  if (!img) return;

  let feather = getFeatheredResultImage(data.id, img);
  let layout = getResultImageLayout(img);
  let floatY = sin(frameCount * 0.018) * 8;
  let floatX = cos(frameCount * 0.014) * 5;

  push();
  translate(layout.x + floatX, layout.y + floatY);

  push();
  noStroke();
  fill(72, 48, 22, 18 * a);
  ellipse(0, layout.h * 0.50 + 28, layout.w * 0.74, 44);
  pop();

  push();
  tint(150, 108, 62, CFG.resultGhostAlpha * a);
  image(feather, 22, 20, layout.w * 1.10, layout.h * 1.10);
  noTint();
  pop();

  push();
  drawingContext.globalCompositeOperation = "screen";
  let halo = drawingContext.createRadialGradient(0, 0, 20, 0, 0, max(layout.w, layout.h) * 0.72);
  halo.addColorStop(0, `rgba(255, 244, 226, ${0.20 * a})`);
  halo.addColorStop(0.45, `rgba(255, 231, 192, ${0.09 * a})`);
  halo.addColorStop(1, "rgba(255, 231, 192, 0)");
  drawingContext.fillStyle = halo;
  drawingContext.fillRect(-layout.w * 0.78, -layout.h * 0.76, layout.w * 1.56, layout.h * 1.52);
  drawingContext.globalCompositeOperation = "source-over";
  pop();

  drawingContext.shadowColor = `rgba(80, 52, 24, ${0.20 * a})`;
  drawingContext.shadowBlur = 34;
  tint(255, CFG.resultImageAlpha * a);
  image(feather, 0, 0, layout.w, layout.h);
  noTint();
  drawingContext.shadowBlur = 0;

  let framePulse = 0.5 + 0.5 * sin(frameCount * 0.016);
  noFill();
  stroke(255, 246, 224, (58 + framePulse * 22) * a);
  strokeWeight(1.15);
  rectMode(CENTER);
  rect(0, 0, layout.w + 24, layout.h + 24, 16);

  pop();
}

function getResultImageLayout(img) {
  let aspect = img.width / img.height;

  let maxW = 920;
  let maxH = 730;
  let x = BASE_W * 0.75;
  let y = BASE_H * 0.54;

  if (aspect > 1.55) {
    maxW = 1080;
    maxH = 600;
    x = BASE_W * 0.7;
    y = BASE_H * 0.5;
  }

  if (aspect < 0.82) {
    maxW = 610;
    maxH = 820;
    x = BASE_W * 0.6;
    y = BASE_H * 0.5;
  }

  if (aspect >= 0.82 && aspect <= 1.2) {
    maxW = 700;
    maxH = 700;
    x = BASE_W * 0.6;
    y = BASE_H * 0.5;
  }

  let s = min(maxW / img.width, maxH / img.height);
  return {
    x: x,
    y: y,
    w: img.width * s,
    h: img.height * s
  };
}

function drawResultBottomHint(a) {
  push();
  noStroke();
  textFont("sans-serif");
  textAlign(CENTER, CENTER);
  textSize(18);
  fill(90, 66, 44, 102 * a);
  text("点击左上角返回，可重新选择色彩", BASE_W / 2, BASE_H - 56);
  pop();
}

function splitResultTitleLines(name) {
  let clean = name.replace(/[\/]/g, " ").replace(/\s+/g, " ").trim();

  if (clean.includes("·")) return clean.split("·");
  if (clean.includes(" / ")) return clean.split(" / ");

  if (clean.length <= 4) return [clean];
  if (clean.length <= 8) return [clean.slice(0, ceil(clean.length / 2)), clean.slice(ceil(clean.length / 2))];
  if (clean.length <= 12) return [clean.slice(0, 4), clean.slice(4, 8), clean.slice(8)];

  return [clean.slice(0, 5), clean.slice(5, 10), clean.slice(10)];
}

// =========================
// 图片边缘渐隐处理
// =========================
function getFeatheredResultImage(id, img) {
  if (resultFeatherCache[id]) return resultFeatherCache[id];

  let pg = createGraphics(img.width, img.height);
  pg.pixelDensity(1);
  pg.clear();
  pg.imageMode(CORNER);
  pg.image(img, 0, 0, img.width, img.height);
  pg.loadPixels();

  removeFakeTransparentBackgroundFromEdges(pg);

  let w = pg.width;
  let h = pg.height;
  let fade = CFG.resultImageFadeEdge;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let edge = min(x, y, w - 1 - x, h - 1 - y);
      let f = constrain(edge / fade, 0, 1);
      f = easeInOutCubic(f);

      let index = (y * w + x) * 4 + 3;
      pg.pixels[index] = pg.pixels[index] * f;
    }
  }

  pg.updatePixels();
  resultFeatherCache[id] = pg;
  return pg;
}

// =========================
// 自动去“假透明背景”
// =========================
function removeFakeTransparentBackgroundFromEdges(pg) {
  let w = pg.width;
  let h = pg.height;
  let total = w * h;
  let visited = new Uint8Array(total);
  let stack = [];

  for (let x = 0; x < w; x++) {
    stack.push(x);
    stack.push((h - 1) * w + x);
  }

  for (let y = 0; y < h; y++) {
    stack.push(y * w);
    stack.push(y * w + (w - 1));
  }

  while (stack.length > 0) {
    let p = stack.pop();
    if (p < 0 || p >= total) continue;
    if (visited[p]) continue;
    visited[p] = 1;

    let idx = p * 4;
    let r = pg.pixels[idx];
    let g = pg.pixels[idx + 1];
    let b = pg.pixels[idx + 2];
    let a = pg.pixels[idx + 3];

    if (!isFakeTransparentBgPixel(r, g, b, a)) continue;

    pg.pixels[idx + 3] = 0;

    let x = p % w;
    let y = floor(p / w);

    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
}

function isFakeTransparentBgPixel(r, g, b, a) {
  if (a < 18) return true;

  let maxC = max(r, g, b);
  let minC = min(r, g, b);
  let saturation = maxC - minC;
  let brightness = (r + g + b) / 3;

  if (brightness > 238 && saturation < 28) return true;
  if (brightness > 188 && saturation < 18) return true;
  if (r > 205 && g > 200 && b > 190 && saturation < 35) return true;

  return false;
}

// =========================
// 左上角返回按钮
// =========================
function drawBackButton() {
  if (page === "home") return;

  let x = 130;
  let y = 90;
  let r = 66;

  let mx = stageMouseX();
  let my = stageMouseY();
  let hover = dist(mx, my, x, y) < r / 2;

  push();
  drawingContext.shadowColor = `rgba(0, 0, 0, ${hover ? 0.28 : 0.16})`;
  drawingContext.shadowBlur = hover ? 18 : 10;

  noStroke();
  fill(34, 27, 20, hover ? 165 : 115);
  ellipse(x, y, r, r);

  stroke(255, 230, 180, hover ? 235 : 185);
  strokeWeight(2.4);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();

  line(x + 8, y - 11, x - 7, y);
  line(x - 7, y, x + 8, y + 11);
  line(x - 6, y, x + 12, y);

  drawingContext.shadowBlur = 0;
  pop();
}

function handleBackButton(mx, my) {
  if (page === "home") return false;

  if (dist(mx, my, 130, 90) < 38) {
    if (page === "result") {
      page = "color";
      return true;
    }

    if (page === "color") {
      page = "door";
      currentProvince = lastDoorProvince || currentProvince;
      doorStartFrame = frameCount;
      doorProgress = 0;
      centerScale = 1;
      return true;
    }

    if (page === "door") {
      page = "journey";
      currentProvince = null;
      return true;
    }

    if (page === "journey") {
      page = "home";
      currentProvince = null;
      return true;
    }
  }

  return false;
}

// =========================
// 路径、粒子、氛围
// =========================
function drawPathGlow(journeyTime) {
  let gx = BASE_W * points[0].x;
  let gy = BASE_H * points[0].y;
  let gz = BASE_W * points[1].x;
  let gyz = BASE_H * points[1].y;
  let cq = BASE_W * points[2].x;
  let cy = BASE_H * points[2].y;

  let p1 = easeInOutCubic(constrain((journeyTime - CFG.pathStart1) / CFG.pathDuration, 0, 1));
  let p2 = easeInOutCubic(constrain((journeyTime - CFG.pathStart2) / CFG.pathDuration, 0, 1));

  drawGlowLine(gx, gy, lerp(gx, gz, p1), lerp(gy, gyz, p1), p1, journeyTime);
  drawGlowLine(gz, gyz, lerp(gz, cq, p2), lerp(gyz, cy, p2), p2, journeyTime + 0.6);
}

function drawGlowLine(x1, y1, x2, y2, progress, phase) {
  if (progress <= 0) return;

  drawingContext.globalCompositeOperation = "lighter";
  strokeCap(ROUND);
  noFill();

  stroke(255, 205, 120, 38 * progress);
  strokeWeight(CFG.pathGlowWeightOuter);
  line(x1, y1, x2, y2);

  stroke(255, 226, 155, 105 * progress);
  strokeWeight(CFG.pathGlowWeightMiddle);
  line(x1, y1, x2, y2);

  stroke(255, 245, 205, 210 * progress);
  strokeWeight(CFG.pathGlowWeightCore);
  line(x1, y1, x2, y2);

  let flow = (sin(frameCount * 0.04 + phase * 2) + 1) * 0.5;
  noStroke();
  fill(255, 238, 190, 85 * progress);
  ellipse(lerp(x1, x2, flow), lerp(y1, y2, flow), 7, 7);

  drawingContext.globalCompositeOperation = "source-over";
}

function drawCursorTrail() {
  let mx = stageMouseX();
  let my = stageMouseY();

  trail.push({ x: mx, y: my });
  if (trail.length > CFG.trailLength) trail.splice(0, 1);

  drawingContext.globalCompositeOperation = "lighter";
  noFill();
  strokeCap(ROUND);

  for (let i = 0; i < trail.length - 1; i++) {
    let alpha = map(i, 0, trail.length - 1, 0, CFG.trailAlphaMax);
    let weight = map(i, 0, trail.length - 1, 0.2, CFG.trailWeightMax);
    stroke(255, 230, 190, alpha);
    strokeWeight(weight);
    line(trail[i].x, trail[i].y, trail[i + 1].x, trail[i + 1].y);
  }

  drawingContext.globalCompositeOperation = "source-over";
}

function drawFloatingChars() {
  let mx = stageMouseX();
  let my = stageMouseY();

  for (let fc of floatingChars) {
    fc.y -= fc.speed;
    fc.x += sin(frameCount * 0.01 + fc.phase) * CFG.floatingDrift;

    let d = dist(mx, my, fc.x, fc.y);
    if (d < CFG.floatingPushRadius) {
      let angle = atan2(fc.y - my, fc.x - mx);
      let strength = map(d, 0, CFG.floatingPushRadius, CFG.floatingPushStrength, 0);
      fc.x += cos(angle) * strength;
      fc.y += sin(angle) * strength;
    }

    if (fc.x < -30) fc.x = BASE_W + 30;
    if (fc.x > BASE_W + 30) fc.x = -30;
    if (fc.y < -30) fc.y = BASE_H + 30;
    if (fc.y > BASE_H + 30) fc.y = -30;

    fill(
      168,
      118,
      52,
      CFG.floatingAlphaBase + sin(frameCount * 0.018 + fc.phase) * CFG.floatingAlphaPulse
    );

    noStroke();
    textAlign(CENTER, CENTER);
    textSize(fc.size);
    text(fc.char, fc.x, fc.y);
  }
}

// =========================
// 手势识别初始化
// =========================
function initHandTracking() {
  if (!CFG.handEnabled) return;

  if (typeof ml5 === "undefined") {
    console.warn("ml5 未加载：只能使用鼠标模式。");
    return;
  }

  try {
    handVideo = createCapture(VIDEO, function () {
      console.log("摄像头已开启");
    });
    handVideo.size(640, 480);
    handVideo.hide();

    if (typeof ml5.handPose === "function") {
      handPoseModel = ml5.handPose({ maxHands: 1, flipped: true }, function () {
        handReady = true;
        console.log("handPose 已就绪");
      });

      if (handPoseModel && typeof handPoseModel.detectStart === "function") {
        handPoseModel.detectStart(handVideo, gotHands);
      } else if (handPoseModel && typeof handPoseModel.on === "function") {
        handPoseModel.on("predict", gotHands);
      }
    } else if (typeof ml5.handpose === "function") {
      handPoseModel = ml5.handpose(handVideo, function () {
        handReady = true;
        console.log("handpose 已就绪");
      });

      if (handPoseModel && typeof handPoseModel.on === "function") {
        handPoseModel.on("predict", gotHands);
      }
    } else {
      console.warn("当前 ml5 版本不支持手势识别");
    }
  } catch (err) {
    console.error("手势初始化失败：", err);
  }
}

function gotHands(results) {
  handPredictions = results || [];
}

function updateHandPointer() {
  if (handClickCooldown > 0) handClickCooldown--;

  if (!CFG.handEnabled || !handReady || !handPredictions || handPredictions.length === 0) {
    handLostFrames++;

    if (handLostFrames > CFG.handLostTolerance) {
      handDetected = false;
      pinchWasDown = false;
      pinchConfirmFrames = 0;
      releaseConfirmFrames = 0;
    }
    return;
  }

  let hand = handPredictions[0];
  let indexTip = getHandPoint(hand, "index");
  let thumbTip = getHandPoint(hand, "thumb");

  if (!indexTip || !thumbTip) {
    handLostFrames++;

    if (handLostFrames > CFG.handLostTolerance) {
      handDetected = false;
      pinchWasDown = false;
      pinchConfirmFrames = 0;
      releaseConfirmFrames = 0;
    }
    return;
  }

  let firstFound = !handDetected;
  handDetected = true;
  handLostFrames = 0;

  let vw = handVideo && handVideo.width ? handVideo.width : 640;
  let vh = handVideo && handVideo.height ? handVideo.height : 480;

  rawHandX = BASE_W - constrain(map(indexTip.x, 0, vw, 0, BASE_W), 0, BASE_W);
  rawHandY = constrain(map(indexTip.y, 0, vh, 0, BASE_H), 0, BASE_H);

  if (firstFound) {
    handX = rawHandX;
    handY = rawHandY;
  } else {
    let dx = rawHandX - handX;
    let dy = rawHandY - handY;
    let moveD = sqrt(dx * dx + dy * dy);

    if (moveD > CFG.handDeadZone) {
      let dynamicSmooth = constrain(
        map(moveD, CFG.handDeadZone, 260, CFG.handSmoothing, 0.28),
        CFG.handSmoothing,
        0.28
      );
      handX = lerp(handX, rawHandX, dynamicSmooth);
      handY = lerp(handY, rawHandY, dynamicSmooth);
    }
  }

  let pinchD = dist(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y);

  if (pinchD < CFG.handPinchThreshold) {
    pinchConfirmFrames++;
    releaseConfirmFrames = 0;
  } else if (pinchD > CFG.handReleaseThreshold) {
    releaseConfirmFrames++;
    pinchConfirmFrames = 0;
  }

  if (
    CFG.controlMode === "hand" &&
    pinchConfirmFrames >= CFG.handPinchConfirmFrames &&
    !pinchWasDown &&
    handClickCooldown <= 0
  ) {
    pinchWasDown = true;
    handClickCooldown = CFG.handClickCooldown;
    handlePointerPressed(handX, handY);
  }

  if (releaseConfirmFrames >= CFG.handReleaseConfirmFrames) {
    pinchWasDown = false;
  }
}

function getHandPoint(hand, type) {
  if (!hand) return null;

  if (hand.landmarks && hand.landmarks.length >= 9) {
    if (type === "thumb") {
      return { x: hand.landmarks[4][0], y: hand.landmarks[4][1] };
    }
    if (type === "index") {
      return { x: hand.landmarks[8][0], y: hand.landmarks[8][1] };
    }
  }

  if (hand.keypoints && hand.keypoints.length > 0) {
    for (let i = 0; i < hand.keypoints.length; i++) {
      let k = hand.keypoints[i];
      let n = k.name || k.part || "";

      if (type === "thumb" && (n === "thumb_tip" || n === "thumbTip")) {
        return { x: k.x, y: k.y };
      }

      if (type === "index" && (n === "index_finger_tip" || n === "indexFingerTip")) {
        return { x: k.x, y: k.y };
      }
    }
  }

  return null;
}

function drawHandCursor() {
  let x = handX;
  let y = handY;
  let s = CFG.handCursorSize;
  let pulse = 1 + sin(frameCount * 0.12) * 0.08;
  let alpha = handDetected ? 1 : 0.35;

  push();

  drawingContext.shadowColor = "rgba(180, 110, 28, " + 0.55 * alpha + ")";
  drawingContext.shadowBlur = pinchWasDown ? 30 : 18;

  noFill();
  stroke(120, 72, 18, 180 * alpha);
  strokeWeight(3.2);
  ellipse(x, y, s * 1.45 * pulse, s * 1.45 * pulse);

  stroke(255, 226, 145, 230 * alpha);
  strokeWeight(2.2);
  ellipse(x, y, s * 0.82, s * 0.82);

  noStroke();
  fill(255, 218, 128, (pinchWasDown ? 230 : 165) * alpha);
  ellipse(x, y, pinchWasDown ? 12 : 8, pinchWasDown ? 12 : 8);

  drawingContext.shadowBlur = 0;

  fill(92, 58, 24, handDetected ? 160 : 120);
  textAlign(LEFT, CENTER);
  textSize(18);
  text(handDetected ? (pinchWasDown ? "捏合中" : "手势模式") : "等待手势", x + 22, y - 22);

  pop();
}

function drawModeBadge() {
  push();
  rectMode(CORNER);
  noStroke();
  fill(255, 248, 230, 185);
  rect(BASE_W - 292, 26, 252, 48, 12);

  fill(70, 48, 30, 220);
  textAlign(CENTER, CENTER);
  textFont("sans-serif");
  textSize(17);

  if (CFG.controlMode === "hand") {
    text("当前：手势｜空格切鼠标", BASE_W - 166, 50);
  } else {
    text("当前：鼠标｜空格切手势", BASE_W - 166, 50);
  }

  pop();
}

function toggleControlMode() {
  if (frameCount - lastToggleFrame < 15) return;
  lastToggleFrame = frameCount;

  if (CFG.controlMode === "hand") {
    CFG.controlMode = "mouse";
    pinchWasDown = false;
    pinchConfirmFrames = 0;
    releaseConfirmFrames = 0;
    handClickCooldown = 0;
    cursor("default");
    console.log("当前模式：鼠标");
  } else {
    CFG.controlMode = "hand";
    pinchWasDown = false;
    pinchConfirmFrames = 0;
    releaseConfirmFrames = 0;
    handClickCooldown = 0;
    cursor("none");
    console.log("当前模式：手势");
  }
}

// =========================
// 交互
// =========================
function mousePressed() {
  if (CFG.controlMode === "hand") return false;
  handlePointerPressed(stageMouseX(), stageMouseY());
}

function keyPressed() {
  if (key === " " || keyCode === 32) {
    toggleControlMode();
    return false;
  }
}

function handlePointerPressed(mx, my) {
  if (handleBackButton(mx, my)) return;

  if (page === "home") {
    previousPage = page;
    page = "journey";
    journeyStartFrame = frameCount;
    mapProgress = 0;
    return;
  }

  if (page === "journey") {
    if (hoverIndex !== -1) {
      let p = points[hoverIndex];

      if (p.id === "guangxi" || p.id === "guizhou" || p.id === "chongqing") {
        previousPage = page;
        currentProvince = p.id;
        lastDoorProvince = p.id;
        page = "door";
        doorStartFrame = frameCount;
        doorProgress = 0;
        centerScale = 1;
      }
      return;
    }
  }

  if (page === "door") {
    let centerX = BASE_W * CFG.centerXRatio;
    let centerY = BASE_H * CFG.centerYRatio;
    let centerSize = BASE_H * CFG.centerSizeRatio;

    if (dist(mx, my, centerX, centerY) < centerSize * CFG.centerHitScale) {
      previousPage = page;
      lastDoorProvince = currentProvince;
      resetColorSelection();
      colorPageStartFrame = frameCount;
      page = "color";
    }
    return;
  }

  if (page === "color") {
    handleColorPageClick(mx, my);
    return;
  }
}

function handleColorPageClick(mx, my) {
  let colors = getProvinceColors(currentProvince);
  let centerX = BASE_W * 0.5;
  let centerY = BASE_H * 0.55;
  let positions = getColorPositions(colors.length, centerX, centerY);
  let matched = getCurrentMatchedPattern();

  if (matched && dist(mx, my, centerX, centerY) < BASE_H * 0.18) {
    selectedPattern = matched;
    previousPage = page;
    resultPageStartFrame = frameCount;
    page = "result";
    return;
  }

  for (let i = 0; i < colors.length; i++) {
    let p = positions[i];

    if (dist(mx, my, p.x, p.y) < CFG.colorBallSize * 0.6) {
      toggleColor(colors[i].key);
      return;
    }
  }

  if (pointInRect(mx, my, BASE_W / 2, BASE_H - 158, CFG.colorClearW, CFG.colorClearH)) {
    resetColorSelection();
  }
}

// =========================
// 工具函数
// =========================
function getNodeSize() {
  return BASE_H * 0.15;
}

function drawVignette(strength) {
  let grad = drawingContext.createRadialGradient(
    BASE_W / 2,
    BASE_H / 2,
    BASE_W * 0.24,
    BASE_W / 2,
    BASE_H / 2,
    BASE_W * 0.82
  );

  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);

  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);
}

function drawPaperVignette(strength) {
  let grad = drawingContext.createRadialGradient(
    BASE_W / 2,
    BASE_H / 2,
    BASE_W * 0.22,
    BASE_W / 2,
    BASE_H / 2,
    BASE_W * 0.82
  );

  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(1, `rgba(80,48,18,${strength})`);

  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);
}

function drawSoftAtmosphere() {
  let g = drawingContext.createLinearGradient(0, 0, BASE_W, BASE_H);
  let pulse = 0.5 + sin(frameCount * 0.012) * 0.5;

  g.addColorStop(0, "rgba(35, 24, 15, 0.025)");
  g.addColorStop(0.5, `rgba(255, 210, 140, ${0.018 * pulse})`);
  g.addColorStop(1, "rgba(10, 8, 7, 0.04)");

  drawingContext.fillStyle = g;
  drawingContext.fillRect(0, 0, BASE_W, BASE_H);
}

function drawWrappedText(str, x, y, maxW, size, lineH, alpha) {
  push();
  textAlign(LEFT, TOP);
  textSize(size);
  fill(74, 55, 38, alpha);
  noStroke();

  let line = "";
  let yy = y;

  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    let test = line + ch;

    if (textWidth(test) > maxW && line.length > 0) {
      text(line, x, yy);
      yy += lineH;
      line = ch;
    } else {
      line = test;
    }
  }

  if (line.length > 0) text(line, x, yy);
  pop();

  return yy;
}

function getColorObjectByKey(colors, key) {
  for (let c of colors) {
    if (c.key === key) return c;
  }
  return colors[0];
}

function pointInRect(px, py, cx, cy, w, h) {
  return px > cx - w / 2 && px < cx + w / 2 && py > cy - h / 2 && py < cy + h / 2;
}

function hexAlpha(a) {
  let v = constrain(floor(a), 0, 255).toString(16);
  if (v.length < 2) v = "0" + v;
  return v;
}

function hexToShadow(hex, alpha) {
  let c = color(hex);
  return `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${alpha})`;
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}