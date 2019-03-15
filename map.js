/* Copyright © 2018  Daniel Olano | @license GPLv3 */
const mbxVer = 'v0.53.1'
const mbxJS = `https://api.tiles.mapbox.com/mapbox-gl-js/${mbxVer}/mapbox-gl.js`
const mbxCSS = `https://api.tiles.mapbox.com/mapbox-gl-js/${mbxVer}/mapbox-gl.css`
const mbxStyle = 'mapbox://styles/mapbox/streets-v9'
const mbxToken = document.head.querySelector('meta[name=mapbox-token]').content
const $new = (tag, props) => Object.assign(document.createElement(tag), props)

;(async () => {
	await loadMapbox(mbxJS, mbxToken)
	customElements.define(Map.tag, Map)
	customElements.define(Marker.tag, Marker)
})()

export const mapbox = Symbol('mapbox')

/**
 * Map
 */
export class Map extends HTMLElement {
	static get tag() { return 'd-map' }

	constructor() {
		super()
		this._center = parseCoords(this.getAttribute('c'))
		this._zoom = +this.getAttribute('z') || 0

		this.attachShadow({ mode: 'open' })
		const css = $new('style')
		css.append(document.createTextNode(`:host {display: block}
#map {height: 100%; width: 100%;}`))
		const mcss = $new('link', { rel: 'stylesheet', href: mbxCSS })
		this.shadowRoot.append(mcss, css, $new('div', { id: 'map' }))
	}

	connectedCallback() {
		this[mapbox] = new mapboxgl.Map({
			container: this.shadowRoot.lastElementChild,
			style: mbxStyle,
			center: this._center,
			zoom: this._zoom,
		})
	}

	set(prop, val) { setProp(this, prop, val) }

	get zoom() { return this._zoom }
	set zoom(val) { this.set('zoom', val) }

	get center() { return this._center }
	set center(val) { this.set('center', val) }
}

/**
 * Marker
 */
export class Marker extends HTMLElement {
	static get tag() { return 'd-marker' }

	constructor() {
		super()
		this._lngLat = parseCoords(this.getAttribute('c'))
	}

	async connectedCallback() {
		this[mapbox] = new mapboxgl.Marker()
		this.lngLat = this._lngLat
		const map = this.closest(Map.tag)
		if (map) this[mapbox].addTo(map[mapbox])
	}

	get lngLat() { return this._lngLat }
	set lngLat([lng, lat]) { setProp(this, 'lngLat', [+lng || 0, +lat || 0]) }
}

function setProp(self, prop, val) {
	self[`_${prop}`] = val
	if (self[mapbox]) {
		prop = prop.charAt(0).toUpperCase() + prop.slice(1)
		self[mapbox][`set${prop}`](val)
	}
}

function parseCoords(str) {
	const c = `${str}`.split(' ').filter(c => !!c).map(c => +c)
	return c.length == 2 ? c : [0, 0]
}

async function loadMapbox(jsURL, token) {
	await new Promise((res, rej) => {
		const script = $new('script')
		script.onload = res
		script.src = jsURL
		document.head.append(script)
	})
	mapboxgl.accessToken = token
}
