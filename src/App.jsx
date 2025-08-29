// App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function App() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [students, setStudents] = useState([]);
  const [step, setStep] = useState(1);
  const [sundayAttendance, setSundayAttendance] = useState([]);
  const [pilgrimAttendance, setpilgrimAttendance] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState("");
  const [missedMembers, setmissedMembers] = useState("");
  const [visitors, setVisitors] = useState("");
  const [feedback, setfeedback] = useState("");

  const groupNameMap = {
    "1 약속들": "약속들 🤙🏻",
    "2 향기들": "향기들 💐",
    "3 사자들": "사자들 🦁",
    "4 복음들": "복음들 🔊",
    "5 부흥들": "부흥들 🔥",
    "6 초대들": "초대들 💌",
    "7 마음들": "마음들 🍃",
  };
  const classNameMap = groupNameMap;

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
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("group_id", selectedGroup.id);
      if (error) console.error(error);
      else setClasses(data);
    }
    fetchClasses();
  }, [selectedGroup]);

  // 학생 가져오기
  useEffect(() => {
    if (!selectedLeader) return;
    async function fetchStudents() {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", selectedLeader.id);
      if (error) console.error(error);
      else setStudents(data);
    }
    fetchStudents();
  }, [selectedLeader]);

  // 출석 저장
  const saveAttendance = async () => {
    const today = new Date().toISOString().split("T")[0];
    const records = students.map((s) => ({
      date: today,
      group_name: selectedGroup.name,
      leader: selectedLeader.name,
      student_name: s.name,
      sunday_service_attendance: sundayAttendance.includes(s.id) ? 1 : 0,
      pilgrim_attendance: pilgrimAttendance.includes(s.id) ? 1 : 0,
      online_member_names: onlineMembers,
      missed_members_names: missedMembers,
      visitor_names: visitors,
      feedback: feedback,
    }));

    const { error } = await supabase.from("attendance").insert(records);
    if (error) alert("저장 실패: " + error.message);
    else setStep(7); // 제출 완료 화면으로 이동
  };

  // 아이콘 컴포넌트
  const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
  );
  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  );

  return (
    <div className="app-container">
      <div className="card-wrapper">
        <h1 className="main-title">2025-2 필그림 출석부 📝</h1>

        {/* STEP 1: 그룹 선택 */}
        {step === 1 && (
          <div className="card">
            <h2>1️⃣ 소속 들을 선택해주세요.</h2>
            <div className="btn-group">
              {groups.map((g) => (
                <button key={g.id} className="btn btn-primary" onClick={() => { setSelectedGroup(g); setStep(2); }}>
                  {groupNameMap[g.name] || g.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: 반 선택 */}
        {step === 2 && (
          <div className="card">
            <h2>2️⃣ 리더님의 이름을 선택해주세요.</h2>
            <div className="btn-group">
              {classes.map((c) => (
                <button key={c.id} className="btn btn-primary" onClick={() => { setSelectedLeader(c); setStep(3); }}>
                  {classNameMap[c.name] || c.name}
                </button>
              ))}
            </div>
            <br></br>
            <button className="btn btn-secondary" onClick={() => setStep(1)}><BackIcon /> 뒤로가기</button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card">
            <h2>3️⃣ [사랑의교회 주일예배] 참석한 지체들의 이름을 선택해주세요.</h2>
            <p>✔️ 현장 참석만 포함입니다!<br></br>✔️ 타교회 예배에 참석한 경우는 해당되지 않습니다.<br></br>✔️ 참석인원이 없을 경우 반드시 '기타' 항목을 선택하여 '없음'을 작성해주세요.</p>
            {students.map((s) => (
              <label key={s.id} className="ios-checkbox">
                <input type="checkbox" checked={sundayAttendance.includes(s.id)} onChange={() => { setSundayAttendance(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]); }} />
                <span className="checkmark"></span>
                {s.name}
              </label>
            ))}
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(2)}><BackIcon /> 뒤로가기</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>다음</button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="card">
            <h2>4️⃣ [대학5부 필그림 집회] 참석한 지체들의 이름을 선택해주세요.</h2>
            <p>✔️ 현장 참석 + 온라인 모두 포함입니다!<br></br>✔️ 지각 또는 조퇴 모두 동일하게 출석으로 선택해주세요.<br></br>✔️ 참석인원이 없을 경우 반드시 '기타' 항목을 선택하여 '없음'을 작성해주세요.</p>
            {students.map((s) => (
              <label key={s.id} className="ios-checkbox">
                <input type="checkbox" checked={pilgrimAttendance.includes(s.id)} onChange={() => { setpilgrimAttendance(prev => prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]); }} />
                <span className="checkmark"></span>
                {s.name}
              </label>
            ))}
            <label>💻 위 질문에서 선택한 지체들 중 대학부 집회를 [온라인]으로 참석한 지체가 있다면, 해당 지체의 이름을 작성해주세요. </label>
            <input className="ios-input" type="text" value={onlineMembers} onChange={(e) => setOnlineMembers(e.target.value)} />
            <label>❎ 재라인업 및 등반 등의 사유로 위 문항의 선택지에 없는 지체가 있다면 기입해주세요. </label>
            <p>✔️ 작성 양식 : 재라인업 신예현 or 등반 신예현</p>
            <input className="ios-input" type="text" value={missedMembers} onChange={(e) => setmissedMembers(e.target.value)} />
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(3)}><BackIcon /> 뒤로가기</button>
              <button className="btn btn-primary" onClick={() => setStep(5)}>다음</button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="card">
            <h2>5️⃣ 방문자가 있다면 아래 양식에 맞추어 기입해주세요.</h2>
            <p>✔️ 새가족 등록은 하지 않았지만, 샘 모임 또는 필그림 집회에 방문한 사람을 말합니다.<br></br>✔️ 작성 양식) 방문자 신예현 / 인도자 이재원</p>
            <input className="ios-input" type="text" value={visitors} onChange={(e) => setVisitors(e.target.value)} />
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(4)}><BackIcon /> 뒤로가기</button>
              <button className="btn btn-primary" onClick={() => setStep(6)}>다음</button>
            </div>
          </div>
        )}

        {/* STEP 6 (마지막) */}
        {step === 6 && (
          <div className="card">
            <h2>집회 관련 피드백 및 하고 싶은 말이 있으시다면, 여기에 적어주세요!</h2>
            <p>이번 한 주도 하나님의 은혜가 가득하기를 간절히 소망합니다, 사랑하고 축복합니다 🧡</p>
            <input className="ios-input" type="text" value={feedback} onChange={(e) => setfeedback(e.target.value)} />
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(5)}><BackIcon /> 뒤로가기</button>
              <button className="btn btn-primary" onClick={saveAttendance}><CheckIcon /> 제출</button>
            </div>
          </div>
        )}


        {/* STEP 7: 제출 완료 화면 */}
        {step === 7 && (
          <div className="card">
            <h2>✅ 출석 제출이 완료되었습니다!</h2>
            <button className="btn btn-primary complete-btn" onClick={() => window.location.reload()}>
              처음으로 돌아가기
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
