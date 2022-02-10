import { screen, fireEvent } from "@testing-library/dom";
import store from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

//test inégration POST
describe("When I navigate to Dashboard employee", () => {
	test("Add a bill from mock API POST", async () => {
		const postSpy = jest.spyOn(store, "post");
		const bill = {
			id: "47qAXb6fIm2zOKkLzMro",
			vat: "80",
			fileUrl:
				"https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
			status: "accepted",
			type: "Hôtel et logement",
			commentAdmin: "ok",
			commentary: "séminaire billed",
			name: "encore",
			fileName: "preview-facture-free-201801-pdf-1.jpg",
			date: "2004-04-04",
			amount: 400,
			email: "a@a",
			pct: 20,
		};
		const bills = await store.post(bill);
		expect(postSpy).toHaveBeenCalledTimes(1);
		expect(bills.data.length).toBe(5);
	});
	test("Add bills from an API and fails with 404 message error", async () => {
		store.post.mockImplementationOnce(() => Promise.reject(new Error("Erreur 404")));
		const html = BillsUI({ error: "Erreur 404" });
		document.body.innerHTML = html;
		const message = await screen.getByText(/Erreur 404/);
		expect(message).toBeTruthy();
	});
	test("Add bill from an API and fails with 500 message error", async () => {
		store.post.mockImplementationOnce(() => Promise.reject(new Error("Erreur 500")));
		const html = BillsUI({ error: "Erreur 500" });
		document.body.innerHTML = html;
		const message = await screen.getByText(/Erreur 500/);
		expect(message).toBeTruthy();
	});
});
