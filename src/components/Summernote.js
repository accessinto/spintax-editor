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

import { setEditorState } from '../actions/EditorActions';

class RichTextEditor extends Component {
  onChange(content) {
    console.log('onChange', content);
    this.setEditorState(content);
  }

  render() {
    const { htmlMarkup } = this.props;
    return (
      <ReactSummernote
        value={htmlMarkup}
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
            ['view', ['fullscreen', 'codeview']]
          ]
        }}
        onChange={this.onChange}
      />
    );
  }
}

const mapStateToProps = ({ spintax }) => ({
  html: spintax.editorState
})

export default connect(mapStateToProps, {
  setEditorState,
})(RichTextEditor);