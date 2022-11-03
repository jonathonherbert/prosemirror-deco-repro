A reproduction of an issue where decorations passed to nested EditorViews throw an error. A DecorationGroup is being nested inside another DecorationGroup's members, which should be of type `DecorationSet[]`.

## Reproducing

Run `yarn` to install dependencies, and `yarn dev` to run.

The project will crash with 

```
index.js:3956 Uncaught TypeError: this.members[i].localsInner is not a function
    at DecorationGroup.locals (index.js:3956:42)
    at iterDeco (index.js:1890:23)
    at NodeViewDesc.updateChildren (index.js:1253:9)
    at new NodeViewDesc (index.js:1158:18)
    at docViewDesc (index.js:1385:12)
    at new EditorView (index.js:4926:24)
    at index.js:91:17
    at Fragment.forEach (index.js:255:13)
    at example (index.js:89:28)
    at NodeViewDesc.create (index.js:1171:30)
```

This state seems to be caused by the combination of decorations fed to the nested editor from its parent, and decorations created by the nested editor's plugins (in this case, a placeholder decoration.)

Adding content to the nested-example node in index.html removes the placeholder and the error is no longer thrown.
