# Godoc finder for Chrome omnibox

![Using chrome-godoc](http://g.recordit.co/GajNOXsMnO.gif)

Opens godoc for a package, function, or type. Without extension you type:

    localhost:6060/pkg/text/template/#Template.Execute

With extension it is enough to type:

    go tetem tex

## Usage

    go PACKAGE [FUNC|TYPE]

## Example

In the omnibox type:

    go http

or

    go httpu dump

The extension first tries to fetch the docs from http://localhost:6060. If that fails, it will try https://tip.golang.org.

**Note:** To select the first match, press Enter without pressing down.

## Contributing

- Fork and submit a pull request
- [Send a feature request](https://github.com/siadat/chrome-godoc/issues/new)
- [Report a problem](https://github.com/siadat/chrome-godoc/issues/new)

## License

This extension is released under the [MIT License](http://www.opensource.org/licenses/MIT).
