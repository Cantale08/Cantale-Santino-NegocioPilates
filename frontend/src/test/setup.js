import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// jsdom no implementa <dialog> modal ni el desplazamiento de elementos
HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute("open");
};
Element.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

afterEach(() => {
    cleanup();
});
