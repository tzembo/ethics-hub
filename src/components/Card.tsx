// Card.tsx
// Component for indivudal questions in documentation editor.
// Handles state and appearance of each individual question.

import * as React from "react";
import { Line } from "../lib/parser";
import * as css from "./Card.scss";
import { Draggable } from "react-beautiful-dnd";

type Props = {
  index: number;
  line: Line;
  onSave: Function;
  onDelete: Function;
};

type State = {
  line: Line;
  editing: boolean;
};

class Card extends React.Component<Props, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      line: { ...this.props.line },
      editing: this.props.line.line_summary == "" ? true : false
    };

    this.handleChecked = this.handleChecked.bind(this);
    this.handleEditClicked = this.handleEditClicked.bind(this);
    this.handleEditCanceled = this.handleEditCanceled.bind(this);
    this.handleEditSaved = this.handleEditSaved.bind(this);
    this.setTitle = this.setTitle.bind(this);
    this.setDescription = this.setDescription.bind(this);
    this.setAnswer = this.setAnswer.bind(this);
  }

  componentWillReceiveProps(nextProps: any) {
    this.setState({
      line: nextProps.line
    });
  }

  handleChecked(e: any) {
    e.stopPropagation();
    this.setState(
      {
        line: {
          line: this.state.line.line,
          line_id: this.state.line.line_id,
          line_summary: this.state.line.line_summary,
          line_content: this.state.line.line_content,
          line_enabled: !this.state.line.line_enabled
        }
      },
      () => {
        this.props.onSave(this.state.line);
      }
    );
  }

  handleEditStarted() {
    this.setState({
      editing: true
    });
  }

  handleEditCanceled() {
    this.setState({
      editing: false
    });

    if (this.state.line.line == "" && this.state.line.line_summary == "") {
      this.props.onDelete(this.props.index);
    }
  }

  handleEditSaved() {
    this.props.onSave(this.state.line);
    this.setState({ editing: false });
  }

  handleEditClicked() {
    this.setState({
      editing: true
    });
  }

  setTitle(event: any) {
    let newLine = this.state.line;
    newLine.line_summary = event.target.value;
    this.setState({ line: newLine });
  }

  setDescription(event: any) {
    let newLine = this.state.line;
    newLine.line = event.target.value;
    this.setState({ line: newLine });
  }

  setAnswer(event: any) {
    let newLine = this.state.line;
    newLine.line_content = event.target.value;
    this.setState({ line: newLine });
  }

  render() {
    const styles = {
      card: {
        color: this.state.line.line_enabled ? "black" : "#d6d6d6"
      }
    };

    const placeholder = this.props.line.line_enabled
      ? "How have you met the criteria?"
      : "Why does this not apply?";
    const textarea = (
      <span>
        {this.state.line.line_content == ""
          ? placeholder
          : this.state.line.line_content}
      </span>
    );

    const question = this.state.editing ? (
      <Draggable
        key={this.props.line.line_id}
        draggableId={this.props.line.line_id}
        index={this.props.index}
      >
        {(draggableProvided, draggableSnapshot) => (
          <div
            className={css.box}
            key={this.props.line.line_id}
            ref={draggableProvided.innerRef}
            style={draggableProvided.draggableProps.style}
            {...draggableProvided.draggableProps}
            {...draggableProvided.dragHandleProps}
          >
            <div className={css.form}>
              <dl className="form-group">
                <dt>
                  <label htmlFor="file-name">
                    <span>Title</span>
                  </label>
                </dt>
                <dd>
                  <input
                    name="commit[title]"
                    value={this.state.line.line_summary}
                    onChange={this.setTitle}
                    className="form-control"
                    type="text"
                    id="commit-title"
                  />
                </dd>
              </dl>
              <dl className="form-group">
                <dt>
                  <label htmlFor="commit-title">
                    <span>Description</span>
                  </label>
                </dt>
                <dd>
                  <input
                    name="commit[title]"
                    value={this.state.line.line}
                    onChange={this.setDescription}
                    className="form-control"
                    type="text"
                    id="commit-title"
                  />
                </dd>
              </dl>
              <dl className="form-group">
                <dt>
                  <label htmlFor="commit-description">Answer</label>
                </dt>
                <dd>
                  <textarea
                    name="commit[description]"
                    value={this.state.line.line_content}
                    onChange={this.setAnswer}
                    className="form-control"
                    placeholder={placeholder}
                    id="commit-description"
                  />
                </dd>
              </dl>
              <button
                className="btn btn-primary"
                onClick={this.handleEditSaved}
                style={{ marginRight: "12px" }}
              >
                Save
              </button>
              <button
                className="btn btn-secondary"
                onClick={this.handleEditCanceled}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => this.props.onDelete(this.props.index)}
                style={{ float: "right" }}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Draggable>
    ) : (
      <Draggable
        key={this.props.line.line_id}
        draggableId={this.props.line.line_id}
        index={this.props.index}
      >
        {(draggableProvided, draggableSnapshot) => (
          <div
            className={css.box}
            key={this.props.line.line_id}
            ref={draggableProvided.innerRef}
            {...draggableProvided.draggableProps}
          >
            <div
              className={`${css.boxRow} d-flex flex-items-center`}
              {...draggableProvided.dragHandleProps}
            >
              <div>
                <input
                  type="checkbox"
                  checked={this.state.line.line_enabled}
                  onChange={this.handleChecked}
                  style={{ width: "15px", height: "15px", marginRight: "15px" }}
                />
              </div>
              <div className="flex-auto" style={styles.card}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <strong>{this.props.line.line_summary}</strong>
                </div>
                <div>{this.props.line.line}</div>
              </div>
              <div>
                <button
                  className="btn btn-secondary"
                  onClick={this.handleEditClicked}
                >
                  Edit
                </button>
              </div>
            </div>
            <div
              onClick={this.handleEditClicked}
              style={{
                padding: "16px",
                borderTop: "1px rgb(225, 228, 232) solid",
                backgroundColor: "#fcfcfc",
                cursor: "pointer"
              }}
            >
              {textarea}
            </div>
          </div>
        )}
      </Draggable>
    );

    return question;
  }
}

export default Card;
