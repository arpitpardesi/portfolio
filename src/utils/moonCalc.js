/**
 * Precise Moon Phase Calculation
 * Uses Julian Date calculation for better accuracy.
 */

// Synodic month (new moon to new moon)
const LUNAR_CYCLE = 29.53058867;

const getJulianDate = (date) => {
    const time = date.getTime();
    return (time / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
};

export const getMoonPhase = (date = new Date()) => {
    const jd = getJulianDate(date);

    // Known New Moon: Jan 6, 2000 at 18:14 UTC (JD 2451550.1)
    // Actually, let's use a standard formula.

    const daysSinceEpoch = jd - 2451550.1;
    const cycles = daysSinceEpoch / LUNAR_CYCLE;
    const currentPhase = cycles - Math.floor(cycles); // 0 to 1

    // 0 = New
    // 0.25 = First Quarter
    // 0.5 = Full
    // 0.75 = Last Quarter

    let stage;
    const p = currentPhase;

    if (p < 0.02 || p > 0.98) stage = "New Moon";
    else if (p < 0.24) stage = "Waxing Crescent";
    else if (p < 0.26) stage = "First Quarter";
    else if (p < 0.49) stage = "Waxing Gibbous";
    else if (p < 0.51) stage = "Full Moon";
    else if (p < 0.74) stage = "Waning Gibbous";
    else if (p < 0.76) stage = "Last Quarter";
    else stage = "Waning Crescent";

    // Calculate illumination (0 to 1)
    // 0 (New) -> 1 (Full) -> 0 (New)
    // Illumination is roughly sin^2 of phase angle? 
    // Simplified: Linear distance from 0.5 roughly?
    // Accurate: 0.5 * (1 - Math.cos(phaseAngleRadians))

    const phaseAngle = currentPhase * 2 * Math.PI;
    const illumination = 0.5 * (1 - Math.cos(phaseAngle)); // 0..1

    return {
        phase: currentPhase,
        stage,
        illumination
    };
};
