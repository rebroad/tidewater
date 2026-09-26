import { App } from '../src/App.js';

globalThis.location = { search: '' };
const linux = new App();
if ( ! linux.desktopAdaptiveScale || linux.settings.renderScale !== 0.75 ) throw new Error( 'Linux desktop should start with adaptive scaling' );

Object.defineProperty( globalThis, 'navigator', { configurable: true, value: { platform: 'Linux arm64', userAgent: 'Mozilla/5.0 Android 16' } } );
const android = new App();
if ( android.desktopAdaptiveScale || android.autoScale || android.settings.renderScale !== 1 ) throw new Error( 'Android should keep the original full-quality path' );

globalThis.location.search = '?scale=0.5';
const manual = new App();
if ( manual.autoScale ) throw new Error( '?scale must disable automatic render-scale changes' );

const changes = [];
const app = {
	autoScale: true,
	settings: { renderScale: 0.75 },
	_scaleBelowTarget: 0,
	_scaleAboveTarget: 0,
	setRenderScale( scale ) { changes.push( scale ); this.settings.renderScale = scale; },
};

App.prototype.adaptRenderScale.call( app, 23 );
if ( changes.length !== 0 ) throw new Error( 'scale changed before a sustained low-FPS sample' );
App.prototype.adaptRenderScale.call( app, 23 );
if ( changes.at( - 1 ) !== 0.7 ) throw new Error( 'scale did not step down below 24 fps' );

for ( let i = 0; i < 16; i ++ ) App.prototype.adaptRenderScale.call( app, 38 );
if ( changes.at( - 1 ) !== 0.75 ) throw new Error( 'scale did not recover slowly above 36 fps' );

app.autoScale = false;
for ( let i = 0; i < 20; i ++ ) App.prototype.adaptRenderScale.call( app, 10 );
if ( changes.length !== 2 ) throw new Error( 'manual scale should disable automatic changes' );

app.autoScale = true;
app.settings.renderScale = 0.5;
app._scaleBelowTarget = 0;
changes.length = 0;
for ( let i = 0; i < 20; i ++ ) App.prototype.adaptRenderScale.call( app, 10 );
if ( changes.length !== 0 ) throw new Error( 'automatic scaling must stop at 50% resolution' );

console.log( 'ok   Linux adaptive render scale hysteresis and manual override' );
