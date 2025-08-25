import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);

  const [step, setStep] = useState(1); // 화면 단계
  const [sundayAttendance, setSundayAttendance] = useState([]);
  const [collegeAttendance, setCollegeAttendance] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState("");
  const [visitors, setVisitors] = useState("");
  const [otherReason, setOtherReason] = useState("");

  // 그룹 가져오기
  useEffect(() => {
    async function fetchGroups() {
      const { data, error } = await supabase.from("groups").select("*");
      if (error) console.error(error);
      else setGroups(data);
    }
    fetchGroups();
  }, []);

  // 반 가져오기
  useEffect(() => {
    if (!selectedGroup) return;
    async function fetchClasses() {
      const { data, error } = await supabase.from("classes").select("*").eq("group_id", selectedGroup.id);
      if (error) console.error(error);
      else setClasses(data);
    }
    fetchClasses();
  }, [selectedGroup]);

  // 학생 가져오기
  useEffect(() => {
    if (!selectedClass) return;
    async function fetchStudents() {
      const { data, error } = await supabase.from("students").select("*").eq("class_id", selectedClass.id);
      if (error) console.error(error);
      else setStudents(data);
    }
    fetchStudents();
  }, [selectedClass]);

  // 출석 저장
  const saveAttendance = async () => {
    const today = new Date().toISOString().split("T")[0];

    const records = students.map(s => ({
      date: today,
      group_name: selectedGroup.name,
      class_name: selectedClass.name,
      student_name: s.name,
      sunday_service_attendance: sundayAttendance.includes(s.id) ? 1 : 0,
      college_meeting_attendance: collegeAttendance.includes(s.id) ? 1 : 0,
      online_member_names: onlineMembers,
      visitor_names: visitors,
      other_reason: otherReason
    }));

    const { error } = await supabase.from("attendance").insert(records);
    if (error) alert("저장 실패: " + error.message);
    else alert("출석 저장 완료!");
  };

  return (
    <div className="container">
      <h1>출석 관리</h1>

      {/* STEP 1: 그룹 선택 */}
      {step === 1 && (
        <div className="card">
          <h2>그룹 선택</h2>
          <div className="btn-group">
            {groups.map(g => (
              <button key={g.id} className="btn primary" onClick={() => { setSelectedGroup(g); setStep(2); }}>
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: 반 선택 */}
      {step === 2 && (
        <div className="card">
          <h2>반 선택 (그룹: {selectedGroup.name})</h2>
          <div className="btn-group">
            {classes.map(c => (
              <button key={c.id} className="btn primary" onClick={() => { setSelectedClass(c); setStep(3); }}>
                {c.name}
              </button>
            ))}
          </div>
          <button className="btn secondary" onClick={() => setStep(1)}>뒤로가기</button>
        </div>
      )}

      {/* STEP 3: 주일예배 출석 */}
      {step === 3 && (
        <div className="card">
          <h2>주일예배 출석 체크 ({selectedClass.name})</h2>
          {students.map(s => (
            <label key={s.id} className="student-item">
              <input
                type="checkbox"
                checked={sundayAttendance.includes(s.id)}
                onChange={() => {
                  setSundayAttendance(prev =>
                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                  );
                }}
              />
              {s.name}
            </label>
          ))}
          <div className="btn-row">
            <button className="btn primary" onClick={() => setStep(4)}>다음</button>
            <button className="btn secondary" onClick={() => setStep(2)}>뒤로가기</button>
          </div>
        </div>
      )}

      {/* STEP 4: 대학부집회 출석 + 단답형 질문 1 */}
      {step === 4 && (
        <div className="card">
          <h2>대학부집회 출석 체크 + 온라인 지체 작성</h2>
          {students.map(s => (
            <label key={s.id} className="student-item">
              <input
                type="checkbox"
                checked={collegeAttendance.includes(s.id)}
                onChange={() => {
                  setCollegeAttendance(prev =>
                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                  );
                }}
              />
              {s.name}
            </label>
          ))}
          <div>
            <label>온라인으로 드린 지체 이름:</label>
            <input
              type="text"
              value={onlineMembers}
              onChange={e => setOnlineMembers(e.target.value)}
            />
          </div>
          <div className="btn-row">
            <button className="btn primary" onClick={() => setStep(5)}>다음</button>
            <button className="btn secondary" onClick={() => setStep(3)}>뒤로가기</button>
          </div>
        </div>
      )}

      {/* STEP 5: 방문자 단답형 */}
      {step === 5 && (
        <div className="card">
          <h2>6️⃣ 방문자 기록</h2>
          <input
            type="text"
            value={visitors}
            onChange={e => setVisitors(e.target.value)}
          />
          <div className="btn-row">
            <button className="btn primary" onClick={() => setStep(6)}>다음</button>
            <button className="btn secondary" onClick={() => setStep(4)}>뒤로가기</button>
          </div>
        </div>
      )}

      {/* STEP 6: 기타 사유 단답형 + 제출 */}
      {step === 6 && (
        <div className="card">
          <h2>7️⃣ 기타 사유 기록</h2>
          <input
            type="text"
            value={otherReason}
            onChange={e => setOtherReason(e.target.value)}
          />
          <div className="btn-row">
            <button className="btn primary" onClick={saveAttendance}>제출</button>
            <button className="btn secondary" onClick={() => setStep(5)}>뒤로가기</button>
          </div>
        </div>
      )}
    </div>
  );
}
