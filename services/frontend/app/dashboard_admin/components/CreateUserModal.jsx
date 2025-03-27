import React, { useState } from "react";
import { toast } from "react-toastify";

export default function CreateUserModal({ onClose, onUserCreated }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    cpassword: "",
    role: "Utilisateur"
  });

  // State to store error messages for each field
  const [fieldErrorMessages, setFieldErrorMessages] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    cpassword: ""
  });

  // Update form data when input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrorMessages((prev) => ({ ...prev, [name]: "" }));
  };

  // Client side validation
  const validateForm = () => {
    let valid = true;
    const errors = {
      nom: "",
      prenom: "",
      email: "",
      password: "",
      cpassword: ""
    };

    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis.";
      valid = false;
    }
    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis.";
      valid = false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      errors.email = "Veuillez fournir un email valide.";
      valid = false;
    }
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!formData.password || !passwordRegex.test(formData.password)) {
      errors.password =
        "Le mot de passe doit contenir au moins 8 caractères, dont une majuscule, une minuscule et un chiffre.";
      valid = false;
    }
    if (formData.password !== formData.cpassword) {
      errors.cpassword = "Les mots de passe ne correspondent pas.";
      valid = false;
    }

    setFieldErrorMessages(errors);
    if (!valid) {
      toast.error("Veuillez corriger les erreurs indiquées.");
    }
    return valid;
  };

  // Send form data to the backend
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
        console.log("formData", formData);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${backendUrl}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
          password: formData.password,
          role: formData.role
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Utilisateur créé avec succès.");
        if (onUserCreated && data.user) {
          onUserCreated(data.user);
        }
        onClose();
      } else {
        // If the response status is not 2xx, it's an error
        if (data.errors) {
          const newErrors = { nom: "", prenom: "", email: "", password: "", cpassword: "" };
          data.errors.forEach((error) => {
            newErrors[error.param] = error.msg;
          });
          setFieldErrorMessages(newErrors);
          toast.error("Veuillez corriger les erreurs indiquées.");
        } else if (data.error) {
          toast.error(data.error);
        } else {
          toast.error("Erreur lors de la création de l'utilisateur.");
        }
      }
    } catch (error) {
      toast.error("Erreur lors de la communication avec le serveur.");
    }
  };

  // Function to apply different styles based on field errors
  const inputClass = (field) =>
    `text-black p-2 outline-none shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
      fieldErrorMessages[field] ? "border border-red-500" : "border border-gray-300"
    }`;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-bold text-black" id="modal-title">
                  Créer un utilisateur
                </h3>
                <div className="mt-1">
                  <p className="text-sm text-gray-500">
                    Veuillez remplir les informations suivantes pour créer un nouvel utilisateur.
                  </p>
                </div>
                <div className="flex flex-row mt-4 w-full">
                  <div className="w-1/2">
                    <label htmlFor="lname" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="nom"
                        id="lname"
                        placeholder="Doe"
                        value={formData.nom}
                        onChange={handleChange}
                        className={inputClass("nom")}
                      />
                      {fieldErrorMessages.nom && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrorMessages.nom}</p>
                      )}
                    </div>
                  </div>
                  <div className="w-1/2 ml-4">
                    <label htmlFor="fname" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="prenom"
                        id="fname"
                        placeholder="John"
                        value={formData.prenom}
                        onChange={handleChange}
                        className={inputClass("prenom")}
                      />
                      {fieldErrorMessages.prenom && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrorMessages.prenom}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="email"
                      id="email"
                      placeholder="exemple@abc.fr"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass("email")}
                    />
                    {fieldErrorMessages.email && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrorMessages.email}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Mot de passe"
                      value={formData.password}
                      onChange={handleChange}
                      className={inputClass("password")}
                    />
                    {fieldErrorMessages.password && (
                      <p className="text-red-500 text-xs mt-1">{fieldErrorMessages.password}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="password"
                    name="cpassword"
                    id="cpassword"
                    placeholder="Confirmer le mot de passe"
                    value={formData.cpassword}
                    onChange={handleChange}
                    className={inputClass("cpassword")}
                  />
                  {fieldErrorMessages.cpassword && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrorMessages.cpassword}</p>
                  )}
                </div>
                <div className="mt-4">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Rôle
                  </label>
                  <div className="mt-1">
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="p-1 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400 py-2"
                    >
                      <option>Utilisateur</option>
                      <option>Administrateur</option>
                      <option>Décisionnaire</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
