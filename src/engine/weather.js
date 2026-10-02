/* Weather: clear, rain, storm, fog and snow.
 *
 * Rain and snow fall in front of the cut and behind the subject, never inside the
 * cut-open rooms. A storm darkens the sky and adds lightning and thunder. Fog thickens
 * the distance haze. The stage calls update() every frame.
 */
import { XS, h01 } from './core.js';
import { U } from './materials.js';

export const WEATHERS = ['clear', 'rain', 'storm', 'fog', 'snow'];
const WEATHER_SHARE = 0.65;

export class Weather {
  constructor() {
    this.kind = 'clear';
    this.mix = { rain: 0, snow: 0, fog: 0, storm: 0 };
    this.flash = 0;
    this.nextFlash = 6;
    this.seed = 1;
  }
  set(kind) { this.kind = WEATHERS.includes(kind) ? kind : 'clear'; }

  update(dt, stage) {
    const W = stage.world, scene = stage.scene;
    const target = { rain: 0, snow: 0, fog: 0, storm: 0 };
    if (this.kind === 'rain') target.rain = 0.7;
    if (this.kind === 'storm') { target.rain = 1; target.storm = 1; }
    if (this.kind === 'fog') target.fog = 1;
    if (this.kind === 'snow') target.snow = 1;
    const k = 1 - Math.exp(-dt * 0.8);
    for (const key in target) this.mix[key] += (target[key] - this.mix[key]) * k;
    const m = this.mix;
    // Precipitation around the view, in front of the cut (z < 0) and behind the subject.
    const cam = stage.camera, T = cam.target;
    const span = Math.min(160, cam.dist * 0.9 + 8);
    const b = scene.bounds;
    const behind = (b.z1 || 20) + 2;
    const rate = (m.rain * 220 + m.snow * 90) * Math.min(3, span / 30);
    this.acc = (this.acc || 0) + rate * dt;
    // Weather shares the world's particle pool but never takes more than WEATHER_SHARE of it,
    // so a scene's own smoke, steam and spray keep flowing in a storm.
    const P = W.particles, cap = P.max * WEATHER_SHARE;
    while (this.acc > 1) {
      this.acc -= 1;
      if (P.list.length >= cap) { this.acc = 0; break; }
      const r = (s) => h01(this.seed++, s);
      const front = r(1) < 0.55;
      const z = front ? -(1 + r(2) * Math.min(30, cam.dist * 0.5)) : behind + r(2) * 40;
      const x = T.x + (r(3) - 0.5) * span * 1.6;
      const y = T.y + span * 0.6 + r(4) * 6;
      if (m.snow > m.rain) W.particles.emit({ kind: 'snow', x, y, z, vy: -1.1, vx: (W.wind || 0) * 0.4, life: 14, size: [0.05, 0.05] }, null);
      else W.particles.emit({ kind: 'rain', x, y, z, vy: -11, vx: (W.wind || 0) * 0.6, life: span * 0.12 + 1.5, size: [0.03, 0.03] }, null);
    }
    // Fog and storm darken and thicken the air.
    const base = scene.fog || [1e6, 2e6, 0];
    const fogNear = base[0] * (1 - m.fog * 0.9) * (1 - m.storm * 0.4) + 1;
    const fogFar = base[1] * (1 - m.fog * 0.85) * (1 - m.storm * 0.3) + 20;
    U.uFog.value.set(Math.min(fogNear, 30 + (1 - m.fog) * 1e6), Math.min(fogFar, 220 + (1 - m.fog) * 2e6), Math.max(base[2] || 0, m.fog * 0.85, m.storm * 0.5, m.rain * 0.3));
    // Lightning.
    this.flash = Math.max(0, this.flash - dt * 4);
    if (m.storm > 0.6) {
      this.nextFlash -= dt;
      if (this.nextFlash <= 0) {
        this.flash = 1;
        this.nextFlash = 5 + h01(this.seed++, 9) * 12;
        if (stage.audio && stage.audio.on) stage.audio.thunder(0.8 + h01(this.seed++, 3) * 1.6);
      }
    }
    const dim = 1 - m.storm * 0.55 - m.rain * 0.15 - m.fog * 0.1;
    U.uSunCol.value.multiplyScalar(dim);
    U.uSkyCol.value.multiplyScalar(1 - m.storm * 0.4 - m.rain * 0.08);
    U.uGroundCol.value.multiplyScalar(1 - m.storm * 0.4);
    if (this.flash > 0) {
      U.uSkyCol.value.addScalar(this.flash * 0.9);
      U.uSunCol.value.addScalar(this.flash * 0.6);
    }
    const su = stage.sky.uniforms;
    su.uCloudCover.value = Math.min(1, su.uCloudCover.value + m.rain * 0.35 + m.storm * 0.4 + m.snow * 0.3);
    // Grey and darken the sky with the weather.
    const grey = Math.min(1, m.rain * 0.45 + m.storm * 0.5 + m.fog * 0.6 + m.snow * 0.4);
    for (const key of ['uTop', 'uBot', 'uCloud', 'uCloudDark']) {
      const c = su[key].value, l = (c.r + c.g + c.b) / 3;
      c.lerp({ r: l, g: l, b: l * 1.04 }, grey).multiplyScalar(1 - m.storm * 0.55 - m.rain * 0.15);
    }
    if (stage.seaMesh) stage.seaMesh.userData.sea.uniforms.uAmp.value = (stage.seaMesh.userData.sea.amp0 || 1) * (1 + m.storm * 1.6 + m.rain * 0.4);
    if (this.flash > 0.3) stage.sky.uniforms.uTop.value.addScalar(this.flash * 0.25);
    if (stage.audio && stage.audio.on) stage.audio.weather(m);
  }
}

XS.Weather = Weather;
