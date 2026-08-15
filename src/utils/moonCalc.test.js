import { getMoonPhase } from './moonCalc';

describe('moonCalc utility', () => {
    it('returns valid moon phase data structure', () => {
        const result = getMoonPhase();
        expect(result).toHaveProperty('phase');
        expect(result).toHaveProperty('stage');
        expect(result).toHaveProperty('illumination');

        expect(typeof result.phase).toBe('number');
        expect(result.phase).toBeGreaterThanOrEqual(0);
        expect(result.phase).toBeLessThanOrEqual(1);

        expect(typeof result.stage).toBe('string');
        expect(result.stage.length).toBeGreaterThan(0);

        expect(typeof result.illumination).toBe('number');
        expect(result.illumination).toBeGreaterThanOrEqual(0);
        expect(result.illumination).toBeLessThanOrEqual(1);
    });

    it('correctly identifies moon phases for known dates', () => {
        // Known New Moon approx Jan 11, 2024
        const newMoonDate = new Date('2024-01-11T11:57:00Z');
        const newMoonResult = getMoonPhase(newMoonDate);
        expect(newMoonResult.illumination).toBeLessThan(0.15);

        // Known Full Moon approx Jan 25, 2024
        const fullMoonDate = new Date('2024-01-25T17:54:00Z');
        const fullMoonResult = getMoonPhase(fullMoonDate);
        expect(fullMoonResult.illumination).toBeGreaterThan(0.85);
    });
});
