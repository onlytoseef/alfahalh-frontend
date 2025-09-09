import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  fetchTotalStudents,
  deleteStudent,
  updateStudent,
  addStudent,
} from "../../store/slices/studentSlice";
import { fetchClasses } from "../../store/slices/classSlice";
import { FaTrash, FaEdit, FaPlus, FaFilter, FaDownload } from "react-icons/fa";
import { toast, Toaster } from "react-hot-toast";

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-lg shadow-md">
    <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
  </div>
);

const SkeletonTable = () => (
  <div className="overflow-x-auto rounded-lg shadow-md">
    <table className="min-w-full bg-white">
      <thead className="bg-gradient-to-r from-[#6F1F64] to-[#8B2D7F] text-white">
        <tr>
          <th className="px-6 py-3 text-left text-sm font-semibold">
            Roll Number
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Photo</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">
            Guardian
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Gender</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Address</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">
            Class & Section
          </th>
          <th className="px-6 py-3 text-left text-sm font-semibold">QR Code</th>
          <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, index) => (
          <tr
            key={index}
            className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
          >
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
            </td>
            <td className="px-6 py-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-32"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-28"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-36"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="w-10 h-10 bg-gray-200 animate-pulse"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Students = () => {
  const dispatch = useDispatch();
  const { students, totalStudents, status } = useSelector(
    (state) => state.students
  );
  const { classes } = useSelector((state) => state.classes);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [filterClass, setFilterClass] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    guardianName: "",
    classId: "",
    gender: "",
    guardianPhone: "",
    address: "",
    photo: null,
  });

  useEffect(() => {
    dispatch(fetchStudents());
    dispatch(fetchTotalStudents());
    dispatch(fetchClasses());
  }, [dispatch]);

  const filteredStudents = filterClass
    ? students.filter((student) => student.classId?._id === filterClass)
    : students;

  const filteredStudentsCount = filteredStudents.length;

  const handleDelete = async () => {
    try {
      await dispatch(deleteStudent(studentToDelete)).unwrap();
      toast.success("Student deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete student.");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      guardianName: student.guardianName,
      classId: student.classId._id,
      gender: student.gender,
      guardianPhone: student.guardianPhone,
      address: student.address,
      photo: null,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("guardianName", formData.guardianName);
    data.append("classId", formData.classId);
    data.append("gender", formData.gender);
    data.append("guardianPhone", formData.guardianPhone);
    data.append("address", formData.address);
    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      await dispatch(
        updateStudent({ id: editingStudent.studentId, formData: data })
      ).unwrap();
      setIsEditModalOpen(false);
      toast.success("Student updated successfully!");
    } catch (error) {
      toast.error("Failed to update student.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("guardianName", formData.guardianName);
    data.append("classId", formData.classId);
    data.append("gender", formData.gender);
    data.append("guardianPhone", formData.guardianPhone);
    data.append("address", formData.address);
    if (formData.photo) {
      data.append("photo", formData.photo);
    }

    try {
      await dispatch(addStudent(data)).unwrap();
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        guardianName: "",
        classId: "",
        gender: "",
        guardianPhone: "",
        address: "",
        photo: null,
      });
      toast.success("Student added successfully!");
    } catch (error) {
      toast.error("Failed to add student.");
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const openDeleteModal = (id) => {
    setStudentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      <Toaster />
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-8xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Manage Students
        </h1>

        {status === "loading" ? (
          <>
            <div className="flex flex-wrap gap-4 justify-between mb-6">
              <SkeletonCard />
              <div className="flex gap-4">
                <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <SkeletonTable />
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 justify-between mb-6">
              <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-center">
                <p className="text-lg font-bold text-blue-600">
                  {filterClass
                    ? `Total Students: ${filteredStudentsCount}`
                    : `Total Students: ${totalStudents}`}
                </p>
              </div>

              <div className="flex gap-4">
                <select
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Filter by Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
                <button
                  onClick={openAddModal}
                  className="flex items-center bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-green-500 hover:to-blue-600 transition-all"
                >
                  <FaPlus className="mr-2" />
                  Add Student
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg shadow-md">
              <table className="min-w-full bg-white">
                <thead className="bg-gradient-to-r from-[#6F1F64] to-[#8B2D7F] text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Roll Number
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Photo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Guardian
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Class & Section
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      QR Code
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr
                      key={student.studentId}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100 transition-all`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {student.rollNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <img
                          src={
                            student.photo
                              ? `http://localhost:5000${student.photo}`
                              : "https://via.placeholder.com/50"
                          }
                          alt="Student"
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-semibold">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {student.guardianName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full ${
                            student.gender === "Male"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {student.guardianPhone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {student.address}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {student.classId ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {student.classId.grade} - {student.classId.section}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex flex-col items-center">
                          <img
                            src={
                              student.qrCode
                                ? `http://localhost:5000${student.qrCode}`
                                : "https://via.placeholder.com/50"
                            }
                            alt="QR Code"
                            className="w-10 h-10"
                          />
                          <a
                            href={`http://localhost:5000${student.qrCode}`}
                            download={`${student.qrCode.split("/").pop()}`}
                            className="text-blue-500 hover:text-blue-700 mt-2"
                          >
                            <FaDownload />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                            onClick={() => handleEdit(student)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                            onClick={() => openDeleteModal(student.studentId)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Add Student
            </h2>
            <form onSubmit={handleAdd}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Guardian Name</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={(e) =>
                    setFormData({ ...formData, guardianName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Class</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Guardian Phone</label>
                <input
                  type="text"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardianPhone: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Photo</label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Edit Student
            </h2>
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Guardian Name</label>
                <input
                  type="text"
                  name="guardianName"
                  value={formData.guardianName}
                  onChange={(e) =>
                    setFormData({ ...formData, guardianName: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Class</label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.grade} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Gender</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className="mr-2"
                    />
                    Male
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      required
                      className="mr-2"
                    />
                    Female
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Guardian Phone</label>
                <input
                  type="text"
                  name="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      guardianPhone: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700">Photo</label>
                <input
                  type="file"
                  name="photo"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Delete Student
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this student?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
