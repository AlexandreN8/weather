import { motion, AnimatePresence } from 'framer-motion';

export default function RoleChangeModal({ isOpen, onClose, onConfirm, userName, role, actionType }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Oveerlay */}
          <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
          <motion.div
            className="bg-white rounded-lg p-6 z-10 max-w-sm mx-auto"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <h2 className="text-xl font-bold mb-4 text-black">
              Confirmation de changement de rôle
            </h2>
            <p className="mb-4 text-gray-500">
              Voulez-vous {actionType.toLowerCase()} le rôle de{" "}
              <span className="font-bold capitalize">{userName}</span> vers{" "}
              <span className="font-bold">{role}</span> ?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Confirmer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
