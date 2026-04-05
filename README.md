# CY_BORG PUNKMAKER - Vue Version

A character generator for the CY_BORG universe, originally created by Karl Druid.

The app now uses Vue two-way data binding with a reactive `character` object as the source of truth.

## Character and gear model

- `character` is fully reactive (name, class, HP, stats, debt).
- `character.gear` is organized into explicit buckets:
  - `weapon`, `armor`, `mags`, `credits`
  - `cybertech`, `nanoPowers`, `nanoInfestations`, `apps`, `boosters`, `misc`
  - `all` (derived from the bucket lists)
- Editing item name, description, tags, mags, and credits updates the underlying object directly.

## Run locally

Serve the folder with any static file server and open `index.html` in your browser.



## Credits

- **CY_BORG** ©2022 Stockholm Kartell
- [Original web app by Karl Druid](https://cy-borg.makedatanotlore.dev/punk)  
- **Static version** created by having AI reinterpret the data 

## License

This is an unofficial fan recreation. CY_BORG is ©2022 Stockholm Kartell. Original web app by Karl Druid.
