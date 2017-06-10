import React from 'react';
//import classNames from 'classnames';

export default ({ unspun, tooltipSelected, selected, higlighted, t, onClick, ...rest }) => {
  let backgroundColor;
  backgroundColor = (selected || tooltipSelected || higlighted) ? 'lightblue' : 'white';
  const textDecoration = higlighted ? 'underline red' : 'none';
  const fontSize = higlighted ? '200%' : '100%';
  backgroundColor = unspun ? 'yellow' : backgroundColor;
  return (
    <span 
      style={{
        backgroundColor,
        textDecoration,
        fontSize,
      }}
      data-type={t.type}
      data-start={t.start}
      data-end={t.end}
      data-length={t.length}
      data-id={t.id}
      onClick={onClick}
      className="sw"
      data-matchId={t.matchId}
      dangerouslySetInnerHTML={{ __html: t.t }}
      {...rest}
    />
  );
  
};