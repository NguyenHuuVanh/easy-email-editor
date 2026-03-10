// React 19 Compatibility Polyfill for legacy libraries
if (typeof window !== "undefined") {
  // Suppress hydration and portal warnings from legacy libraries
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Hydration") ||
        args[0].includes("hydration") ||
        args[0].includes("did not match") ||
        args[0].includes("whitespace text nodes") ||
        args[0].includes("cannot be a child of") ||
        args[0].includes("Target container is not a DOM element") ||
        args[0].includes("removeChild"))
    ) {
      return;
    }
    originalError.apply(console, args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("findDOMNode") || args[0].includes("deprecated"))
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  const OriginalReactDOM = require("react-dom");

  // Store original createPortal
  const originalCreatePortal = OriginalReactDOM.createPortal;

  // Wrap createPortal to handle invalid containers
  OriginalReactDOM.createPortal = function (children, container, key) {
    // Validate container
    if (!container || !container.nodeType) {
      console.warn("Invalid portal container, creating fallback div");
      // Create a fallback container
      if (typeof document !== "undefined") {
        let fallbackContainer = document.getElementById("portal-fallback");
        if (!fallbackContainer) {
          fallbackContainer = document.createElement("div");
          fallbackContainer.id = "portal-fallback";
          fallbackContainer.style.display = "none";
          document.body.appendChild(fallbackContainer);
        }
        container = fallbackContainer;
      } else {
        return null;
      }
    }

    return originalCreatePortal(children, container, key);
  };

  // Polyfill findDOMNode
  if (!OriginalReactDOM.findDOMNode) {
    OriginalReactDOM.findDOMNode = function (componentOrElement) {
      if (!componentOrElement) return null;
      if (componentOrElement.nodeType === 1) return componentOrElement;

      if (componentOrElement._reactInternals) {
        const findHostInstance = (fiber) => {
          if (!fiber) return null;
          if (fiber.tag === 5 && fiber.stateNode) return fiber.stateNode;
          if (fiber.child) {
            const result = findHostInstance(fiber.child);
            if (result) return result;
          }
          if (fiber.sibling) return findHostInstance(fiber.sibling);
          return null;
        };

        const node = findHostInstance(componentOrElement._reactInternals);
        if (node) return node;
      }

      if (componentOrElement.ref?.current) {
        return componentOrElement.ref.current;
      }

      return null;
    };
  }

  // Polyfill render
  if (!OriginalReactDOM.render) {
    const { createRoot } = require("react-dom/client");
    const rootsMap = new WeakMap();

    OriginalReactDOM.render = function (element, container, callback) {
      if (!container || !container.nodeType) {
        console.error("Target container is not a DOM element.");
        return null;
      }

      let root = rootsMap.get(container);
      if (!root) {
        root = createRoot(container);
        rootsMap.set(container, root);
      }

      root.render(element);
      if (callback) setTimeout(callback, 0);

      return {
        unmount: () => {
          try {
            root.unmount();
            rootsMap.delete(container);
          } catch (e) {
            console.warn("Error unmounting:", e);
          }
        },
      };
    };

    OriginalReactDOM.unmountComponentAtNode = function (container) {
      const root = rootsMap.get(container);
      if (root) {
        try {
          root.unmount();
          rootsMap.delete(container);
          return true;
        } catch (e) {
          console.warn("Error unmounting component:", e);
          return false;
        }
      }
      return false;
    };
  }
}
