// parser.ts

const yaml = require("js-yaml");

export interface Checklist {
  title: string;
  sections: Array<Section>;
}

export interface Section {
  title: string;
  section_id: string;
  lines: Array<Line>;
}

export interface Line {
  line: string;
  line_id: string;
  line_summary: string;
  line_content: string;
  line_enabled: boolean;
}

// Load YAML file from URL
export const parse = (doc: string): Checklist => {
  let cl: Checklist = yaml.safeLoad(doc);
  // Add custom attributes
  for (let i = 0; i < cl.sections.length; i++) {
    for (let j = 0; j < cl.sections[i].lines.length; j++) {
      cl.sections[i].lines[j].line_enabled = true;
      cl.sections[i].lines[j].line_content = "";
    }
  }

  return cl;
};

export const dump = (cl: Checklist): string => {
  let doc = cl;

  // Remove custom attributes
  for (let i = 0; i < doc.sections.length; i++) {
    for (let j = 0; j < doc.sections[i].lines.length; j++) {
      delete doc.sections[i].lines[j].line_enabled;
      delete doc.sections[i].lines[j].line_content;
    }
  }

  return yaml.safeDump(doc);
};
