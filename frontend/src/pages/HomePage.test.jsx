import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as service from "../services/clasesService.js";
import HomePage from "./HomePage.jsx";

vi.mock("../services/clasesService.js");

function renderPage() {
    return render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );
}

beforeEach(() => {
    service.getClases.mockResolvedValue([]);
});

describe("HomePage", () => {
    it("mantiene las secciones del boceto y sus imágenes tienen texto alternativo", async () => {
        renderPage();

        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
        for (const nombre of ["Beneficios", "Nuestras clases", "Sobre nosotros"]) {
            expect(screen.getByRole("heading", { level: 2, name: nombre })).toBeInTheDocument();
        }
        expect(screen.getAllByRole("link", { name: "Reservar clase" })[0]).toHaveAttribute("href", "/reservar");
        for (const image of screen.getAllByRole("img")) {
            expect(image).toHaveAttribute("alt");
        }
        await screen.findByText("Todavía no hay clases publicadas");
    });

    it("muestra las clases obtenidas de la API, hasta un máximo de tres", async () => {
        service.getClases.mockResolvedValue(
            ["Reformer", "Mat", "Salto", "Extra"].map((tipo, index) => ({
                id: index + 1, tipo, dia: "lunes", horario: "09:00", cupoMaximo: 8, instructorId: 1
            }))
        );
        renderPage();

        const list = await screen.findByRole("list");
        expect(within(list).getAllByRole("article")).toHaveLength(3);
        expect(within(list).queryByText("Extra")).not.toBeInTheDocument();
        expect(within(list).getAllByText("Lunes · 09:00 hs")).toHaveLength(3);
    });

    it("muestra un mensaje de error si la API no responde", async () => {
        service.getClases.mockRejectedValue(new Error("No se pudo conectar con el servidor."));
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
    });
});
