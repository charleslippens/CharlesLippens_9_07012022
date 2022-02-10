import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document;
		this.onNavigate = onNavigate;
		this.store = store;
		const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
		formNewBill.addEventListener("submit", this.handleSubmit);
		const file = this.document.querySelector(`input[data-testid="file"]`);
		file.addEventListener("change", this.handleChangeFile);
		this.fileUrl = null;
		this.fileName = null;
		this.billId = null;
		new Logout({ document, localStorage, onNavigate });
	}
	handleChangeFile = (e) => {
		e.preventDefault();
		const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
		// fix: mauvaise extension de fichier image et bug d'affichage sur le titre du fichier
		// Vérification du format des images ajoutés
		const extensionCheck = /(png|jpg|jpeg)/g;
		const extension = file.name.split(".").pop();

		// Si l'extension est valide alors on accepte et ajoute le classe hideErrorMessage
		// Sinon on vide l'entrée et supprime la classe hideErrorMessage qui montrera le message d'erreur
		if (extension.toLowerCase().match(extensionCheck)) {
			document.getElementById("errorFileType").classList.add("hideErrorMessage");
			const filePath = e.target.value.split(/\\/g);
			const fileName = filePath[filePath.length - 1];
			const formData = new FormData();
			const email = JSON.parse(localStorage.getItem("user")).email;
			formData.append("file", file);
			formData.append("email", email);
			this.store
				.bills()
				.create({
					data: formData,
					headers: {
						noContentType: true,
					},
				})
				.then(({ fileUrl, key }) => {
					console.log(fileUrl);
					this.billId = key;
					this.fileUrl = fileUrl;
					this.fileName = fileName;
				})
				.catch((error) => console.error(error));
		} else {
			document.getElementById("errorFileType").classList.remove("hideErrorMessage");
			this.document.querySelector(`input[data-testid='file']`).value = null;
		}
	};
	handleSubmit = (e) => {
		e.preventDefault();
		console.log(
			'e.target.querySelector(`input[data-testid="datepicker"]`).value',
			e.target.querySelector(`input[data-testid="datepicker"]`).value
		);
		// fix bug affichage titre vide
		// Submit quand la valeur du nom de la dépense est supérieur à 5
		if (e.target.querySelector(`input[data-testid='expense-name']`).value.length > 4) {
			document.getElementById("errorExpenseName").classList.add("hideErrorMessage");
			const email = JSON.parse(localStorage.getItem("user")).email;
			const bill = {
				email,
				type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
				name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
				amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
				date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
				vat: e.target.querySelector(`input[data-testid="vat"]`).value,
				pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
				commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
				fileUrl: this.fileUrl,
				fileName: this.fileName,
				status: "pending",
			};
			this.updateBill(bill);
			this.onNavigate(ROUTES_PATH["Bills"]);
		} else {
			document.getElementById("errorExpenseName").classList.remove("hideErrorMessage");
			this.document.querySelector(`input[data-testid='expense-name']`).value = null;
		}
	};
	// not need to cover this function by tests
	updateBill = (bill) => {
		if (this.store) {
			this.store
				.bills()
				.update({ data: JSON.stringify(bill), selector: this.billId })
				.then(() => {
					this.onNavigate(ROUTES_PATH["Bills"]);
				})
				.catch((error) => console.error(error));
		}
	};
}
