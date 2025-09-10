// AdminAttendanceStatus.jsx
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function AdminAttendanceStatus() {
  const [groups, setGroups] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const groupNameMap = {
    "1 약속들": "P 약속들",
    "2 향기들": "I 향기들",
    "3 사자들": "L 사자들",
    "4 복음들": "G 복음들",
    "5 부흥들": "R 부흥들",
    "6 초대들": "I 초대들",
    "7 마음들": "M 마음들",
    "8 새가족들": "♥ 새가족들",
  };

  // 8/31 ~ 2/22 주일 날짜 배열
  const sundayDates = [];
  const start = new Date("2025-08-31");
  const end = new Date("2026-02-22");
  const d = new Date(start);
  while (d <= end) {
    sundayDates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 7);
  }

  useEffect(() => {
    if (sundayDates.length > 0) setSelectedDate(sundayDates[0]);
  }, []);

  // 그룹 & 반 가져오기
  useEffect(() => {
    async function fetchGroupsAndClasses() {
      const { data: groupData } = await supabase.from("groups").select("*");
      setGroups(groupData || []);

      const { data: classData } = await supabase.from("classes").select("*");
      setClasses(classData || []);
    }
    fetchGroupsAndClasses();
  }, []);

  // 출석 데이터 가져오기 (선택 주일 + 3일)
  useEffect(() => {
    if (!selectedDate) return;

    async function fetchAttendance() {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 2); // 일요일 포함 3일간

      const { data } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", startDate.toISOString().split("T")[0])
        .lte("date", endDate.toISOString().split("T")[0]);

      setAttendance(data || []);
    }
    fetchAttendance();
  }, [selectedDate]);

  const isSubmitted = (cls) =>
    attendance.some(
      (a) =>
        a.leader === cls.name &&
        a.group_name === groups.find((g) => g.id === cls.group_id)?.name
    );

  return (
    <div className="app-container" style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
      <div className="card-wrapper" style={{ width: "600px" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h2 style={{ marginBottom: "12px" }}>📝 출석 제출 현황</h2>

          {/* 날짜 선택 드롭다운 */}
          <label style={{ display: "block", margin: "12px 0" }}>
            주일 선택 :{" "}
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="ios-input"
              style={{ padding: "4px 8px", width: "120px" }}
            >
              {sundayDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <table
            className="attendance-table"
            style={{ width: "100%", borderCollapse: "collapse", marginTop: "16px" }}
          >
            <thead>
              <tr>
                <th style={{ color: "#000", borderBottom: "1px solid #ccc", padding: "8px" }}>들</th>
                <th style={{ color: "#000", borderBottom: "1px solid #ccc", padding: "8px" }}>리더</th>
                <th style={{ color: "#000", borderBottom: "1px solid #ccc", padding: "8px" }}>제출 여부</th>
              </tr>
            </thead>
            <tbody>
              {classes
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cls) => {
                  const group = groups.find((g) => g.id === cls.group_id);
                  return (
                    <tr key={cls.id}>
                      <td style={{ color: "#000", padding: "8px" }}>
                        {groupNameMap[group?.name] || group?.name}
                      </td>
                      <td style={{ color: "#000", padding: "8px" }}>{cls.name}</td>
                      <td
                        style={{
                          color: isSubmitted(cls) ? "#000" : "#ff4d4f",
                          fontWeight: "bold",
                          padding: "8px",
                        }}
                      >
                        {isSubmitted(cls) ? "제출 완료" : "미제출"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
