import React, { Component } from 'react';
import classNames from 'classnames';

class SpinwordHtml extends Component {

  shouldComponentUpdate(nextProps) {
    const { props } = this;
    if(nextProps.t.t !== props.t.t) {
      return true;
    }
    if(nextProps.unspun !== props.unspun)  {
      return true;
    }
    if(nextProps.selected !== props.selected) {
      return true;
    }
    if(nextProps.focused !== props.focused) {
      return true;
    }
    if(nextProps.bracketHighlighted !== props.bracketHighlighted) {
      return true;
    }
    return false;
  }

  render () {
    const { unspun, selected, focused, bracketHighlighted, t, ...rest } = this.props;
    const spanClassNames = classNames(
      'sw',
      { 'temp-rewrite': selected },
      { 'temp temp-edit': focused },
      { 'highlight': bracketHighlighted },
      { 'temp-unspun-highlight': unspun }
    );
    return (
      <span 
        className={spanClassNames}
        data-id={t.id}
        {...rest}
        dangerouslySetInnerHTML={{ __html: t.t }}
      />
    )
  }
}

export default SpinwordHtml;
