const Parser = require("tree-sitter");
const Elm = require("tree-sitter-elm");

const parser = new Parser();
parser.setLanguage(Elm);

function parse(source) {
  const tree = parser.parse(source);
  return tree.rootNode
    .descendantsOfType(["type_alias_declaration", "value_declaration"])
    .map((c) => c.children);
}

module.exports = parse;
