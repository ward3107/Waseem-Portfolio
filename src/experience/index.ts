// Light barrel — exports only the capability gate and its type. It deliberately
// does NOT re-export <Experience>, so importing the mode hook can't accidentally
// pull the WebGL bundle (fiber/drei/three/lenis) into the main chunk. Consumers
// lazy-import './Experience' directly when mode === '3d'.
export { useExperienceMode } from './useExperienceMode';
export type { ExperienceMode } from './useExperienceMode';
