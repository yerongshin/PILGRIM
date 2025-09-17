// App.jsx
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";
import AdminAttendanceStatus from "./AdminAttendanceStatus";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isAdmin = urlParams.get("admin") === "true";

  if (isAdmin) return <AdminAttendanceStatus />;

  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [students, setStudents] = useState([]);
  const [step, setStep] = useState(1);
  const [sundayAttendance, setSundayAttendance] = useState([]);
  const [pilgrimAttendance, setpilgrimAttendance] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState("");
  const [missedMembers, setMissedMembers] = useState("");
  const [visitors, setVisitors] = useState("");
  const [feedback, setFeedback] = useState("");

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
    else setStep(7);
  };

  // 아이콘
  const BackIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );

  const CheckIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const isNewFamily = selectedGroup?.name === "8 새가족들";
  const isOikos = isNewFamily && selectedLeader?.name === "오이코스";

  let totalSteps = 6;
  if (isOikos) totalSteps = 4;
  else if (isNewFamily) totalSteps = 6;

  return (
    <div className="app-container">
      <div className="card-wrapper">
        {/* 프로그레스 바 */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
          <div
            className="runner"
            style={{ left: `calc(${(step / totalSteps) * 100}% - 12px)` }}
          >
            🐑
          </div>
        </div>

        <h1 className="main-title">2025-2 필그림 출석부 📝</h1>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="card">
            <h2>1️⃣ 소속 들을 선택해주세요.</h2>
            <div className="btn-group">
              {groups
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((g) => (
                  <button
                    key={g.id}
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedGroup(g);
                      setStep(2);
                    }}
                  >
                    {groupNameMap[g.name] || g.name}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="card">
            <h2>
              2️⃣{" "}
              {isNewFamily
                ? "새가족 그룹의 반을 선택해주세요."
                : "리더님의 이름을 선택해주세요."}
            </h2>
            <div className="btn-group">
              {classes
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <button
                    key={c.id}
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedLeader(c);
                      setStep(3);
                    }}
                  >
                    {classNameMap[c.name] || c.name}
                  </button>
                ))}
            </div>
            <br />
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              <BackIcon /> 뒤로가기
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="card">
            <h2>3️⃣ [사랑의교회 주일예배] 참석한 지체들의 이름을 선택해주세요.</h2>
            <p>
              🌟 <b>리더님을 꼭 포함하여 체크해주세요!</b><br />
              ✔️ 현장 참석만 포함입니다! <br />
              ✔️ 타교회 예배에 참석한 경우는 해당되지 않습니다. <br />
            </p>
            {students
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <label key={s.id} className="ios-checkbox">
                  <input
                    type="checkbox"
                    checked={sundayAttendance.includes(s.id)}
                    onChange={() => {
                      setSundayAttendance((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((id) => id !== s.id)
                          : [...prev, s.id]
                      );
                    }}
                  />
                  <span className="checkmark"></span> {s.name}
                </label>
              ))}
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(2)}>
                <BackIcon /> 뒤로가기
              </button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="card">
            <h2>4️⃣ [대학5부 필그림 집회] 참석한 지체들의 이름을 선택해주세요.</h2>
            <p>
              🌟 <b>리더님을 꼭 포함하여 체크해주세요!</b><br />
              ✔️ 현장 참석 + 온라인 모두 포함입니다! <br />
              ✔️ 지각 또는 조퇴 모두 동일하게 출석으로 선택해주세요.
            </p>
            {students
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((s) => (
                <label key={s.id} className="ios-checkbox">
                  <input
                    type="checkbox"
                    checked={pilgrimAttendance.includes(s.id)}
                    onChange={() => {
                      setpilgrimAttendance((prev) =>
                        prev.includes(s.id)
                          ? prev.filter((id) => id !== s.id)
                          : [...prev, s.id]
                      );
                    }}
                  />
                  <span className="checkmark"></span> {s.name}
                </label>
              ))}
            <label>
              💻 위 질문에서 선택한 지체 중 대학부 집회를 [온라인]으로 참석한 지체가
              있다면, 해당 지체의 이름을 작성해주세요.
            </label>
            <textarea
              className="ios-input"
              type="text"
              value={onlineMembers}
              onChange={(e) => setOnlineMembers(e.target.value)}
            />

            {!isNewFamily && (
              <>
                <label>
                  ❎ 재라인업 및 등반 등의 사유로 위 문항의 선택지에 없는 지체가
                  있다면 기입해주세요.
                </label>
                <p>✔️ 작성 양식 : 재라인업 신예현 or 등반 신예현</p>
                <textarea
                  className="ios-input"
                  type="text"
                  value={missedMembers}
                  onChange={(e) => setMissedMembers(e.target.value)}
                />
              </>
            )}

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(3)}>
                <BackIcon /> 뒤로가기
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (isOikos) saveAttendance(); // 오이코스는 바로 제출
                  else setStep(5);
                }}
              >
                {isOikos ? (
                  <>
                    <CheckIcon /> 제출
                  </>
                ) : (
                  "다음"
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {!isOikos && step === 5 && (
          <div className="card">
            <h2>5️⃣ 방문자가 있다면 아래 양식에 맞추어 기입해주세요.</h2>
            <p>
              ✔️ 새가족 등록은 하지 않았지만, 샘 모임 또는 필그림 집회에 방문한 사람을 말합니다. <br />
              ✔️ 작성 양식) 방문자 신예현 / 인도자 이재원
            </p>
            <textarea
              className="ios-input"
              type="text"
              value={visitors}
              onChange={(e) => setVisitors(e.target.value)}
            />
            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(4)}>
                <BackIcon /> 뒤로가기
              </button>
              <button className="btn btn-primary" onClick={() => setStep(6)}>
                다음
              </button>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {!isOikos && step === 6 && (
          <div className="card">
            <h2>
              {isNewFamily
                ? "주차별 새가족 인원수를 작성해주세요."
                : "집회 관련 피드백 및 하고 싶은 말이 있으시다면, 여기에 적어주세요!"}
            </h2>
            <p>
              작성해주신 내용은 행정간사만 확인합니다! 자유롭게 남겨주세요 :) <br />
              사랑하고 축복합니다 목자님들 🤎
            </p>

            {isNewFamily && (
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <p style={{ margin: 0 }}>작성 양식 복사</p>
                <button
                  className="btn btn-icon"
                  style={{
                    padding: "4px",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() =>
                    setFeedback("1주차:\n2주차:\n3주차:\n4주차 및 등반")
                  }
                  title="양식 복사"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="9" y="9" width="6" height="6" rx="1" ry="1"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            )}

            <textarea
              className="ios-input"
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />

            <div className="btn-row">
              <button className="btn btn-secondary" onClick={() => setStep(5)}>
                <BackIcon /> 뒤로가기
              </button>
              <button className="btn btn-primary" onClick={saveAttendance}>
                <CheckIcon /> 제출
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 */}
        {step === 7 && (
          <div className="card">
            <h2>✅ 출석 제출이 완료되었습니다!</h2>
            <button
              className="btn btn-primary complete-btn"
              onClick={() => window.location.reload()}
            >
              처음으로 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

