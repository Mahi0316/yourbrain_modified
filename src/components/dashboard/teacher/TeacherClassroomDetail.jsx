import React, { useEffect, useState } from "react";
import API from "../../../api/axiosConfig";
import { User } from "lucide-react";

export default function TeacherClassroomDetails({ classroomId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, [classroomId]);

  async function loadData() {
    try {
      const res = await API.get(`/classrooms/full/${classroomId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!data) return <div>Loading classroom...</div>;

  const students = data.students;

  return (
    <div className="bg-white p-4 rounded-xl shadow mt-4">
      <h2 className="text-lg font-bold">Students in this Classroom</h2>

      {students.length === 0 && (
        <p className="text-gray-500 mt-2">No students have joined yet.</p>
      )}

      {students.map((s) => (
        <div
          key={s._id}
          className="border p-3 rounded-lg mt-3 flex gap-3 items-center"
        >
          <User className="text-indigo-600" />
          <div>
            <div className="font-semibold">{s.name}</div>
            <div className="text-sm text-gray-500">{s.email}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
