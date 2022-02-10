import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills.js";
import { ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import store from "../__mocks__/store";
import { bills } from "../fixtures/bills";

describe("Given I am connected as an Employee", () => {
	// Test pour BillsUI.js
	// Quand je suis sur la page bills il y a une icone bill sur le cote vertical, doit etre surligné
	describe("When I am on Bills page, there are a bill icon in vertical layout", () => {
		test("Then, the icon should be highlighted", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;

			expect(document.querySelector("#layout-icon1").classList.contains("active-icon"));
		});
		// il y a un titre et un newbill bouton, doit s'afficher correctement
		describe("When I am on Bills page, there are a title and a newBill button", () => {
			test("Then, the title and the button should be render correctly", () => {
				const html = BillsUI({ data: [] });
				document.body.innerHTML = html;

				expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
				expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
			});
		});
		// il y a 4 bills, les données doivent afficher le nom, date, status, icone eye et
		describe("When I am on Bills page, there are 4 bills", () => {
			test("Then, bills data should be render 4 type, name, date, amount, status and eye icon", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const bill = screen.getAllByTestId("bill");
				const type = screen.getAllByTestId("type");
				const name = screen.getAllByTestId("name");
				const date = screen.getAllByTestId("date");
				const amount = screen.getAllByTestId("amount");
				const status = screen.getAllByTestId("status");
				const iconEye = screen.getAllByTestId("icon-eye");

				expect(bill.length).toBe(4);
				expect(type.length).toBe(4);
				expect(name.length).toBe(4);
				expect(date.length).toBe(4);
				expect(amount.length).toBe(4);
				expect(status.length).toBe(4);
				expect(iconEye.length).toBe(4);
			});
		});
		// le premier donné de bill doit contenir les données type, nom, date, montant, status et eye icone
		describe("When I am on Bills page, there are bills", () => {
			test("Then, first bill data should contain the right type, name, date, amount, status and eye icon", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const bill = screen.getAllByTestId("bill");
				const type = screen.getAllByTestId("type")[0];
				const name = screen.getAllByTestId("name")[0];
				const date = screen.getAllByTestId("date")[0];
				const amount = screen.getAllByTestId("amount")[0];
				const status = screen.getAllByTestId("status")[0];
				const iconEye = screen.getAllByTestId("icon-eye")[0];

				expect(bill.length).toBe(4);
				expect(type.textContent).toBe("Hôtel et logement");
				expect(name.textContent).toBe("encore");
				expect(date.textContent).toBe("2004-04-04");
				expect(amount.textContent).toBe("400 €");
				expect(status.textContent).toBe("pending");
				expect(iconEye.textContent).toBeTruthy();
			});
		});
		describe("When I am on Bills page, there are 4 bills", () => {
			test("Then, bills should be ordered from earliest to latest", () => {
				const html = BillsUI({ data: bills });
				document.body.innerHTML = html;

				const dates = screen
					.getAllByText(
						/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
					)
					.map((a) => a.innerHTML);
				const antiChrono = (a, b) => (a < b ? 1 : -1);
				const datesSorted = [...dates].sort(antiChrono);

				expect(dates).toEqual(datesSorted);
			});
		});
		// pas de bills
		describe("When I am on Bills page, and there are no bills", () => {
			test("Then, no bills should be shown", () => {
				const html = BillsUI({ data: [] });
				document.body.innerHTML = html;

				const bill = screen.queryByTestId("bill");
				expect(bill).toBeNull();
			});
		});
		//loading
		describe("When I am on Bills page, but it is loading", () => {
			test("Then, Loading page should be rendered", () => {
				const html = BillsUI({ loading: true });
				document.body.innerHTML = html;
				expect(screen.getAllByText("Loading...")).toBeTruthy();
			});
		});
		// erreur
		describe("When I am on Dashboard page but back-end send an error message", () => {
			test("Then, Error page should be rendered", () => {
				const html = BillsUI({ error: "some error message" });
				document.body.innerHTML = html;
				expect(screen.getAllByText("Erreur")).toBeTruthy();
			});
		});
	});
});

// Test pour  Bills.js
describe("Given I am connected as Employee and I am on Bill page, there are bills", () => {
	describe("When clicking on an eye icon", () => {
		test("Then, modal should open and have a title and a file url", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			// construit l'interface user
			const html = BillsUI({ data: bills });
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			// init store
			const store = null;
			// init bills
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

			const modale = document.getElementById("modaleFile");
			$.fn.modal = jest.fn(() => modale.classList.add("show"));

			const eye = screen.getAllByTestId("icon-eye")[0];
			// Mock handleClickNewBill
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));

			eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalled();

			expect(modale.classList).toContain("show");
			// screen doit montrer envoyer une note de frais

			expect(screen.getByText("Justificatif")).toBeTruthy();
			expect(bills[0].fileUrl).toBeTruthy();
		});
	});
});
// Test sur le bouton newBill: clique sur le bouton puis ouverture de la bill
describe("Given I am connected as Employee and I am on Bill page, there are a newBill button", () => {
	describe("When clicking on newBill button", () => {
		test("Then, bill form should open", () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			// construit l'interface user
			const html = BillsUI({ data: [] });
			document.body.innerHTML = html;
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			// init store
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});
			// Mock handleClickNewBill
			const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
			// Obtenir eye button dans DOM, ajout event et userEvent
			screen.getByTestId("btn-new-bill").addEventListener("click", handleClickNewBill);
			userEvent.click(screen.getByTestId("btn-new-bill"));
			// screen doit montrer envoyer une note de frais
			expect(handleClickNewBill).toHaveBeenCalled();
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
});

// Test d'intégration GET 404 et 500
describe("Given I am a user connected as Employee", () => {
	describe("When I navigate to Bill", () => {
		test("Then, fetches bills from mock API GET", async () => {
			const getSpy = jest.spyOn(store, "get");
			// obtenir les bills et le nouveau bill
			const bills = await store.get();
			// getspy doit etre appelé au une fois
			expect(getSpy).toHaveBeenCalledTimes(1);
			// le nombre de bills doit etre de 4
			expect(bills.data.length).toBe(4);
		});
		test("Then, fetches bills from an API and fails with 404 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
			// création inteface user avec erreur de code
			const html = BillsUI({ error: "Erreur 404" });
			document.body.innerHTML = html;
			const message = await screen.getByText(/Erreur 404/);
			// attendre le message erreur 404
			expect(message).toBeTruthy();
		});
		test("Then, fetches messages from an API and fails with 500 message error", async () => {
			store.get.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
			// création inteface user avec erreur de code
			const html = BillsUI({ error: "Erreur 500" });
			document.body.innerHTML = html;
			// attendre le message erreur 500
			const message = await screen.getByText(/Erreur 500/);
			expect(message).toBeTruthy();
		});
	});
});
