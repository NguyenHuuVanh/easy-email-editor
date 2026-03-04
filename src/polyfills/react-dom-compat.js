'use strict';

/**
 * react-dom compatibility wrapper for React 19 (Next.js 16+).
 *
 * React 19 removed: findDOMNode, render, unmountComponentAtNode
 * This file re-exports Next.js's compiled react-dom and adds them back
 * for @arco-design/web-react and easy-email-extensions that still use them.
 *
 * Loads via 'next/dist/compiled/react-dom/index.js' directly to avoid
 * circular resolution (this file IS aliased as 'react-dom').
 */

var ReactDOM = require('next/dist/compiled/react-dom/index.js');
var ReactDOMClient = require('next/dist/compiled/react-dom/client.js');

// findDOMNode — walks fiber tree to find the host DOM node
function findDOMNode(componentOrElement) {
  if (componentOrElement == null) return null;
  if (componentOrElement instanceof Element || componentOrElement instanceof Text)
    return componentOrElement;
  // class component instance: walk fiber internals
  var fiber = componentOrElement._reactInternals;
  if (fiber) {
    var node = fiber;
    while (node) {
      if (node.stateNode instanceof Element || node.stateNode instanceof Text)
        return node.stateNode;
      node = node.child || null;
    }
  }
  return null;
}

// render — shim using createRoot
function render(element, container, callback) {
  var root = container.__reactRoot;
  if (!root) {
    root = ReactDOMClient.createRoot(container);
    container.__reactRoot = root;
  }
  root.render(element);
  if (typeof callback === 'function') Promise.resolve().then(callback);
}

// unmountComponentAtNode — shim using root.unmount
function unmountComponentAtNode(container) {
  var root = container.__reactRoot;
  if (root) {
    root.unmount();
    container.__reactRoot = null;
    return true;
  }
  return false;
}

// Build the merged exports object
var merged = Object.assign({}, ReactDOM, {
  findDOMNode: findDOMNode,
  render: render,
  unmountComponentAtNode: unmountComponentAtNode,
});

// Mark as ESM-compatible so webpack named imports work
merged.__esModule = true;
merged.default = merged;

module.exports = merged;

module.exports = { findDOMNode: findDOMNode };
