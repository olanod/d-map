# d-map

Mapbox GL map as a custom element. This simple wrapper allows creating maps with markers(more later) in a declarative way.

```html
<meta name="mapbox-token" content="...">
<!-- import -->
<script type="module" src="map.js"></script>
<!-- use -->
<d-map c="13.4 52.5" z="6">
  <d-marker c="13.4 52.5"></d-marker>
</d-map>
```
