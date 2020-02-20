import * as ace from "brace";
import "brace/mode/yaml";
import "brace/theme/github";
import YAML from "yamljs";
import Viz from "viz.js";
import { Module, render } from "viz.js/full.render.js";

import { dummyData } from "./dummyData";
import { AllElements } from "./AllElements";

const editor = ace.edit("editor");
editor.getSession().setMode("ace/mode/yaml");
editor.setTheme("ace/theme/github");
editor.setValue(dummyData);

document.getElementById("render").onclick = () => {
  const parsedYAML = YAML.parse(editor.getValue());

  const allElements = new AllElements(parsedYAML);

  /*
   * Append all elements to the window object
   */
  window.allElements = allElements;

  const output = allElements.filteredGraph(
    parsedYAML.filter || {},
    parsedYAML.directives || []
  );

  new Viz({ Module, render }).renderSVGElement(output).then(element => {
    const graphElement = document.getElementById("graph");
    graphElement.innerHTML = "";
    graphElement.appendChild(element);
  });
};

document.getElementById("toggle-editor").onclick = () => {
  const e = document.getElementById("editor-column");
  const c = document.getElementById("graph-column");
  e.classList.toggle("is-hidden");
  e.classList.toggle("is-half");
  c.classList.toggle("is-full");
  c.classList.toggle("is-half");
};
