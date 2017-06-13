import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css'; // import styles
// import 'react-summernote/lang/summernote-ru-RU'; // you can import any other locale

// Import bootstrap(v3 or v4) dependencies
import 'bootstrap/js/modal.js';
import 'bootstrap/js/dropdown.js';
import 'bootstrap/js/tooltip.js';
import 'bootstrap/dist/css/bootstrap.css';

import { reloadEditor } from '../actions/EditorActions';

class RichTextEditor extends Component {

  onChange(content) {
    this.props.reloadEditor(content);
  } 

  render() {
    const { html, codeview } = this.props;
    return (
      <div
        id="summernote_container"
        className="row wai-widget" 
      >
        <ReactSummernote
          codeview={codeview}
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
          onChange={this.onChange.bind(this)}
        />
      </div>
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  html: spintax.editorState,
  codeview: !spintax.richTextMode
})

export default connect(mapStateToProps, {
  reloadEditor,
})(RichTextEditor);