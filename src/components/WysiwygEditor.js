import React, { Component } from 'react';
import { connect } from 'react-redux';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { setEditorState } from '../actions/EditorActions';

class WysiwygEditor extends Component {

  onEditorStateChange(editorState) {
    console.log(editorState.getCurrentContent());
    const raw = convertToRaw(editorState.getCurrentContent());
    this.props.setEditorState(raw);
  }

  render() {
    const { editorState } = this.props;
    const contentState = convertFromRaw(editorState);
    const editorStateC = EditorState.createWithContent(contentState)
    return (
      <div className="add fancy wordai classes here">
        <Editor
          editorState={editorStateC}
          toolbarClassName="home-toolbar"
          wrapperClassName="home-wrapper"
          editorClassName="home-editor"
          onEditorStateChange={this.onEditorStateChange.bind(this)} 
        />
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  editorState: spintax.editorState,
});

export default connect(mapStateToProps, { setEditorState })(WysiwygEditor);