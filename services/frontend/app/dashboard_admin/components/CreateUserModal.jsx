export default function CreateUserModal({ onClose }) {
    return (
        <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-bold text-black" id="modal-title">Créer un utilisateur</h3>
                    <div>
                    <div className="mt-1">
                        <p className="text-sm text-gray-500">
                            Veuillez remplir les informations suivantes pour créer un nouvel utilisateur.
                        </p>
                    </div>

                    <div className="flex flex-row mt-4 w-full">
                        <div className="w-1/2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                            <div className="mt-1">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="Doe"
                                className="p-2 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400"
                            />
                            </div>
                        </div>
                        <div className="w-1/2 ml-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Prenom</label>
                            <div className="mt-1">
                            <input
                                type="text"
                                name="name"
                                id="name"
                                placeholder="John"
                                className="p-2 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400"
                            />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1">
                        <input 
                            type="text" 
                            name="email" 
                            id="email" 
                            placeholder="exemple@abc.fr"
                            className="p-2 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400" 
                        />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Mot de passe</label>
                        <div className="mt-1">
                        <input 
                            type="password" 
                            name="password" 
                            id="password" 
                            placeholder="Mot de pass"
                            className="p-2 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400" 
                        />
                        </div>
                    </div>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Confirmer le mot de passe"
                            className="p-2 outline-none text-black shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md placeholder-gray-400"
                        />
                    </div>
                    <div className="mt-4">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rôle</label>
                        <div className="mt-1">
                        <select 
                            id="role" 
                            name="role" 
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
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                    type="button" 
                    className="
                    w-full inline-flex justify-center 
                    rounded-md border border-transparent 
                    shadow-sm 
                    px-4 py-2 
                    bg-blue-600 
                    text-base font-medium text-white 
                    hover:bg-blue-700 
                    focus:outline-none  
                    sm:ml-3 sm:w-auto sm:text-sm"
                >
                Créer
                </button>
                <button 
                    type="button" 
                    className="
                    mt-3 
                    w-full inline-flex justify-center 
                    rounded-md border border-gray-300 
                    shadow-sm 
                    px-4 py-2 
                    bg-white 
                    text-base font-medium text-gray-700 
                    hover:bg-gray-200 
                    focus:outline-none 
                    sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={ onClose}
                >
                Annuler
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}