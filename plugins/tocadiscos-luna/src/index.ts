import { type LunaUnload, Tracer } from "@luna/core";
import { StyleTag } from "@luna/lib";

import styles from "file://styles.css?minify";

export const { trace } = Tracer("[Tocadiscos]");

// Recursos a limpiar al descargar el plugin
export const unloads = new Set<LunaUnload>();

new StyleTag("Tocadiscos", unloads, styles);

// ---- Ajustes ----
const VUELTA = 1.8; // segundos por vuelta (33 rpm); 1.333 = 45 rpm
const TAU_ARRANQUE = 0.6; // menos = arranca más rápido
const TAU_FRENADO = 1.6; // más = frena más lento
const BRAZO_INI = 6; // grados: surco exterior
const BRAZO_FIN = 28; // grados: surco interior

const SEL_PAUSA = 'button[data-test="pause"]';
const SEL_DISCO = 'img[data-test="now-playing-artwork"]';

function progreso(): number | null {
	const fila = document.querySelector('[class*="_scrubberRow_"]');
	const t = fila ? (fila.textContent ?? "").match(/\d+:\d{2}/g) ?? [] : [];
	if (t.length < 2) return null;
	const seg = (x: string) => {
		const p = x.split(":");
		return Number(p[0]) * 60 + Number(p[1]);
	};
	const total = seg(t[t.length - 1]);
	return total > 0 ? Math.min(1, seg(t[0]) / total) : null;
}

let activo = true;
let raf = 0;
let vel = 0;
let ang = 0;
let last = performance.now();
let ultimoBrazo = 0;

function frame(now: number) {
	if (!activo) return;
	const dt = Math.min((now - last) / 1000, 0.1);
	last = now;

	const suena = !!document.querySelector(SEL_PAUSA);
	const tau = suena ? TAU_ARRANQUE : TAU_FRENADO;
	vel += ((suena ? 1 : 0) - vel) * (1 - Math.exp(-dt / tau));
	if (!suena && vel < 0.004) vel = 0;
	ang = (ang + (vel * dt * 360) / VUELTA) % 360;

	const img = document.querySelector<HTMLImageElement>(SEL_DISCO);
	if (img) {
		const r = (ang * Math.PI) / 180;
		const w = 0.35 * vel; // oscilación leve del plato
		img.style.transform = `translate(${(Math.sin(r) * w).toFixed(2)}px, ${(Math.cos(r) * w).toFixed(2)}px) rotate(${ang.toFixed(2)}deg) scale(.82)`;
	}

	if (suena && now - ultimoBrazo > 500) {
		ultimoBrazo = now;
		const p = progreso();
		if (p !== null) document.documentElement.style.setProperty("--tt-arm", `${(BRAZO_INI + (BRAZO_FIN - BRAZO_INI) * p).toFixed(1)}deg`);
	}

	raf = requestAnimationFrame(frame);
}
raf = requestAnimationFrame(frame);

unloads.add(() => {
	activo = false;
	cancelAnimationFrame(raf);
	document.querySelector<HTMLImageElement>(SEL_DISCO)?.style.removeProperty("transform");
	document.documentElement.style.removeProperty("--tt-arm");
});
