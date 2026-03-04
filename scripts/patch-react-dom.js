"use strict";
/**
 * Patches Next.js's compiled react-dom CJS files to add back APIs removed in React 19:
 * - findDOMNode (used by @arco-design/web-react, easy-email-extensions)
 * - render + unmountComponentAtNode (used by some older components)
 *
 * Patches BOTH production and development CJS bundles, which use the
 * `exports.xxx = ...` pattern. The parent index.js does
 * `module.exports = require('./cjs/react-dom.production.js')`, so the
 * exports we add to the CJS file ARE the final module.exports.
 *
 * Run once after install: node scripts/patch-react-dom.js
 * Also run as "postinstall" script in package.json.
 */

const fs = require("fs");
const path = require("path");

const SHIM = `

// ---- Compatibility shim for React 19 (added by scripts/patch-react-dom.js) ----
// React 19 removed findDOMNode, render, unmountComponentAtNode.
// @arco-design/web-react and easy-email-extensions still use them.
exports.__findDOMNode_patched__ = true;

exports.findDOMNode = function findDOMNode(componentOrElement) {
  if (componentOrElement == null) return null;
  // Already a DOM node
  if (componentOrElement.nodeType) return componentOrElement;
  // Class component instance — traverse fiber tree to find first host node
  var fiber = componentOrElement._reactInternals || componentOrElement._reactInternalInstance;
  if (fiber) {
    var node = fiber;
    while (node) {
      if (node.tag === 5 || node.tag === 6) return node.stateNode; // HostComponent or HostText
      if (node.child) { node = node.child; continue; }
      while (node && !node.sibling) { node = node.return; }
      if (node) node = node.sibling;
    }
  }
  return null;
};

exports.render = function render(element, container, callback) {
  var client;
  try { client = require('react-dom/client'); } catch(e) {
    client = require('./react-dom-client.production.js');
  }
  var root = container.__legacyRoot;
  if (!root) {
    root = client.createRoot(container);
    container.__legacyRoot = root;
  }
  root.render(element);
  if (typeof callback === 'function') Promise.resolve().then(callback);
};

exports.unmountComponentAtNode = function unmountComponentAtNode(container) {
  var root = container.__legacyRoot;
  if (root) {
    root.unmount();
    container.__legacyRoot = null;
    return true;
  }
  return false;
};
// ---- End compatibility shim ----
`;

const REACT_DOM_DIR = path.resolve(
  __dirname,
  "../node_modules/next/dist/compiled/react-dom/cjs",
);

const filesToPatch = ["react-dom.production.js", "react-dom.development.js"];

let patchedCount = 0;
for (const file of filesToPatch) {
  const filePath = path.join(REACT_DOM_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.log(`[patch-react-dom] Skipping (not found): ${file}`);
    continue;
  }
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes("__findDOMNode_patched__")) {
    console.log(`[patch-react-dom] Already patched: ${file}`);
    continue;
  }

  // For the development file, inject before the IIFE closing
  // For the production file, just append
  if (file.includes("development")) {
    // Dev file wraps everything in an IIFE: (function() { ... })();
    // We need to inject before the closing })();
    const closingIdx = content.lastIndexOf("})();");
    if (closingIdx !== -1) {
      const patched =
        content.substring(0, closingIdx) +
        SHIM +
        "\n" +
        content.substring(closingIdx);
      fs.writeFileSync(filePath, patched, "utf8");
    } else {
      // Fallback: just append
      fs.writeFileSync(filePath, content + SHIM, "utf8");
    }
  } else {
    fs.writeFileSync(filePath, content + SHIM, "utf8");
  }
  patchedCount++;
  console.log(`[patch-react-dom] Patched: ${file}`);
}

// Also clean up the old index.js patch if present
const indexPath = path.resolve(REACT_DOM_DIR, "../index.js");
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, "utf8");
  if (indexContent.includes("__findDOMNode_patched__")) {
    // Remove the old appended shim from index.js
    const marker = "\n// ---- Compatibility shim for React 19";
    const idx = indexContent.indexOf(marker);
    if (idx !== -1) {
      fs.writeFileSync(indexPath, indexContent.substring(0, idx), "utf8");
      console.log("[patch-react-dom] Cleaned up old index.js patch");
    }
  }
}

if (patchedCount > 0) {
  console.log(`[patch-react-dom] Done! Patched ${patchedCount} file(s).`);
} else {
  console.log("[patch-react-dom] No files needed patching.");
}
