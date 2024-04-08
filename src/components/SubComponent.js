import React from 'react';

export const Component = () => null;

Component.Root = ({ children }) => {
  return <div className="component-root">root: {children}</div>;
};

Component.Header = ({ children }) => {
  return <header className="component-header">header: {children}</header>;
};