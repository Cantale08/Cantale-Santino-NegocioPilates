import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { NotificationProvider } from "../context/NotificationContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import LoginPage from "./LoginPage.jsx";

function renderPage(login) {
    return render(
        <MemoryRouter>
            <NotificationProvider>
                <AuthContext.Provider value={{ usuario: null, login }}>
                    <LoginPage />
                </AuthContext.Provider>
            </NotificationProvider>
        </MemoryRouter>
    );
}

describe("LoginPage", () => {
    it("valida los campos antes de enviar", async () => {
        const login = vi.fn();
        const user = userEvent.setup();
        renderPage(login);

        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(screen.getByText("Ingresá un email válido.")).toBeInTheDocument();
        expect(screen.getByText("Ingresá tu contraseña.")).toBeInTheDocument();
        expect(login).not.toHaveBeenCalled();
    });

    it("envía las credenciales y notifica el éxito", async () => {
        const login = vi.fn().mockResolvedValue({ nombre: "Ana" });
        const user = userEvent.setup();
        renderPage(login);

        await user.type(screen.getByLabelText("Email"), "ana@mail.com");
        await user.type(screen.getByLabelText("Contraseña"), "secreta123");
        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(login).toHaveBeenCalledWith({ email: "ana@mail.com", contrasenia: "secreta123" });
        expect(await screen.findByText(/Iniciaste sesión correctamente/)).toBeInTheDocument();
    });

    it("muestra el mensaje del backend cuando las credenciales son incorrectas", async () => {
        const login = vi.fn().mockRejectedValue(new Error("El email o la contraseña son incorrectos."));
        const user = userEvent.setup();
        renderPage(login);

        await user.type(screen.getByLabelText("Email"), "ana@mail.com");
        await user.type(screen.getByLabelText("Contraseña"), "mala");
        await user.click(screen.getByRole("button", { name: "Ingresar" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("El email o la contraseña son incorrectos.");
    });
});
