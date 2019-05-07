// Documentation.tsx

import * as React from "react";
import * as css from "./Documentation.scss";
import Modal from "react-modal";
import { Checklist, Section, Line, dump } from "../lib/parser";
import Card from "./Card";
import Module from "./Module";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Formats, Extensions } from "../lib/formats";
import * as modulecss from "./Module.scss";

type Props = {
  initData: Checklist;
};

type State = {
  // Data
  data: Checklist;
  currentId: number;

  // Modal
  show: boolean;
  modal: string;

  // Commit
  commitPath: string;
  commitFormat: string;
  commitMessage: string;

  // Title
  isEditingTitle: boolean;
};

// Modal types
const modal = {
  GENERATE: "generate",
  EXPORT: "export",
  SAVE: "save"
};

// getRepoFromUrl returns
const getRepoFromUrl = (url: string) => {
  const reg = "/github.com/([^/]*)/([^/#]*)"; // regex to capture repo user and name
  const match = url.match(reg);
  if (match == null) {
    return ["", ""];
  } else {
    return [match[1], match[2]];
  }
};

// Copy exported YAML template to clipboard
const copyToClipboard = () => {
  const copyText = document.getElementById(
    "exported-template"
  ) as HTMLInputElement;
  if (copyText == null) return;
  copyText.select();
  document.execCommand("copy");
};

// reorder is a helper function for reordering arrays after drag amd drp[]
const reorder = (
  list: Array<any>,
  startIndex: number,
  endIndex: number
): Array<any> => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const fixSectionIds = (list: Array<Section>): Array<Section> => {
  return list.map((section, index) => {
    let newSection = section;
    newSection.section_id = getSectionId(index);
    return newSection;
  });
};

const fixQuestionIds = (sectionId: string, list: Array<Line>): Array<Line> => {
  return list.map((question, index) => {
    let newQuestion = question;
    newQuestion.line_id = getLineId(sectionId, index);
    return newQuestion;
  });
};

const getSectionId = (n: number) => {
  return String.fromCharCode(65 + n);
};

const getLineId = (sectionId: string, n: number) => {
  return `${sectionId}.${n + 1}`;
};

// Modal styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    minWidth: "560px"
  }
};

