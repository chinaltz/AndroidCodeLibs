const MIN_MINUTES = 5;
const MAX_MINUTES = 90;
const STEP = 5;
const STEP_COUNT = (MAX_MINUTES - MIN_MINUTES) / STEP + 1;
const DEG_PER_STEP = 360 / STEP_COUNT;

function clampMinutes(minutes) {
  const stepped = Math.round(minutes / STEP) * STEP;
  return Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, stepped));
}

function minutesToRotate(minutes) {
  const safe = clampMinutes(minutes);
  const index = (safe - MIN_MINUTES) / STEP;
  return index * DEG_PER_STEP;
}

function rotateToMinutes(rotate) {
  const normalized = ((rotate % 360) + 360) % 360;
  let index = Math.round(normalized / DEG_PER_STEP);
  if (index >= STEP_COUNT) index = STEP_COUNT - 1;
  if (index < 0) index = 0;
  return MIN_MINUTES + index * STEP;
}

function dragDeltaToMinutes(startMinutes, deltaDeg) {
  const stepDelta = Math.round(deltaDeg / DEG_PER_STEP);
  return clampMinutes(startMinutes + stepDelta * STEP);
}

function touchAngle(pageX, pageY, centerX, centerY) {
  const rad = Math.atan2(pageY - centerY, pageX - centerX);
  return (rad * 180) / Math.PI + 90;
}

function normalizeDelta(delta) {
  let d = delta;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function buildTickLabels() {
  const labels = [];
  for (let i = 0; i < STEP_COUNT; i += 1) {
    const minutes = MIN_MINUTES + i * STEP;
    const angle = i * DEG_PER_STEP;
    labels.push({
      minutes,
      angle,
      style: `transform: rotate(${angle}deg) translateY(-228rpx);`,
      major: minutes % 15 === 0,
    });
  }
  return labels;
}

module.exports = {
  MIN_MINUTES,
  MAX_MINUTES,
  STEP,
  DEG_PER_STEP,
  clampMinutes,
  minutesToRotate,
  rotateToMinutes,
  touchAngle,
  normalizeDelta,
  buildTickLabels,
  dragDeltaToMinutes,
};
