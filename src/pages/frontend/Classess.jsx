import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClasses,
  addClass,
  deleteClass,
  fetchClassById,
} from "../../store/slices/classSlice";
import { FaPlus, FaTrash, FaEye, FaPrint } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ClassPrint from "../components/ClassPrint";

const Classess = () => {
  const dispatch = useDispatch();
  const { classes, selectedClass, loading } = useSelector(
    (state) => state.classes
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classDetailsModal, setClassDetailsModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    grade: "",
    section: "",
    roomNumber: "",
    inCharge: "",
  });

  useEffect(() => {
    dispatch(fetchClasses());
  }, [dispatch]);

  const handleAddClass = () => {
    dispatch(addClass(formData));
    setIsModalOpen(false);
    setFormData({
      grade: "",
      section: "",
      roomNumber: "",
      inCharge: "",
    });
  };

  const handleDeleteClass = () => {
    dispatch(deleteClass(deleteId));
    setDeleteModal(false);
  };

  const handleViewClass = (id) => {
    dispatch(fetchClassById(id)).then(() => {
      setClassDetailsModal(true);
    });
  };
  const handlePrint = () => {
    if (!selectedClass) {
      console.error("No selected class data to print");
      return;
    }

    // Create a hidden div for printing
    const printContainer = document.createElement("div");
    printContainer.style.position = "fixed";
    printContainer.style.left = "-1000px";
    printContainer.style.top = "0";
    printContainer.id = "print-container";
    document.body.appendChild(printContainer);

    // Render the component to the hidden div
    const root = createRoot(printContainer);
    root.render(<ClassPrint classData={selectedClass} />);

    // Wait for content to render
    setTimeout(() => {
      // Get the HTML content
      const printContent = document.getElementById("print-container").innerHTML;

      // Remove the temporary container
      document.body.removeChild(printContainer);

      // Create print styles
      const printStyles = `
        <style>
          @page {
            size: A4;
            margin: 0;
          }
          body {
            width: 210mm;
            height: 297mm;
            margin: 0 !important;
            padding: 0 !important;
            font-family: Arial, sans-serif;
          }
          table {
            width: 100% !important;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #000;
            padding: 5px;
          }
        </style>
      `;

      // Open print dialog directly
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Class Details - ${selectedClass.grade} ${selectedClass.section}</title>
            ${printStyles}
          </head>
          <body>
            ${printContent}
            <script>
              // Automatically trigger print when content loads
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* Main content */}
      <div className="main-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Classes</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-gradient-to-r from-[#6F1F64] to-[#8B2D7F] text-white px-6 py-3 rounded-lg shadow-lg hover:from-[#8B2D7F] hover:to-[#6F1F64] transition-all"
          >
            <FaPlus className="mr-2" />
            Add Class
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="flex justify-center col-span-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6F1F64]"></div>
            </div>
          ) : (
            classes.map((cls, index) => (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  Grade: {cls.grade}
                </h3>
                <p className="text-gray-600">Section: {cls.section}</p>
                <p className="text-gray-600">Room: {cls.roomNumber}</p>
                <p className="text-gray-600">In-charge: {cls.inCharge}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleViewClass(cls._id)}
                    className="flex items-center bg-gradient-to-r from-green-400 to-blue-500 text-white px-3 py-1 rounded-lg hover:from-green-500 hover:to-blue-600 transition-all"
                  >
                    <FaEye className="mr-2" />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setDeleteId(cls._id);
                      setDeleteModal(true);
                    }}
                    className="flex items-center bg-gradient-to-r from-red-400 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-red-500 hover:to-pink-600 transition-all"
                  >
                    <FaTrash className="mr-2" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Add Class Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Add Class
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddClass();
                  }}
                >
                  <div className="mb-4">
                    <label className="block text-gray-700">Grade</label>
                    <input
                      type="text"
                      placeholder="Enter Grade"
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F1F64]"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Section</label>
                    <input
                      type="text"
                      placeholder="Enter Section"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F1F64]"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">Room Number</label>
                    <input
                      type="text"
                      placeholder="Enter Room Number"
                      value={formData.roomNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, roomNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F1F64]"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700">
                      In-charge Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter In-charge Name"
                      value={formData.inCharge}
                      onChange={(e) =>
                        setFormData({ ...formData, inCharge: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F1F64]"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-[#6F1F64] to-[#8B2D7F] text-white rounded-lg hover:from-[#8B2D7F] hover:to-[#6F1F64] transition-all"
                    >
                      Add Class
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Details Modal */}
        <AnimatePresence>
          {classDetailsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl modal-content"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Class Details
                </h2>
                {loading ? (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6F1F64]"></div>
                  </div>
                ) : selectedClass ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <strong>Grade:</strong> {selectedClass.grade}
                        </p>
                        <p className="text-gray-700">
                          <strong>Section:</strong> {selectedClass.section}
                        </p>
                        <p className="text-gray-700">
                          <strong>Room Number:</strong>{" "}
                          {selectedClass.roomNumber}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <strong>In-charge:</strong> {selectedClass.inCharge}
                        </p>
                        <p className="text-gray-700">
                          <strong>Total Students:</strong>{" "}
                          {selectedClass.students?.length || 0}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      Students List:
                    </h3>

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Roll No
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Gender
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedClass.students &&
                          selectedClass.students.length > 0 ? (
                            selectedClass.students.map((student) => (
                              <tr key={student._id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {student.rollNumber || "N/A"}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {student.studentId}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {student.name}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {student.gender}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan="4"
                                className="px-4 py-4 text-center text-sm text-gray-500"
                              >
                                No students found in this class
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-700">No class details available.</p>
                )}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-lg hover:from-blue-500 hover:to-cyan-600 transition-all"
                  >
                    <FaPrint className="mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => setClassDetailsModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
              >
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Confirm Delete
                </h2>
                <p className="text-gray-700">
                  Are you sure you want to delete this class?
                </p>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setDeleteModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClass}
                    className="px-4 py-2 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Classess;