class Documentation extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      currentId: 0,
      show: false,
      modal: modal.GENERATE,
      data: this.props.initData,
      commitPath: "ETHICS",
      commitFormat: "markdown",
      commitMessage: "Create documentation using EthicsHub",
      isEditingTitle: true
    };
    this.handleClick = this.handleClick.bind(this);
    this.showSaveModal = this.showSaveModal.bind(this);
    this.showExportModal = this.showExportModal.bind(this);
    this.showGenerateModal = this.showGenerateModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.saveQuestion = this.saveQuestion.bind(this);
    this.generateDocumentation = this.generateDocumentation.bind(this);
    this.exportTemplate = this.exportTemplate.bind(this);
    this.handleAddQuestion = this.handleAddQuestion.bind(this);
    this.handleRemoveQuestion = this.handleRemoveQuestion.bind(this);
    this.handleAddSection = this.handleAddSection.bind(this);
    this.handleRemoveSection = this.handleRemoveSection.bind(this);
    this.handleCommitPathChange = this.handleCommitPathChange.bind(this);
    this.handleCommitFormatChange = this.handleCommitFormatChange.bind(this);
    this.handleCommitMessageChange = this.handleCommitMessageChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTitleSave = this.handleTitleSave.bind(this);
    this.handleTitleEdit = this.handleTitleEdit.bind(this);
  }

  // Handle module navigation
  handleClick(index: number) {
    this.setState({ currentId: index });
    var sections = document.getElementsByClassName(modulecss.sectionLabel);
    for (var i = 0; i < sections.length; i++) {
      sections[i].classList.remove(modulecss.selected);
    }
    sections[index].classList.add(modulecss.selected);
  }

  // Show generate modal
  showGenerateModal() {
    this.setState({ show: true, modal: modal.GENERATE });
  }

  // Show export modal
  showExportModal() {
    this.setState({ show: true, modal: modal.EXPORT });
  }

  // Show export modal
  showSaveModal() {
    this.setState({ show: true, modal: modal.SAVE });
  }

  // Hide modal
  hideModal() {
    this.setState({ show: false });
  }

  // Handle changes to the underlying data
  saveQuestion(newLine: Line) {
    for (
      let i = 0;
      i < this.state.data.sections[this.state.currentId].lines.length;
      i++
    ) {
      if (
        this.state.data.sections[this.state.currentId].lines[i].line_id ==
        newLine.line_id
      ) {
        let newData = this.state.data;
        newData.sections[this.state.currentId].lines[i] = newLine;
        this.setState({
          data: newData
        });
        break;
      }
    }
  }

  saveSection(newSection: Section) {
    let newData = this.state.data;
    newData.sections[this.state.currentId] = newSection;
    this.setState({ data: newData });
  }

  // Export a YAML template
  exportTemplate(): string {
    return dump(this.state.data);
  }

  handleAddQuestion() {
    let newData = this.state.data;
    newData.sections[this.state.currentId].lines.push({
      line: "",
      line_id: getLineId(
        newData.sections[this.state.currentId].section_id,
        newData.sections[this.state.currentId].lines.length
      ),
      line_summary: "",
      line_content: "",
      line_enabled: true
    });
    this.setState({ data: newData });
  }

  handleRemoveQuestion(index: number) {
    let newData = this.state.data;
    newData.sections[this.state.currentId].lines.splice(index, 1);
    newData.sections[this.state.currentId].lines = fixQuestionIds(
      newData.sections[this.state.currentId].section_id,
      newData.sections[this.state.currentId].lines
    );
    this.setState({ data: newData });
  }

  handleAddSection() {
    let newCurrentId = this.state.data.sections.length;
    let newData = this.state.data;
    newData.sections.push({
      title: "",
      section_id: getSectionId(newData.sections.length),
      lines: []
    });
    this.setState({
      currentId: newCurrentId,
      data: newData
    });
  }

  handleRemoveSection(index: number) {
    let newData = this.state.data;
    let newCurrentId = this.state.currentId == 0 ? 0 : this.state.currentId - 1;
    newData.sections.splice(index, 1);
    newData.sections = fixSectionIds(newData.sections);
    this.setState({
      currentId: newCurrentId,
      data: newData
    });
  }

  // Generate markdown from the current data model
  generateDocumentation() {
    const location = window.location.href;
    const template = new Formats[this.state.commitFormat](this.state.data);
    const content = template.render();
    const [repouser, reponame] = getRepoFromUrl(location);
    chrome.runtime.sendMessage(
      {
        type: "createFile",
        message: this.state.commitMessage,
        location: location,
        content: btoa(content),
        path: [this.state.commitPath, Extensions[this.state.commitFormat]].join(
          ""
        )
      },
      function(response) {
        console.log(response);

        if (response.status == 201) {
          window.location.href = `https://github.com/${repouser}/${reponame}`;
        } else {
          alert(
            "Error creating new file. You might not have the correct permissions for this repository, or the file might already exist."
          );
        }
      }
    );
  }

  handleCommitPathChange(e: any) {
    e.stopPropagation();
    this.setState({ commitPath: e.target.value });
  }

  handleCommitFormatChange(e: any) {
    e.stopPropagation();
    this.setState({ commitFormat: e.target.value });
  }

  handleCommitMessageChange(e: any) {
    e.stopPropagation();
    this.setState({ commitMessage: e.target.value });
  }

  handleTitleChange(e: any) {
    let newData = this.state.data;
    newData.title = e.target.value;
    this.setState({ data: newData });
  }

  handleTitleEdit() {
    this.setState({ isEditingTitle: true });
  }

  handleTitleSave() {
    this.setState({ isEditingTitle: false });
  }

  componentWillMount() {
    Modal.setAppElement("#ethics-hub-application");
  }

  render() {
    let modelContent;

    switch (this.state.modal) {
      case modal.GENERATE:
        modelContent = (
          <div key="modal-content-div">
            <h2>Generate documentation</h2>
            <dl key="outer-dl" className="form-group">
              <dt>
                <label htmlFor="file-path">
                  <span>File path</span>
                </label>
              </dt>
              <dd>
                <input
                  key="file-path"
                  className="form-control"
                  type="text"
                  onChange={e => this.handleCommitPathChange(e)}
                  value={this.state.commitPath}
                  id="file-path"
                />
                <select
                  style={{ height: "100%" }}
                  onChange={e => this.handleCommitFormatChange(e)}
                  value={this.state.commitFormat}
                >
                  <option value="markdown">.md</option>
                  <option value="html">.html</option>
                  <option value="txt">.txt</option>
                </select>
              </dd>
            </dl>
            <dl className="form-group">
              <dt>
                <label htmlFor="commit-message">
                  <span>Commit message</span>
                </label>
              </dt>
              <dd>
                <input
                  key="commit-message"
                  className="form-control"
                  type="text"
                  onChange={e => this.handleCommitMessageChange(e)}
                  value={this.state.commitMessage}
                  id="commit-message"
                />
              </dd>
            </dl>
            <button
              className="btn btn-primary"
              onClick={this.generateDocumentation}
              style={{ marginRight: "12px" }}
            >
              Generate
            </button>
            <button className="btn btn-secondary" onClick={this.hideModal}>
              Close
            </button>
          </div>
        );
        break;

      case modal.EXPORT:
        modelContent = (
          <div>
            <h2>Export template</h2>
            <dl className="form-group">
              <textarea
                className="form-control"
                id="exported-template"
                value={this.exportTemplate()}
              />
            </dl>
            <button
              className="btn btn-primary"
              onClick={copyToClipboard}
              style={{ marginRight: "12px" }}
            >
              Copy to clipboard
            </button>
            <button className="btn btn-secondary" onClick={this.hideModal}>
              Close
            </button>
          </div>
        );
        break;

      case modal.SAVE:
        modelContent = (
          <div>
            <div className="flash" style={{ marginBottom: "15px" }}>
              <strong>
                Saving without generating documentation is still under
                construction.
              </strong>{" "}
              Check back later for the ability to persist your data.
            </div>
            <button className="btn btn-secondary" onClick={this.hideModal}>
              Close
            </button>
          </div>
        );
        break;
      default:
        modelContent = <div />;
        break;
    }

    const title = this.state.isEditingTitle ? (
      <div>
        <input
          className="form-control"
          value={this.state.data.title}
          onChange={this.handleTitleChange}
          style={{
            minWidth: "250px",
            borderRight: "none",
            borderRadius: "0.25em 0px 0px 0.25em"
          }}
          placeholder="Title..."
        />
        <button
          className="btn btn-primary"
          onClick={this.handleTitleSave}
          style={{
            borderRadius: "0px 0.25em 0.25em 0px"
          }}
        >
          Save
        </button>
      </div>
    ) : (
      <div>
        <strong>{this.state.data.title}</strong>
        <svg
          className="octicon octicon-pencil"
          onClick={this.handleTitleEdit}
          style={{
            cursor: "pointer",
            marginLeft: "5px"
          }}
          viewBox="0 0 14 16"
          version="1.1"
          width="14"
          height="16"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            style={{ fill: "#E0E4E7" }}
            d="M0 12v3h3l8-8-3-3-8 8zm3 2H1v-2h1v1h1v1zm10.3-9.3L12 6 9 3l1.3-1.3a.996.996 0 0 1 1.41 0l1.59 1.59c.39.39.39 1.02 0 1.41z"
          />
        </svg>{" "}
      </div>
    );

    const Questions: React.FC = () => {
      {
        const onDragEnd = (result: any) => {
          if (!result.destination) {
            return;
          }

          // Update state with drag results
          let newData = this.state.data;
          newData.sections[this.state.currentId].lines = reorder(
            newData.sections[this.state.currentId].lines,
            result.source.index,
            result.destination.index
          );
          newData.sections[this.state.currentId].lines = fixQuestionIds(
            newData.sections[this.state.currentId].section_id,
            newData.sections[this.state.currentId].lines
          );
          this.setState({ data: newData });
        };

        // Components for questions column
        const questions =
          this.state.data.sections.length > 0 ? (
            this.state.data.sections[this.state.currentId].lines.map(
              (line: Line, index) => (
                <Card
                  key={index}
                  line={line}
                  onSave={this.saveQuestion}
                  onDelete={this.handleRemoveQuestion}
                  index={index}
                />
              )
            )
          ) : (
            <div />
          );

        const newQuestion =
          this.state.data.sections.length > 0 ? (
            <div className="placeholder-box border-dashed bg-gray-light my-3 rounded-2">
              <div className="pt-4 pb-4">
                <div className="d-flex flex-justify-center">
                  <button className="btn" onClick={this.handleAddQuestion}>
                    New question...
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>Create a module to add questions</div>
          );

        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="questions">
              {(droppableProvided, droppableSnapshot) => (
                <div ref={droppableProvided.innerRef}>
                  {questions}
                  {droppableProvided.placeholder}
                  {newQuestion}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );
      }
    };

    const Modules: React.FC = () => {
      {
        const onDragEnd = (result: any) => {
          if (!result.destination) {
            return;
          }

          let newData = this.state.data;
          newData.sections = reorder(
            newData.sections,
            result.source.index,
            result.destination.index
          );
          newData.sections = fixSectionIds(newData.sections);
          this.setState({
            currentId: result.destination.index,
            data: newData
          });
        };

        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(droppableProvided, droppableSnapshot) => (
                <div ref={droppableProvided.innerRef}>
                  {this.state.data.sections.map((section, index) => (
                    <Module
                      index={index}
                      handleClick={this.handleClick}
                      onDelete={this.handleRemoveSection}
                      onSave={this.saveSection}
                      currentId={this.state.currentId}
                      section={section}
                    />
                  ))}
                  {droppableProvided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        );
      }
    };

    return (
      <div key="hello-world">
        <Modal key="editor-modal" isOpen={this.state.show} style={customStyles}>
          {modelContent}
        </Modal>

        <div className="CommunityTemplate-header px-4 bg-white text-right">
          <div style={{ float: "left" }}>{title}</div>
          <button
            type="button"
            onClick={this.showSaveModal}
            style={{ marginRight: "15px" }}
            className="btn btn-secondary btn-sm js-toggle-template-commit"
          >
            Save
          </button>
          <button
            type="button"
            onClick={this.showExportModal}
            style={{ marginRight: "15px" }}
            className="btn btn-secondary btn-sm js-toggle-template-commit"
          >
            Export template
          </button>
          <button
            type="button"
            onClick={this.showGenerateModal}
            className="btn btn-primary btn-sm js-toggle-template-commit"
          >
            Generate documentation
          </button>
        </div>
        <div className="bg-gray-light mt-2" style={{ minHeight: "540px" }}>
          <div className="d-flex border-top" style={{ height: "100%" }}>
            <div className={`col-3`}>
              <div className={css.documentationSidebar}>
                <div>
                  <Modules />
                  <div>
                    <div className="pt-4 pb-4">
                      <div className="d-flex flex-justify-center">
                        <button className="btn" onClick={this.handleAddSection}>
                          New module...
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-9">
              <div className={css.questionsColumn}>
                <div>
                  <Questions />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Documentation;
