import '@testing-library/jest-dom';

const createMediaQueryList = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
});

window.matchMedia = window.matchMedia || function (query) {
    return createMediaQueryList(query);
};

if (typeof HTMLCanvasElement !== 'undefined') {
    HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(() => ({
        clearRect: jest.fn(),
        fillRect: jest.fn(),
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        globalAlpha: 1,
    }));
}

if (typeof HTMLAudioElement !== 'undefined') {
    HTMLAudioElement.prototype.play = jest.fn().mockResolvedValue(undefined);
    HTMLAudioElement.prototype.pause = jest.fn();
}

// Safely patch CSSStyleDeclaration.prototype.border for JSDOM shorthand border parser
try {
    const originalBorderDesc = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'border');
    if (originalBorderDesc && originalBorderDesc.set) {
        Object.defineProperty(CSSStyleDeclaration.prototype, 'border', {
            get: originalBorderDesc.get,
            set: function (val) {
                try {
                    originalBorderDesc.set.call(this, val);
                } catch (e) {
                    // Safe fallback for JSDOM cssstyle shorthand parser quirk
                }
            },
            configurable: true,
        });
    }
} catch (e) {
    // Ignore if property redefinition fails
}
