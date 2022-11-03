import { EditorState, Plugin } from "prosemirror-state";
import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { exampleSetup } from "prosemirror-example-setup";
import { Mapping, StepMap } from "prosemirror-transform";
import {
  createInvisiblesPlugin,
  space,
  paragraph,
} from "@guardian/prosemirror-invisibles";

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: schema.spec.nodes.append({
    example: {
      content: "nestedExample*",
      group: "block",
      toDOM() {
        return ["example", 0];
      },
      parseDOM: [{ tag: "example" }],
    },
    nestedExample: {
      content: "text*",
      group: "block",
      toDOM() {
        return ["nestedExample", 0];
      },
      parseDOM: [{ tag: "nested-example" }],
    },
  }),
  marks: schema.spec.marks,
});


export const createPlaceholderPlugin = (text) =>
  new Plugin({
    props: {
      decorations: (state) => {
        const getPlaceholder = () => {
          const dom = document.createElement('span');
          dom.innerHTML = "Enter text";
          return dom;
        }

        if (state.doc.textContent) {
          return DecorationSet.empty;
        }

        // If the document contains inline content only, just place the widget at its start.
        const pos = state.doc.inlineContent
          ? 0
          : getFirstPlaceholderPosition(state.doc);
        return DecorationSet.create(state.doc, [
          Decoration.widget(pos, getPlaceholder),
        ]);
      },
    },
  })


window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector("#content")
    ),
    plugins: [
      createInvisiblesPlugin([space, paragraph]),
      ...exampleSetup({ schema: mySchema }),
      new Plugin({
        props: {
          decorations(state) {
            return DecorationSet.create(state.doc, [
              Decoration.inline(0, state.doc.nodeSize - 2, {
                class: "TestDecoration__inline",
              })
            ]);
          },
        },
      }),
      new Plugin({
        props: {
          nodeViews: {
            example: (node, view, getPos, decorations, innerDecos) => {
              const dom = document.createElement("div");

              node.content.forEach((innerNode, fieldOffset) => {
                const innerViewDom = document.createElement("nestedelement");
                new EditorView(innerViewDom, {
                  state: EditorState.create({
                    doc: innerNode,
                    plugins: [createPlaceholderPlugin("placeholder")]
                  }),
                  decorations: () => {
                    const localOffset = -1;
                    const offsetMap = new Mapping([
                      StepMap.offset(-fieldOffset + localOffset),
                    ]);
                    const mappedDecos = innerDecos.map(offsetMap, node);
                    return mappedDecos;
                  },
                });
              });

              return { dom };
            },
          },
        },
      }),
    ],
  }),
});

