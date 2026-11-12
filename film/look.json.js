// look.json.js: the film's grade and lens defaults. The ?grade panel's "Copy JSON" gives an object of exactly this shape:
// paste it over the object below (keep "export default"). Every value here at its default renders the film as shipped.
export default {
  "grade": { "exposure": 0, "contrast": 1, "saturation": 1, "warmth": 0, "tint": 0, "lift": 0, "gamma": 1, "gain": 1 },
  "lens": { "bloomStrength": 0.5, "bloomThreshold": 1, "vignette": 0.3, "grain": 0.04 },
  "beats": {
    "austin": { "exposure": 0, "warmth": 0 },
    "space": { "exposure": 0, "warmth": 0 },
    "marsOrbit": { "exposure": 0, "warmth": 0 },
    "colony": { "exposure": 0, "warmth": 0 }
  }
};
