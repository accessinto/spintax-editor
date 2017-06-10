import React, { Component } from 'react';
import { connect } from 'react-redux';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { setEditorState } from '../actions/EditorActions';

class WysiwygEditor extends Component {

  onEditorStateChange(contentState) {
    console.log(contentState);
    const raw = convertToRaw(contentState);
    this.props.setEditorState(raw);
  }

  render() {
    const { editorState } = this.props;
    const contentState = convertFromRaw(editorState);
    const editorStateC = EditorState.createWithContent(contentState)
    return (
      <div className="add fancy wordai classes here">
        <Editor
          contentState={contentState}
          toolbarClassName="home-toolbar"
          wrapperClassName="home-wrapper"
          editorClassName="home-editor"
          onContentStateChange={this.onEditorStateChange.bind(this)} 
        />
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  editorState: spintax.editorState,
});

export default connect(mapStateToProps, { setEditorState })(WysiwygEditor);