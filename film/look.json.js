// look.json.js: the film's grade and lens defaults. The ?grade panel's "Copy JSON" gives an object of exactly this shape:
// paste it over the object below (keep "export default"). The panel opens on these values and Reset returns to them.
// Client grade, 12 Nov 2026.
export default {
  "grade": { "exposure": -0.7, "contrast": 1.08, "saturation": 0.96, "warmth": 0.12, "tint": 0.01, "lift": 0.005, "gamma": 0.98, "gain": 1.11 },
  "lens": { "bloomStrength": 0.89, "bloomThreshold": 1.26, "vignette": 0.61, "grain": 0.084 },
  "beats": {
    "austin": { "exposure": 0.11, "warmth": 0.62 },
    "space": { "exposure": 1.1, "warmth": -0.53 },
    "marsOrbit": { "exposure": 0.76, "warmth": 0.09 },
    "colony": { "exposure": 0.45, "warmth": 0.69 }
  }
};
