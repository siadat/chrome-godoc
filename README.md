# Godoc finder for Chrome omnibox

![Using chrome-godoc](http://g.recordit.co/GajNOXsMnO.gif)

## Usage

In the addressbar (omnibox) type:

    go PACKAGE [FUNC|TYPE]
    go PACKAGE#[FUNC|TYPE]
    go #[FUNC|TYPE]
    go !

## Example

    go http
    go httpu newconn
    go httpu#newconn
    go #newconn
    go !

The extension first tries to fetch the docs from http://localhost:6060. If that fails, it will try https://tip.golang.org.

## Pro tips

**clear the cache** enter `go !` and press Enter.

**select the first match** press Enter without pressing down.

**avoid retyping the name of the last package** start query with `#` e.g. `go #new`

## Contributing

- [Send a feature request](https://github.com/siadat/chrome-godoc/issues/new)
- [Report a problem](https://github.com/siadat/chrome-godoc/issues/new)

## License

This extension is released under the [MIT License](http://www.opensource.org/licenses/MIT).
