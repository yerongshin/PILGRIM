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

  /* ===== 날짜 생성 (2026.03.01 ~ 2026.08.30) ===== */
  const sundayDates = [];
  const start = new Date("2026-03-01");
  const end = new Date("2026-08-30");
  const d = new Date(start);

  while (d <= end) {
    sundayDates.push(d.toISOString().split("T")[0]);
    d.setDate(d.getDate() + 7);
  }

  /* ===== 오늘 기준 가장 최근 일요일 자동 선택 ===== */
  useEffect(() => {
    const today = new Date();
    const pastSundays = sundayDates.filter(
      (date) => new Date(date) <= today
    );

    if (pastSundays.length > 0) {
      setSelectedDate(pastSundays[pastSundays.length - 1]);
    } else if (sundayDates.length > 0) {
      setSelectedDate(sundayDates[0]);
    }
  }, []);

  /* ===== 그룹 & 반 데이터 ===== */
  useEffect(() => {
    async function fetchData() {
      const { data: groupData } = await supabase.from("groups").select("*");
      const { data: classData } = await supabase.from("classes").select("*");

      setGroups(groupData || []);
      setClasses(classData || []);
    }
    fetchData();
  }, []);

  /* ===== 출석 데이터 ===== */
  useEffect(() => {
    if (!selectedDate) return;

    async function fetchAttendance() {
      const startDate = new Date(selectedDate);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 5);

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
  <div className="admin-page">
    <div className="admin-wrapper">

      <h2 className="admin-title">📝 출석 제출 현황</h2>

      <div className="date-picker">
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {sundayDates.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="group-grid">
        {groups
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "ko"))
          .map((group) => {
            const groupClasses = classes
              .filter((cls) => cls.group_id === group.id)
              .sort((a, b) => a.name.localeCompare(b.name, "ko"));

            if (groupClasses.length === 0) return null;

            return (
              <div key={group.id} className="group-card">
                <h3 className="group-title">
                  {groupNameMap[group.name] || group.name}
                </h3>

                {groupClasses.map((cls) => (
                  <div key={cls.id} className="leader-row">
                    <span>{cls.name}</span>
                    <span
                      className={
                        isSubmitted(cls)
                          ? "status complete"
                          : "status missing"
                      }
                    >
                      {isSubmitted(cls) ? "제출 완료" : "미제출"}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
      </div>

    </div>
  </div>
);
}