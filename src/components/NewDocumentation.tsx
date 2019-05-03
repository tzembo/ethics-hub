import * as React from "react";
import * as css from "./NewDocumentation.scss";
import Modal from "react-modal";
import { parse, Checklist, Section } from "../lib/parser";
import { withRouter, RouteComponentProps } from "react-router-dom";

// Load templates
const templates = require("../../templates.json");

// Possible types of templates listed in templates.json
const types = {
  URL: "url",
  CUSTOM: "custom",
  BLANK: "blank"
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

// Blank documentation data structure
const blank = {
  title: "New documentation",
  sections: []
};

interface Props extends RouteComponentProps {
  data: Checklist;
  onDataChange: (data: Checklist) => void;
}

type State = {
  currentIndex: number;
  data: Checklist;

  // Modal
  show: boolean;
  custom: string;
};

class NewDocumentation extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);

    this.state = {
      data: blank,
      currentIndex: -1,
      show: false,
      custom: ""
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleStart = this.handleStart.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleCustomTemplateChange = this.handleCustomTemplateChange.bind(
      this
    );
    this.handleCustomStart = this.handleCustomStart.bind(this);
  }

  handleClick(index: number, type: string) {
    switch (type) {
      case types.URL:
        fetch(templates[index].source_url)
          .then(response => {
            response.text().then(text => {
              const checklist = parse(text);
              this.setState({ currentIndex: index, data: checklist });
            });
          })
          .catch(() => {
            alert("error fetching template");
          });
        break;
      case types.CUSTOM:
        this.showModal();
        break;
      case types.BLANK:
        this.setState({
          currentIndex: index,
          data: blank
        });
        break;
      default:
        alert("Error: unsupported template");
        break;
    }
  }

  handleStart() {
    this.props.onDataChange(this.state.data);
    this.props.history.replace("/edit");
  }

  showModal() {
    this.setState({ show: true });
  }

  hideModal() {
    this.setState({ show: false });
  }

  handleCustomTemplateChange(e: any) {
    this.setState({ custom: e.target.value });
  }

  handleCustomStart() {
    this.setState(
      {
        data: parse(this.state.custom)
      },
      () => this.handleStart()
    );
  }

  render() {
    const buttons = templates.map((template: any, index: number) => (
      <div
        key={template.title}
        className={
          this.state.currentIndex == index
            ? [css.gridItem, css.selected].join(" ")
            : css.gridItem
        }
        onClick={() => this.handleClick(index, template.type)}
      >
        <strong className={css.title}>{template.title}</strong>
      </div>
    ));

    const customTemplateModal = (
      <div>
        <h2>Load custom template</h2>
        <p>
          Click <a href="http://deon.drivendata.org/#custom-checklists">here</a>{" "}
          to see the YAML format supported by EthicsHub for custom documentation
          templates.
        </p>
        <dl className="form-group">
          <textarea
            className="form-control"
            id="custom-template"
            value={this.state.custom}
            onChange={this.handleCustomTemplateChange}
          />
        </dl>
        <button
          className="btn btn-primary"
          onClick={this.handleCustomStart}
          style={{ marginRight: "12px" }}
        >
          Get started
        </button>
        <button className="btn btn-secondary" onClick={this.hideModal}>
          Close
        </button>
      </div>
    );

    const initmessage = (
      <div style={{ padding: "48px", textAlign: "center" }}>
        Choose a template to get started
      </div>
    );
    const details =
      this.state.currentIndex < 0 ? (
        <div />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            padding: "30px",
            flexDirection: "column"
          }}
        >
          <div>
            <p>
              <strong>Description</strong>
            </p>
            <p>{templates[this.state.currentIndex].description}</p>
            <br />
            <p>
              <strong>Sections</strong>
            </p>
            <p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "200px"
                }}
              >
                {this.state.data.sections.map(
                  (section: Section, index: number) => (
                    <div
                      style={{
                        width: "100%",
                        background: index % 2 == 0 ? "#e8e8e8" : "#f2f2f2",
                        padding: "10px"
                      }}
                    >
                      {section.title}
                    </div>
                  )
                )}
              </div>
            </p>
          </div>
          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <button className="btn btn-primary" onClick={this.handleStart}>
              Get started
            </button>
          </div>
        </div>
      );

    const right = this.state.currentIndex >= 0 ? details : initmessage;

    return (
      <div>
        <Modal isOpen={this.state.show} style={customStyles}>
          {customTemplateModal}
        </Modal>
        <div className="CommunityTemplate-header px-4 bg-white text-right">
          <span style={{ float: "left", fontWeight: 600 }}>
            Add ethics documentation to your project
          </span>
        </div>
        <div className="bg-gray-light mt-2 pb-2 border-top">
          <div
            className="d-flex flex-row"
            style={{
              marginTop: "2em",
              marginBottom: "2em",
              marginLeft: "auto",
              marginRight: "auto",
              background: "white",
              maxWidth: "720px",
              minHeight: "400px",
              border: "1px solid #d1d5da",
              borderRadius: "3px"
            }}
          >
            <div className="col-5" style={{ borderRight: "1px solid #d1d5da" }}>
              <div className={css.grid}>{buttons}</div>
            </div>
            <div className="col-7">{right}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(NewDocumentation);
