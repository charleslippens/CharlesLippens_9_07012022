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
		const fileName = file.name;
		// Nouvelle variable pour vérifier le format de l'image
		const fileInput = this.document.querySelector(`input[data-testid="file"]`);
		const fileAcceptedFormats = ["jpg", "jpeg", "png"];
		const fileNameParts = fileName.split(".");
		const fileExtension = fileNameParts[fileNameParts.length - 1].toLowerCase();
		this.ImgFormatValide = false;
		// Si il y a au moins 2 parties dans le nom du fichier continuer la verification
		if (fileNameParts.length > 1) {
			// verifie si le format de l'image est jpg jped ou png, si vrai met ImgFormatValide à vrai sinon faux
			fileAcceptedFormats.indexOf(fileExtension) !== -1
				? (this.ImgFormatValide = true)
				: (this.ImgFormatValide = false);
		}
		if (!this.ImgFormatValide) {
			// Si le format d'image n'est pas valide
			fileInput.value = ""; // ... supprimer le fichier de l'input
			fileInput.classList.add("is-invalid"); // ... ajouter la class is invalide pour dire à l'utilisateur que c'est invalide
			fileInput.classList.remove("blue-border"); // ... supprime la classe blue-border
			alert(
				"Le format de votre fichier n'est pas pris en charge." +
					"\n" +
					"Seuls les .jpg, .jpeg, .png sont acceptés."
			); // message d'erreur pour l'utilisateur
		} else {
			// Si le format de l'image est valide
			fileInput.classList.remove("is-invalid"); // ... supprimer la classe is valide
			fileInput.classList.add("blue-border"); // ... ajouter la classe border-blue
			const formData = new FormData();
			const email = JSON.parse(localStorage.getItem("user")).email;
			formData.append("file", file);
			formData.append("email", email);
			this.formData = formData; // alors cela peut etre utiliser dans d'autres méthodes
			this.fileName = fileName;
		}
	};
	handleSubmit = (e) => {
		e.preventDefault();
		console.log(
			'e.target.querySelector(`input[data-testid="datepicker"]`).value',
			e.target.querySelector(`input[data-testid="datepicker"]`).value
		);
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
		if (this.ImgFormatValide) {
			//Si le format de l'image est valide
			// Débuter l'upload de l'image et créer une nouvelle facture seulement quand le format de l'image est valide et le formulaire est complet
			this.store
				.bills()
				.create({
					data: this.formData,
					headers: {
						noContentType: true,
					},
				})
				.then(({ fileUrl, key }) => {
					console.log(fileUrl);
					this.billId = key;
					this.fileUrl = fileUrl;
				})
				.then(() => {
					this.updateBill(bill);
				})
				.catch((error) => console.error(error));
		}
	};

	// not need to cover this function by tests
	/* istanbul ignore next */

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
