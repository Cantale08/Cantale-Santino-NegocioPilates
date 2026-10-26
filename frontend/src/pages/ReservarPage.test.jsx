import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationProvider } from "../context/NotificationContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import * as service from "../services/turnosService.js";
import ReservarPage from "./ReservarPage.jsx";

vi.mock("../services/turnosService.js");

const horario = (claseId, tipo, fecha, disponibles) => ({
    claseId, tipo, dia: "martes", horario: "09:00", instructorId: 1, fecha,
    fechaHora: `${fecha}T09:00`, cupoMaximo: 2, reservados: 2 - disponibles, disponibles
});
const horarios = [
    horario(1, "Reformer", "2026-10-27", 1),
    horario(2, "Mat", "2026-10-27", 0),
    horario(1, "Reformer", "2026-11-03", 2)
];
const cliente = { id: 1, nombre: "Ana", rol: "cliente" };

function renderPage(usuario = cliente) {
    return render(
        <MemoryRouter>
            <NotificationProvider>
                <AuthContext.Provider value={{ usuario }}>
                    <ReservarPage />
                </AuthContext.Provider>
            </NotificationProvider>
        </MemoryRouter>
    );
}

beforeEach(() => {
    service.getDisponibilidad.mockResolvedValue(horarios);
    service.getMisTurnos.mockResolvedValue([]);
});

describe("ReservarPage", () => {
    it("lista los horarios con sus cupos y deshabilita las clases completas", async () => {
        renderPage();

        expect(await screen.findAllByText("Martes 27/10 · 09:00 hs")).toHaveLength(2);
        expect(screen.getByText(/1 lugar disponible/)).toBeInTheDocument();
        expect(screen.getByText(/Clase completa/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Reservar Mat/ })).toBeDisabled();
    });

    it("reserva una clase tras confirmar y muestra la confirmación", async () => {
        const user = userEvent.setup();
        service.reservarTurno.mockResolvedValue({ id: 1 });
        renderPage();

        await user.click(await screen.findByRole("button", { name: /Reservar Reformer, Martes 27\/10/ }));
        await user.click(within(screen.getByRole("dialog", { hidden: true })).getByRole("button", { name: "Sí, reservar" }));

        expect(service.reservarTurno).toHaveBeenCalledWith(1, "2026-10-27");
        expect(await screen.findByText("¡Reserva confirmada!", { selector: "strong" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Ver mis turnos" })).toHaveAttribute("href", "/mis-turnos");
        expect(service.getDisponibilidad).toHaveBeenCalledTimes(2);
    });

    it("muestra el error del backend cuando la reserva es rechazada", async () => {
        const user = userEvent.setup();
        service.reservarTurno.mockRejectedValue(new Error("La clase no tiene cupos disponibles para esa fecha."));
        renderPage();

        await user.click(await screen.findByRole("button", { name: /Reservar Reformer, Martes 27\/10/ }));
        await user.click(within(screen.getByRole("dialog", { hidden: true })).getByRole("button", { name: "Sí, reservar" }));

        expect(await screen.findByText("La clase no tiene cupos disponibles para esa fecha.")).toBeInTheDocument();
    });

    it("marca los turnos ya reservados por el cliente", async () => {
        service.getMisTurnos.mockResolvedValue([
            { id: 1, claseId: 1, fechaHora: "2026-10-27T09:00", vigente: true }
        ]);
        renderPage();

        expect(await screen.findByText("Ya reservaste esta clase")).toBeInTheDocument();
    });

    it("pide iniciar sesión a los visitantes y no consulta turnos", async () => {
        renderPage(null);

        expect(await screen.findAllByRole("link", { name: "Ingresá para reservar" })).toHaveLength(3);
        expect(service.getMisTurnos).not.toHaveBeenCalled();
    });
});
