// AdminAttendanceStatus.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function AdminAttendanceStatus() {
  const [classes, setClasses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [statusList, setStatusList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data: groupsData } = await supabase.from("groups").select("*");
      const { data: classesData } = await supabase.from("classes").select("*");
      setGroups(groupsData || []);
      setClasses(classesData || []);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (classes.length === 0 || groups.length === 0) return;

    async function fetchAttendanceStatus() {
      const today = new Date();
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3);

      const todayISO = today.toISOString().split("T")[0];
      const threeDaysAgoISO = threeDaysAgo.toISOString().split("T")[0];

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", threeDaysAgoISO)
        .lte("date", todayISO);

      const status = classes.map((c) => {
        const submitted = attendanceData.some((a) => a.leader === c.name);
        return {
          className: c.name,
          groupName: groups.find((g) => g.id === c.group_id)?.name || "",
          submitted,
        };
      });

      setStatusList(status);
    }

    fetchAttendanceStatus();
  }, [classes, groups]);

  return (
    <div className="app-container">
      <h1>📝 관리자 모드 - 출석 제출 현황</h1>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>그룹</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>반</th>
            <th style={{ borderBottom: "1px solid #ccc", padding: "8px" }}>제출 상태</th>
          </tr>
        </thead>
        <tbody>
          {statusList.map((s, idx) => (
            <tr key={idx}>
              <td style={{ padding: "8px" }}>{s.groupName}</td>
              <td style={{ padding: "8px" }}>{s.className}</td>
              <td
                style={{
                  padding: "8px",
                  color: s.submitted ? "black" : "red",
                  fontWeight: s.submitted ? "normal" : "bold",
                }}
              >
                {s.submitted ? "제출 완료" : "미제출"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
