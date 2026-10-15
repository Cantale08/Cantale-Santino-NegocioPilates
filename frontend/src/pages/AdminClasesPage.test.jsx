import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationProvider } from "../context/NotificationContext.jsx";
import * as service from "../services/clasesService.js";
import AdminClasesPage from "./AdminClasesPage.jsx";

vi.mock("../services/clasesService.js");

const reformer = { id: 1, tipo: "Reformer", dia: "lunes", horario: "09:00", cupoMaximo: 8, instructorId: 1 };
const mat = { id: 2, tipo: "Pilates Mat", dia: "miercoles", horario: "18:30", cupoMaximo: 12, instructorId: 2 };

function renderPage() {
    return render(
        <NotificationProvider>
            <AdminClasesPage />
        </NotificationProvider>
    );
}

async function fillForm(user, values) {
    await user.type(screen.getByLabelText("Tipo de clase"), values.tipo);
    await user.selectOptions(screen.getByLabelText("Día"), values.dia);
    await user.type(screen.getByLabelText("Horario"), values.horario);
    await user.type(screen.getByLabelText("Cupo máximo"), values.cupoMaximo);
    await user.type(screen.getByLabelText("N.º de instructor"), values.instructorId);
}

beforeEach(() => {
    service.getClases.mockResolvedValue([reformer, mat]);
});

describe("AdminClasesPage", () => {
    it("muestra el estado de carga y luego el listado", async () => {
        renderPage();

        expect(screen.getByRole("status")).toHaveTextContent("Cargando clases...");
        const table = await screen.findByRole("table", { name: "Listado de clases cargadas" });
        expect(within(table).getByText("Reformer")).toBeInTheDocument();
        expect(within(table).getByText("Pilates Mat")).toBeInTheDocument();
        expect(within(table).getByText("Miércoles")).toBeInTheDocument();
    });

    it("muestra el error de la API y permite reintentar", async () => {
        const user = userEvent.setup();
        service.getClases.mockRejectedValueOnce(new Error("No se pudo conectar con el servidor."));
        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo conectar con el servidor.");
        await user.click(screen.getByRole("button", { name: "Reintentar" }));
        expect(await screen.findByText("Reformer")).toBeInTheDocument();
        expect(service.getClases).toHaveBeenCalledTimes(2);
    });

    it("muestra un estado vacío cuando no hay clases", async () => {
        service.getClases.mockResolvedValue([]);
        renderPage();

        expect(await screen.findByText("Todavía no hay clases cargadas")).toBeInTheDocument();
    });

    it("valida el formulario sin llamar a la API y enfoca el primer error", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByRole("table");

        await user.click(screen.getByRole("button", { name: "Crear clase" }));

        expect(screen.getByText("Ingresá el tipo de clase.")).toBeInTheDocument();
        expect(screen.getByText("Seleccioná un día.")).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo de clase")).toHaveFocus();
        expect(screen.getByLabelText("Tipo de clase")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Tipo de clase")).toHaveAccessibleDescription("Ingresá el tipo de clase.");
        expect(service.createClase).not.toHaveBeenCalled();
    });

    it("crea una clase, la agrega al listado y notifica el éxito", async () => {
        const user = userEvent.setup();
        service.createClase.mockResolvedValue({
            id: 3, tipo: "Stretching", dia: "martes", horario: "11:15", cupoMaximo: 10, instructorId: 3
        });
        renderPage();
        await screen.findByRole("table");

        await fillForm(user, { tipo: " Stretching ", dia: "martes", horario: "11:15", cupoMaximo: "10", instructorId: "3" });
        await user.click(screen.getByRole("button", { name: "Crear clase" }));

        expect(service.createClase).toHaveBeenCalledWith({
            tipo: "Stretching", dia: "martes", horario: "11:15", cupoMaximo: 10, instructorId: 3
        });
        expect(await screen.findByText("La clase se creó correctamente.")).toBeInTheDocument();
        expect(within(screen.getByRole("table")).getByText("Stretching")).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo de clase")).toHaveValue("");
    });

    it("muestra el mensaje del backend como error y conserva los datos ingresados", async () => {
        const user = userEvent.setup();
        service.createClase.mockRejectedValue(new Error("Ya existe una clase con los mismos datos."));
        renderPage();
        await screen.findByRole("table");

        await fillForm(user, { tipo: "Reformer", dia: "lunes", horario: "09:00", cupoMaximo: "8", instructorId: "1" });
        await user.click(screen.getByRole("button", { name: "Crear clase" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe una clase con los mismos datos.");
        expect(screen.getByLabelText("Tipo de clase")).toHaveValue("Reformer");
    });

    it("edita una clase existente con el formulario precargado", async () => {
        const user = userEvent.setup();
        service.updateClase.mockResolvedValue({ ...reformer, cupoMaximo: 14 });
        renderPage();
        await screen.findByRole("table");

        await user.click(screen.getByRole("button", { name: /^Editar Reformer/ }));
        expect(screen.getByRole("heading", { name: "Editar clase N.º 1" })).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo de clase")).toHaveValue("Reformer");
        expect(screen.getByLabelText("Tipo de clase")).toHaveFocus();

        await user.clear(screen.getByLabelText("Cupo máximo"));
        await user.type(screen.getByLabelText("Cupo máximo"), "14");
        await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

        expect(service.updateClase).toHaveBeenCalledWith(1, expect.objectContaining({ cupoMaximo: 14 }));
        expect(await screen.findByText("La clase se modificó correctamente.")).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Nueva clase" })).toBeInTheDocument();
    });

    it("pide confirmación antes de eliminar y no elimina si se cancela", async () => {
        const user = userEvent.setup();
        renderPage();
        await screen.findByRole("table");

        await user.click(screen.getByRole("button", { name: /^Eliminar Reformer/ }));
        const dialog = screen.getByRole("dialog", { name: "Eliminar clase" });
        expect(dialog).toHaveTextContent("¿Seguro que querés eliminar la clase Reformer");
        expect(within(dialog).getByRole("button", { name: "Cancelar" })).toHaveFocus();

        await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

        expect(service.deleteClase).not.toHaveBeenCalled();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(screen.getByText("Reformer")).toBeInTheDocument();
    });

    it("elimina la clase al confirmar y notifica el éxito", async () => {
        const user = userEvent.setup();
        service.deleteClase.mockResolvedValue(reformer);
        renderPage();
        await screen.findByRole("table");

        await user.click(screen.getByRole("button", { name: /^Eliminar Reformer/ }));
        await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));

        expect(service.deleteClase).toHaveBeenCalledWith(1);
        expect(await screen.findByText("Se eliminó la clase Reformer.")).toBeInTheDocument();
        expect(within(screen.getByRole("table")).queryByText("Reformer")).not.toBeInTheDocument();
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("notifica el error si la eliminación falla y mantiene el registro", async () => {
        const user = userEvent.setup();
        service.deleteClase.mockRejectedValue(new Error("Ocurrió un error interno del servidor."));
        renderPage();
        await screen.findByRole("table");

        await user.click(screen.getByRole("button", { name: /^Eliminar Reformer/ }));
        await user.click(screen.getByRole("button", { name: "Sí, eliminar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Ocurrió un error interno del servidor.");
        expect(within(screen.getByRole("table")).getByText("Reformer")).toBeInTheDocument();
    });
});
