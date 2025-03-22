import { FaUser } from "react-icons/fa";

export default function RequestCard({ request, className }) {
    return (
        <div className={`relative block overflow-hidden rounded-lg border border-gray-100 p-4 sm:p-6 lg:p-8 bg-white shadow-sm ${className}`}>
        <span
          className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-r from-green-300 via-blue-500 to-purple-600"
        ></span>

        <div className="sm:flex sm:justify-between sm:gap-4">
          <div className="flex items-center">
            {/* TODO Image or placeholder*/}
            <div className=" mr-4 size-16 rounded-lg bg-blue-200 text-gray-700 flex items-center justify-center">
              <FaUser className="text-white w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#191919] sm:text-xl">
                Demande de rôle : Décisionnaire
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-600">John Doe - 20 Mars 2025</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-pretty text-gray-500">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. At velit illum provident a, ipsa
            maiores deleniti consectetur nobis et eaque.
          </p>
        </div>
        <div className="flex items-center mt-4">
          <button className="text-white text-sm font-medium bg-blue-500 px-2 py-1 rounded-lg hover:opacity-90 mr-4">Accepter</button>
          <button className="text-white text-sm font-medium bg-red-500 px-2 py-1 rounded-lg hover:opacity-90">Refuser</button>
        </div>
        {/* #Notif */}
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 rounded-tr-lg rounded-bl-lg text-xs font-semibold">
          5
        </div>
      </div>
    );
}