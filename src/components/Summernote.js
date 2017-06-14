import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css'; // import styles
// import 'react-summernote/lang/summernote-ru-RU'; // you can import any other locale

import $ from 'jquery';

// Import bootstrap(v3 or v4) dependencies
import 'bootstrap/js/modal.js';
import 'bootstrap/js/dropdown.js';
import 'bootstrap/js/tooltip.js';
import 'bootstrap/dist/css/bootstrap.css';

import { setEditorState, reloadEditor, unsetSummernoteMode } from '../actions/EditorActions';

class RichTextEditor extends Component {

  onChange(content, $editor) {
    const { codeview, html } = this.props;
    console.log({html, codeview})
    console.log(window.lastButton);
    if(!codeview) {
      this.props.setEditorState(content);
      return;
    }
    if(codeview && window.lastButton) {
      if(window.lastButton === 'Update') {
        this.props.reloadEditor(content);
        $('#edit-spintax').show();
      } else if(window.lastButton === 'Cancel') {
        this.props.unsetSummernoteMode();
        $('#edit-spintax').show();
      }
    }

  } 

  render() {
    const { html, codeview } = this.props;
    return (
      <div
        className="row wai-widget"
      >
        <ReactSummernote
          codeview={codeview}
          onChange={this.onChange.bind(this)}
          value={html}
          options={{
            height: 350,
            dialogsInBody: true,
            toolbar: [
              ['style', ['style']],
              ['font', ['bold', 'underline', 'clear']],
              ['fontname', ['fontname']],
              ['para', ['ul', 'ol', 'paragraph']],
              ['table', ['table']],
              ['insert', ['link', 'picture', 'video']],
              ['view', ['fullscreen']]
            ]
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  html: spintax.editorState,
  codeview: !spintax.richTextMode,
})

export default connect(mapStateToProps, {
  reloadEditor,
  setEditorState, 
  unsetSummernoteMode
})(RichTextEditor);