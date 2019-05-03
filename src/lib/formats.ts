// formats.ts

import { Checklist, Section, Line } from "./parser";

const isChecked = (enabled: boolean) => {
  return enabled ? "x" : " ";
};

class Format {
  // fields
  data: Checklist;

  format_document = (
    title: string,
    sections: string,
    docs_link: string
  ): string => {
    return `${title}\n${sections}\n\n${docs_link}`;
  };

  format_section = (title: string, lines: string): string => {
    return `${title}\n${lines}`;
  };

  format_line = (
    enabled: boolean,
    line_id: string,
    line_summary: string,
    line: string,
    answer: string
  ): string => {
    return `* ${line_id} ${line_summary}: ${line}`;
  };

  append_delimiter = "\n\n";
  section_delimiter = "\n\n";
  line_delimiter = "\n";
  docs_link =
    "Ethics documentation generated with EthicsHub (http://github.com/tzembo/ethics-hub).";

  constructor(data: Checklist) {
    this.data = data;
  }

  render(): string {
    let sections = [];
    for (let i = 0; i < this.data.sections.length; i++) {
      let lines = [];
      for (let j = 0; j < this.data.sections[i].lines.length; j++) {
        lines.push(
          this.format_line(
            this.data.sections[i].lines[j].line_enabled,
            this.data.sections[i].lines[j].line_id,
            this.data.sections[i].lines[j].line_summary,
            this.data.sections[i].lines[j].line,
            this.data.sections[i].lines[j].line_content
          )
        );
      }
      sections.push(
        this.format_section(
          this.data.sections[i].title,
          lines.join(this.line_delimiter)
        )
      );
    }

    return this.format_document(
      this.data.title,
      sections.join(this.section_delimiter),
      this.docs_link
    );
  }
}

class Markdown extends Format {
  format_document = (title: string, sections: string, docs_link: string) => {
    return `# ${title}\n${sections}\n\n${docs_link}`;
  };

  format_section = (title: string, lines: string) => {
    return `## ${title}
${lines}`;
  };

  format_line = (
    enabled: boolean,
    line_id: string,
    line_summary: string,
    line: string,
    answer: string
  ) => {
    return `* [${isChecked(enabled)}] **${line_id} ${line_summary}**: ${line}

		${answer}`;
  };
}

class Text extends Format {
  format_document = (title: string, sections: string, docs_link: string) => {
    return `# ${title}\n${sections}\n\n${docs_link}`;
  };
  format_section = (title: string, lines: string) => {
    return `${title}
${lines}`;
  };

  format_line = (
    enabled: boolean,
    line_id: string,
    line_summary: string,
    line: string
  ) => {
    return `${line_id} ${line_summary}: ${line}`;
  };
}

class Html extends Format {}

// Interface for formats
interface IFormats {
  [key: string]: any;
}

interface IExtensions {
  [key: string]: string;
}

// Exported object containing each formatter
export const Formats: IFormats = {
  markdown: Markdown,
  text: Text,
  html: Html
};

export const Extensions: IExtensions = {
  markdown: ".md",
  text: ".txt",
  html: ".html"
};
