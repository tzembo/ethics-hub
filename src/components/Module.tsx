import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { Section, Line } from "../lib/parser";
import * as css from "./Module.scss";

type Props = {
  handleClick: Function;
  onDelete: Function;
  onSave: Function;
  currentId: number;
  index: number;
  section: Section;
};

type State = {
  editing: boolean;
  title: string;
};

class Module extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      editing: this.props.section.title == "" ? true : false,
      title: this.props.section.title
    };
    this.handleEdit = this.handleEdit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  handleEdit(e: any) {
    e.stopPropagation();
    this.setState({ editing: true });
  }

  handleSave() {
    let newSection = this.props.section;
    newSection.title = this.state.title;
    this.props.onSave(newSection);
  }

  handleChange(e: any) {
    this.setState({ title: e.target.value });
  }

  render() {
    const module = this.state.editing ? (
      <div
        className={
          this.props.index == this.props.currentId && !this.state.editing
            ? [css.sectionLabel, css.selected].join(" ")
            : css.sectionLabel
        }
        onClick={() => this.props.handleClick(this.props.index)}
      >
        <div
          style={{
            width: "100%",
            padding: "16px",
            paddingLeft: "24px",
            cursor: "pointer"
          }}
        >
          <input
            className="form-control"
            value={this.state.title}
            onChange={this.handleChange}
            onClick={e => e.stopPropagation()}
            style={{
              borderRight: "none",
              borderRadius: "0.25em 0px 0px 0.25em"
            }}
            placeholder="Module name..."
          />
          <button
            className="btn btn-primary"
            onClick={this.handleSave}
            style={{
              borderRadius: "0px 0.25em 0.25em 0px",
              marginRight: "6px"
            }}
          >
            Save
          </button>
          <button
            className="btn btn-danger"
            onClick={(e: any) => {
              e.stopPropagation();
              this.props.onDelete(this.props.index);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    ) : (
      <Draggable
        key={this.props.section.section_id}
        draggableId={this.props.section.section_id}
        index={this.props.index}
      >
        {(draggableProvided, draggableSnapshot) => (
          <div
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
            className={
              this.props.index == this.props.currentId
                ? [css.sectionLabel, css.selected].join(" ")
                : css.sectionLabel
            }
            onClick={() => this.props.handleClick(this.props.index)}
          >
            <div
              style={{
                width: "100%",
                padding: "16px",
                paddingLeft: "24px",
                cursor: "pointer"
              }}
            >
              {this.props.section.title}
              <svg
                className="octicon octicon-pencil"
                onClick={this.handleEdit}
                style={{
                  display:
                    this.props.index == this.props.currentId
                      ? "inline"
                      : "none",
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
              </svg>
            </div>
            <div
              style={{
                minHeight: "100%",
                padding: "20px",
                width: "48px",
                cursor: "grab"
              }}
              {...draggableProvided.dragHandleProps}
            >
              <svg
                className="octicon octicon-three-bars"
                style={{ display: "block", margin: "auto" }}
                viewBox="0 0 12 16"
                version="1.1"
                width="12"
                height="16"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  style={{ fill: "#E0E4E7" }}
                  d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"
                />
              </svg>
            </div>
          </div>
        )}
      </Draggable>
    );

    return module;
  }
}

export default Module;
