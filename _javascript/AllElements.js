/**
 * Create elements inferred at the yaml mapping
 */
export class AllElements {
  constructor(params) {
    this.units = params.units;
    this.defaultFilters = params.defaultFilters;
  }
  availableFilters() {
    const filters = {};
    this.availableDirectives().forEach(directive => {
      const filtersForDirective = {};
      this.units.forEach(
        unit => (filtersForDirective[unit.metadata[directive]] = true)
      );
      filters[directive] = Object.keys(filtersForDirective);
    });
    return filters;
  }
  availableDirectives() {
    const allDirectives = {};
    this.units.forEach(unit =>
      Object.keys(unit.metadata).forEach((k) => (allDirectives[k] = true))
    );
    return Object.keys(allDirectives);
  }
  filteredGraph(filter, directives) {
    let dotOutput = "digraph G {\n";
    const filteredUnits = this.getFilteredUnits(filter);
    dotOutput += this.plotUnits(filteredUnits, directives);
    dotOutput += this.resolveConnections(filteredUnits);
    dotOutput += "}";
    return dotOutput;
  }
  getFilteredUnits(filter) {
    return this.units.filter(unit => {
      let included = true;
      Object.keys(filter).forEach(directive => {
        const options = filter[directive];
        if (options.indexOf(unit.metadata[directive]) === -1) included = false;
      });
      return included;
    });
  }
  plotUnits(filteredUnits, directives) {
    if (directives.length) {
      const currentDirective = directives[0];
      const restOfDirectives = directives.slice(1);

      const groups = groupUnitsBy(filteredUnits, currentDirective);
      let output = "";
      Object.keys(groups).forEach(groupName => {
        const unitsOfGroup = groups[groupName];
        if (groupName) {
          output += `subgraph cluster_${currentDirective}_${groupName} {\n`;
          output += `href = "${currentDirective}___${groupName}";\n`;
          output += `label = "${groupName}";\n`;
          output += this.plotUnits(unitsOfGroup, restOfDirectives);
          output += "}\n";
        } else {
          output += this.plotUnits(unitsOfGroup, restOfDirectives);
        }
      });
      return output;
    } else {
      let output = "";
      filteredUnits.forEach(unit => {
        output += `${unit.name} [label="${unit.name}"]; \n`;
      });
      return output;
    }
  }
  resolveConnections(filteredUnits) {
    const names = filteredUnits.map(u => u.name);
    let output = "";
    filteredUnits.forEach(unit =>
      (unit.dependsOn || []).forEach(dependency => {
        if (names.indexOf(dependency) !== -1) {
          output += `${unit.name} -> ${dependency};`;
        }
      })
    );
    return output;
  }
}

const groupUnitsBy = (units, directive) =>
  units.reduce(
    (result, unit) => ({
      ...result,
      [unit.metadata[directive] || ""]: [
        ...(result[unit.metadata[directive] || ""] || []),
        unit
      ]
    }),
    {}
  );
