---
title: "PawCrew Architecture Review — capability-based analysis"
date: 2026-08-24
status: review
type: review
reviewer_role: senior/staff engineer perspective
---

# PawCrew Architecture Review

Review toàn bộ hệ thống Agent/Skill ở góc nhìn kiến trúc, với mục tiêu:
một tập agent nhỏ, capability-based, composable, không phình to theo use case.

Phạm vi: kit trong repo này (`.opencode/`). Các skill global của user
(`worktrees`, `deepwork`, `reflect`, `simplify`, `codemap`, `clonedeps` trong
`~/.config/opencode/skills/`) nằm ngoài governance của kit — không xét.

## Inventory tại thời điểm review

- **6 primary**: PawBuilder, PatchPaw, LetMeowCook, PawPixel, Pawfessor, LoreCat (`mode: all`)
- **5 subagent**: Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers, GuardClaw
- **3 disable stub**: build, plan, explore
- **21 skill**: ast-grep, bug-flow, change-impact-analysis, change-request-flow,
  code-explanation, comment-polish, contract-regression-testing,
  crewkit-skill-registry, delegation-policy, design-md-contract, frontend-audit,
  frontend-critique, frontend-delight, frontend-polish, frontend-taste-router,
  frontend-ui-engineering, goal-persistence, hashline-edit, pdca-loop,
  retrospective, squad-mode
- **4 plugin**: lore-cat.ts, superpowers-gate.ts, frontend-guardian.ts, hashline.ts
- **7 command**: /build /patch /cook /design /explain /lore-cat-save-it /doctor

---

## Finding 1 — Hệ thống đã capability-based nhiều hơn là task-based, nhưng trộn 3 trục taxonomy

Tầng subagent rất sạch: phân chia theo **nguồn chân lý** (four truths —
CODE/PROJECT/EXTERNAL/JUDGEMENT) và theo **gate** (quality/security). Đây là
capability decomposition đúng nghĩa và là phần mạnh nhất của kiến trúc.

Tầng primary trộn **3 trục khác nhau**:

| Trục | Agent | Tiêu chí chia |
|---|---|---|
| Authority mode | PawBuilder, PatchPaw, LetMeowCook | chính sách phê duyệt + mức tự chủ |
| Domain | PawPixel | lĩnh vực (frontend) có contract riêng |
| Activity | Pawfessor | hoạt động (giải thích) |

Không có trục nào sai — mỗi lần thêm đều có lý do chính đáng. Vấn đề:
**không có rule nào quy định khi nào mỗi trục được phép thêm agent**, nên
các quyết định tương lai sẽ theo cảm tính. Đây là rủi ro lớn nhất, không phải
bản thân số lượng agent.

## Finding 2 — Duplication đang được kiểm soát đúng cách, nhưng còn sót

Kit đã extract nội dung chung vào skill (`delegation-policy`, `pdca-loop`) —
đúng hướng. Còn sót 3 chỗ duplicate:

1. **Dispatch mechanics paragraph** trong `letmeowcook.md` (dòng ~73) lặp lại
   gần nguyên văn nội dung `delegation-policy` skill.
2. **"Kit convention overriding Superpowers defaults"** (`.ai/superpowers/`
   redirect) xuất hiện trong cả `pawbuilder.md` lẫn `patchpaw.md` — nên là một
   rule toàn cục (GLOBAL-RULES.md đã tồn tại, đây là nơi đúng của nó).
3. **Verification section** của PawBuilder/PatchPaw/PawPixel trùng nhau phần
   "report only evidence from this turn / should pass means unverified" — nên
   extract thành rule chung hoặc một `verification-discipline` section dùng lại.

## Finding 3 — Không có god agent, nhưng có 2 "dumping ground risk"

- **LetMeowCook** broad nhất (mọi goal, full tool). Risk: việc gì không biết
  route đi đâu thì `/cook`. Mitigation hiện có: yêu cầu goal-shape + outcome
  report. Nên thêm một dòng trong prompt: "Nếu task cần phán đoán thiết kế
  chưa rõ ràng, route về PawBuilder thay vì tự quyết."
- **PawBuilder** là default agent (native `build` disabled). Mọi thứ không
  route sẽ rơi vào đây. Chấp nhận được vì PawBuilder có Intent Gate, nhưng
  Intent Gate nên có thêm route "explanation → Pawfessor" (hiện chỉ có trong
  Pawfessor một chiều).

## Finding 4 — Gap nằm ở rìa lifecycle, và KHÔNG gap nào cần agent mới

| Vùng | Gap | Dạng đúng |
|---|---|---|
| Performance | không có procedure profile → hypothesis → measure | Skill (workflow) |
| Operations | không có incident response (mitigate trước, root cause sau) | Skill (workflow) |
| Testing | không có test-strategy (chọn level test, characterization test cho legacy) | Skill |
| Data migration | dual-write/backfill/rollback chưa có checklist | Extend `contract-regression-testing` |
| Reverse engineering | black-box behavior extraction chưa có mode | Extend `code-explanation` |
| Observability | logging/monitoring design chưa có | Rule/workflow — YAGNI, chưa cần |

Quan trọng: mọi gap đều giải được bằng Skill/Workflow/Rule trên agent hiện có.
Đây là bằng chứng kiến trúc agent đã đủ tổng quát.

---

## Định nghĩa 4 layer (để tự quyết định về sau)

```text
AGENT    = cognitive mode ổn định + authority boundary + permission envelope.
           Sở hữu: quyết định, approval policy, completion contract.
           Chi phí: routing complexity, prompt maintenance, gate plugin entry, docs.

SKILL    = procedure tái sử dụng có input/output contract và nội dung suy luận
           ("cách nghĩ về X"). Được nhiều agent/workflow gọi.

WORKFLOW = sequence cố định cho một task shape lặp lại; là phần "steps" của
           skill, gắn với một trigger cụ thể. Sống bên trong skill hoặc prompt.

RULE     = constraint/preference áp xuyên suốt, không có steps. Sống trong
           agent prompt, GLOBAL-RULES.md, hoặc contract artifact (DESIGN.md).
```

Test nhanh: **Agent trả lời "ai được phép làm gì"; Skill trả lời "làm thế
nào"; Workflow trả lời "theo thứ tự nào"; Rule trả lời "với ràng buộc gì".**

## Decision framework khi gặp capability mới

```text
1. Agent hiện tại + skill hiện tại xử lý được không?
   → Được: không tạo gì; thêm Rule nếu cần ràng buộc mới.
2. Khác biệt chỉ là thứ tự bước / trigger khác?
   → Workflow: thêm section vào skill hoặc prompt hiện có.
3. Là procedure suy luận tái sử dụng, có output contract riêng,
   và được ≥2 agent/workflow gọi?
   → Skill mới.
4. Khác biệt chỉ là constraint?
   → Rule (prompt / GLOBAL-RULES / contract artifact).
5. Tạo Agent mới CHỈ KHI cả 3 điều kiện cùng đúng:
   a. Authority boundary MỚI (approval policy khác) hoặc permission
      envelope MỚI (read-only vs write, tool scope khác).
   b. Không thể diễn đạt bằng Skill + Workflow trên agent hiện có.
   c. Tần suất lặp lại: nêu được ≥3 use case dự kiến trong 3 tháng.
```

## Nguyên tắc chống Agent Explosion (bổ sung 5 rule gốc)

6. Không tạo agent nếu không có authority boundary hoặc permission envelope mới.
7. Hai agent không được trùng write scope + approval policy → nếu trùng, merge.
8. Skill mới phải nêu tên ≥2 agent/workflow sẽ gọi nó; nếu không → inline thành section/rule.
9. Domain specialist chỉ khi domain có contract artifact + verification surface riêng (tiền lệ PawPixel: DESIGN.md + frontend-guardian.ts).
10. Activity agent đóng băng ở Pawfessor — activity tiếp theo phải là skill.
11. Naming test: tên agent là technology (NextJsAgent), loại bug (RaceAgent), hoặc task (MigrationAgent) → loại.
12. Dispatch test: không viết được description để routing không mơ hồ so với agent anh em → loại.
13. Merge trigger: hai skill được load cùng nhau >80% số lần → merge.
14. Skill budget: tổng skill kit giữ ≤ ~25; vượt → bắt buộc consolidation review trước khi thêm.

---

## Taxonomy đề xuất (giữ nguyên quân số agent, đóng băng các trục)

```text
PRIMARY — trục authority (3, đóng băng):
  PawBuilder   collaborative — approval ở quyết định vật chất
  PatchPaw     controlled    — approval trước diff
  LetMeowCook  autonomous    — report ở cuối

DOMAIN — trục domain (cap = 1, hiện có PawPixel):
  PawPixel     frontend — có DESIGN.md contract + guardian plugin

ACTIVITY — trục activity (đóng băng ở 1, hiện có Pawfessor):
  Pawfessor    explanation + documentation narration

KNOWLEDGE — trực giao (1):
  LoreCat      .ai/docs corpus governor (mode: all)

SUBAGENT — trục nguồn chân lý (3):
  Sherclaw     CODE truth      SearchPurr  EXTERNAL truth
  ElderPaw     JUDGEMENT       (LoreCat subagent = PROJECT truth)

GATE — trục kiểm duyệt (2):
  JudgeWhiskers  quality verdict     GuardClaw  security verdict
```

Tổng: **11 agent — không thêm, không bớt.** Thay đổi nằm ở tầng skill.

## Capability Matrix (33 case → 12 capability)

Nhiều case map về cùng một capability — đó là bằng chứng taxonomy đúng.

| Capability | Primary | Supporting | Skill chính | Cases map về |
|---|---|---|---|---|
| Feature implementation | PawBuilder | Sherclaw, SearchPurr, ElderPaw, JudgeWhiskers | Superpowers flow, squad-mode, delegation-policy | Build feature mới · API integration · Third-party integration · Architecture change · Add validation/API/business logic |
| Controlled change | PatchPaw | Sherclaw, LoreCat, JudgeWhiskers, GuardClaw | bug-flow, change-request-flow, change-impact-analysis, contract-regression-testing | Fix bug · Refactor (bounded) · Database change · Logging · E2E flaky · Webhook duplicate |
| Autonomous execution | LetMeowCook | Sherclaw, SearchPurr, ElderPaw | external research triggers, goal-persistence→pdca | Migration · Dependency upgrade · Framework upgrade · CI/CD · Automation test · "make CI pass" · Refactor campaign |
| Frontend/UX | PawPixel | Sherclaw, JudgeWhiskers | design-md-contract, frontend-ui-engineering, taste-router + tastes, audit/critique/polish/delight | UI redesign · Accessibility · Form UX xấu |
| Investigation/evidence | Sherclaw (subagent) | — | ast-grep | Large-scale codebase investigation · Legacy code (pha hiểu) · "Where/what calls" |
| Interpretation/explanation | Pawfessor | Sherclaw, LoreCat, SearchPurr | code-explanation, diagram-design (external) | Explain · Reverse engineering (hiểu) · Documentation · Onboarding docs |
| External research | SearchPurr (subagent) | — | — | Framework semantics · Upstream behavior · Version compat |
| Judgement | ElderPaw (subagent) | — | — | Trade-offs · Dead ends · Root cause tinh vi |
| Quality gate | JudgeWhiskers (subagent) | — | requesting/receiving-code-review | Code review · Task review · Pre-release review |
| Security gate | GuardClaw (subagent) | — | — | Security review · Payment/auth/secrets scope |
| Knowledge governance | LoreCat | Sherclaw (verify) | wiki tools, OKF | Spec conflict · Docs drift · Knowledge sync · Requirement vs code |
| Process backbone | (skill, cross-cutting) | — | pdca-loop, retrospective, delegation-policy | Mọi task non-trivial · Lessons learned · Parallel investigation (squad) |

Case chưa cover tốt và nơi xử lý đúng:

| Case | Xử lý đúng | Ghi chú |
|---|---|---|
| Performance issue | PatchPaw + skill `performance-investigation` (ADD) | không phải PerformanceAgent |
| Production incident | PatchPaw + skill `incident-response` (ADD) | không phải IncidentAgent |
| Unit/Integration/E2E test | implementer + skill `test-strategy` (ADD) | TDD của Superpowers giữ nguyên |
| Legacy code không test | PatchPaw/PawBuilder + test-strategy (characterization testing) | |
| Không có source code | Pawfessor black-box mode (EXTEND code-explanation) + SearchPurr | |
| Data migration | LetMeowCook + contract-regression-testing (EXTEND: dual-write/backfill/rollback) | |
| Requirement unclear | PawBuilder + brainstorming (đã có) | |
| Technical debt | bounded → PatchPaw; campaign → LetMeowCook; cần disambiguation rule | |

## Routing Model

```text
Intent (động từ + đối tượng)
  ↓ classify: understanding | implementation | investigation | evaluation | explanation
Capability (bảng trên)
  ↓
Primary Agent (luôn đúng 1)
  ↓ load
Skills (procedure) → Workflows (sequence theo trigger)
  ↓
Verification (evidence before done)
```

**Task nhiều agent:** luôn `1 Primary + optional Supporting (subagent)`.
Không bao giờ 2 primary cùng chịu trách nhiệm chính. Handoff primary→primary
chỉ dưới dạng **route suggestion tường minh cho user** ("việc này thuộc
PatchPaw, chuyển nhé?") — không relay ngầm. Ngoại lệ duy nhất đã tài liệu
hóa: LoreCat sync như một phase của primary đang chạy.

**Disambiguation table** (thêm vào AGENTS.md — hiện chưa có):

| Task mơ hồ | Rule |
|---|---|
| Refactor | bounded + giữ behavior → PatchPaw · có design choice → PawBuilder · chiến dịch nhiều file lặp lại → LetMeowCook |
| Technical debt | 1 module → PatchPaw · toàn repo → LetMeowCook với goal record |
| Viết docs | giải thích code → Pawfessor · project truth → LoreCat |
| Test | viết test cho feature → PawBuilder · test fail/flaky → PatchPaw · build test suite → LetMeowCook |
| Security | giải thích → Pawfessor · review diff → GuardClaw (qua primary) · fix → PatchPaw |

---

## Stress-test: 24 tình huống

Ký hiệu: P = Primary, S = Supporting, Sk = Skill, W = workflow.
Không case nào bắt buộc tạo agent mới.

| # | Tình huống | P | S | Sk/W |
|---|---|---|---|---|
| 1 | API chậm sau deploy | PatchPaw (BUG) | Sherclaw, ElderPaw | bug-flow + performance-investigation (ADD) |
| 2 | Spec mâu thuẫn code hiện tại | LoreCat (direct) | Sherclaw (verify) | reconciliation → PatchPaw/PawBuilder thực thi phán quyết |
| 3 | Nâng Next.js major version | LetMeowCook | SearchPurr | external research triggers + goal record |
| 4 | Không có source, cần clone behavior | PawBuilder | SearchPurr, Pawfessor (black-box mode — EXTEND) | reverse-engineering workflow (ADD trong code-explanation) |
| 5 | Form UX xấu | PawPixel | — | frontend-critique → frontend-polish |
| 6 | Query gây CPU 100% | PatchPaw (BUG) | Sherclaw | performance-investigation (ADD) |
| 7 | Thêm payment provider | PawBuilder | SearchPurr, GuardClaw (review) | brainstorming → TDD; payment = high-risk scope của GuardClaw |
| 8 | E2E flaky trên CI | PatchPaw (BUG) | Sherclaw | bug-flow (root cause = test code hoặc race) |
| 9 | Module khó maintain | Pawfessor (hiểu trước) → PawBuilder | ElderPaw | code-explanation → brainstorming refactor |
| 10 | Lỗi production, local không reproduce | PatchPaw | Sherclaw | incident-response (ADD): thu evidence prod trước |
| 11 | Rate limit cho public API | PawBuilder | GuardClaw (review) | contract-regression-testing |
| 12 | Callback → async/await toàn repo | LetMeowCook | — | ast-grep (rewrite có kiểm soát) + goal record |
| 13 | "Docs nói X, code làm Y, cái nào đúng?" | LoreCat (direct) | Sherclaw | reconciliation question 3 lựa chọn |
| 14 | Viết tài liệu cho người mới | Pawfessor | Sherclaw, LoreCat | code-explanation + diagram-design |
| 15 | Webhook partner gửi trùng | PatchPaw (BUG) | Sherclaw | bug-flow + contract-regression-testing (idempotency) |
| 16 | MySQL 5.7 → 8 | LetMeowCook | SearchPurr | contract-regression-testing + data-migration checklist (EXTEND) |
| 17 | Review trước release | JudgeWhiskers | GuardClaw (nếu high-risk) | requesting-code-review, whole-branch |
| 18 | App khởi động chậm | PatchPaw | Sherclaw, ElderPaw | performance-investigation (ADD) |
| 19 | Feature khách muốn vs architecture | PawBuilder | LoreCat, ElderPaw | squad-mode (MERGE vào delegation-policy) |
| 20 | Giải thích hàm 500 dòng | Pawfessor | — | code-explanation (Narrate/Summarize) |
| 21 | CI hỏng sau runner update | LetMeowCook | SearchPurr | external research trigger "tooling/version-related" |
| 22 | Thêm unit test cho legacy module | PatchPaw | Sherclaw | test-strategy (ADD): characterization tests trước |
| 23 | Phát hiện secret trong log | PatchPaw (urgent CR) | GuardClaw (review) | bug-flow; rotate secret = approval gate |
| 24 | Tách service từ monolith | PawBuilder | ElderPaw, Sherclaw, LoreCat | squad + writing-plans; contract-regression-testing cho boundary |

Kết luận stress-test: **24/24 case xử lý được bằng 11 agent hiện tại +
skill bổ sung.** Không case nào cần agent mới. Case 4 và 10 là hai case yếu
nhất của kiến trúc hiện tại và được giải bằng EXTEND/ADD skill, không phải agent.

---

## REMOVE / MERGE / KEEP / ADD

### REMOVE (không tồn tại độc lập)

Không có skill nào đáng xóa hẳn. `comment-polish` là ứng viên borderline
(nhỏ, gần checklist) nhưng đang được 2 agent gọi ở verification — giữ, theo
dõi theo rule 13.

### MERGE

1. **`squad-mode` → `delegation-policy`**: squad-mode thực chất là "parallel
   dispatch pattern" — cùng chủ đề với delegation-policy, và PawBuilder đã
   load cả hai chồng nhau. Merge thành section "Parallel dispatch (squad)".
2. **`goal-persistence` → `pdca-loop`**: chính goal-persistence tự nhận là
   "extends the pdca-loop skill". Goal record = Plan Record sống sót qua
   session — merge thành section "Cross-session persistence".

### KEEP (boundary tốt)

- Toàn bộ tầng subagent (Sherclaw/SearchPurr/ElderPaw/JudgeWhiskers/GuardClaw)
  và four-truths model — xương sống của kit.
- LoreCat + write-guard `.ai/docs` + reconciliation modes.
- Cặp `change-impact-analysis` → `contract-regression-testing` (sequential,
  complementary, không overlap).
- `bug-flow` / `change-request-flow` tách theo classification — conditional
  loading là đúng, không merge.
- Họ frontend (10 skill) — domain family có router (`frontend-taste-router`)
  là đúng pattern; nhưng đây là domain family duy nhất được phép tồn tại
  (rule 9).
- `ast-grep`, `hashline-edit`, `crewkit-skill-registry`, `code-explanation`,
  `pdca-loop`, `retrospective`, `delegation-policy` (sau merge).

### ADD (capability thiếu thật sự)

1. **`performance-investigation`** (skill) — profile → baseline → hypothesis →
   measure → fix gate. Dùng bởi PatchPaw + LetMeowCook. Cover: case 1, 6, 18.
2. **`incident-response`** (skill) — triage severity → mitigate trước
   (rollback/feature flag) → preserve evidence → root cause → postmortem hook
   vào `retrospective`. Dùng bởi PatchPaw. Cover: case 10 và mọi prod incident.
3. **`test-strategy`** (skill) — chọn level test theo loại thay đổi;
   characterization testing cho legacy không test; flaky-test protocol. Dùng
   bởi cả 3 implementer. Cover: unit/integration/E2E/automation + case 22.
4. **EXTEND `contract-regression-testing`** — thêm data-migration checklist
   (dual-write, backfill, mixed-version, rollback). Cover: case 16.
5. **EXTEND `code-explanation`** — thêm black-box/reverse-engineering mode
   (API probing, behavior spec extraction khi không có source). Cover: case 4.
6. **Disambiguation table** trong AGENTS.md (bảng trên) — không phải skill,
   là rule.

Net: **agent 11 → 11 · skill 21 → 22** (−2 merge, +3 add).

---

## Proposed Agent Architecture (final)

| Agent | Responsibility | Owns | Does NOT own | Core Skills | Typical Workflows |
|---|---|---|---|---|---|
| **PawBuilder** | Collaborative feature engineer | Feature mới, architecture change có approval, design decisions với user | Bug fix, autonomous goal, fix không phê duyệt | Superpowers flow, squad (merged), delegation-policy, pdca-loop | brainstorm → plan → approve → TDD → verify → review |
| **PatchPaw** | Change-controlled maintenance | Bug, bounded CR, contract change, urgent fix | Open-ended feature, refactor chiến dịch | bug-flow, change-request-flow, change-impact-analysis, contract-regression-testing, incident-response (ADD), performance-investigation (ADD) | classify → investigate → contract → approve → fix → verify → knowledge sync |
| **LetMeowCook** | Autonomous execution | Goal-shaped: migration, upgrade, CI, campaign | Phán đoán thiết kế chưa rõ (route về PawBuilder) | external research triggers, test-strategy (ADD), pdca-loop + goal record | understand → plan → explore → execute → verify → outcome report → knowledge gates |
| **PawPixel** | Frontend & UI specialist | Component, page, token, a11y, visual QA | Backend API, data model, `.ai/docs` | design-md-contract, frontend-ui-engineering, taste-router + taste, audit/polish | context → taste select → build → guardian check → verify |
| **Pawfessor** | Code explainer | Giải thích, trace, map, doc generation, diagram deliverable | Code logic, `.ai/docs`, security review | code-explanation, delegation-policy, diagram-design (external) | classify mode → evidence → interpret → output contract |
| **LoreCat** | Knowledge governor | `.ai/docs` corpus, reconciliation, freshness | Application code | wiki tools (plugin), OKF | search → verify via Sherclaw → reconcile (direct) / evidence (subagent) |
| **Sherclaw** | Code truth (subagent) | Where/what/callers/tests | Ý kiến, edit | ast-grep | parallel search → structured results |
| **SearchPurr** | External truth (subagent) | Docs, upstream, version compat | Code trong repo | — | classify A/B/C/D → evidence with links |
| **ElderPaw** | Judgement (subagent) | Recommendation + effort + confidence | Retrieval, execution | — | consume evidence → one clear path |
| **JudgeWhiskers** | Quality gate (subagent) | Verdict BLOCKER/SHOULD-FIX/NIT | Implement fix | requesting/receiving-code-review | read diff → run tests → verdict |
| **GuardClaw** | Security gate (subagent) | Evidence-backed vuln findings | General review | — | trust boundary → trace → exploit path → verdict |

## Decision Tree (dán tường)

```text
Case mới xuất hiện
│
├─ Agent + skill hiện tại xử lý được?
│    └─ CÓ → không tạo gì (thêm Rule nếu cần ràng buộc)
│
├─ Khác biệt chỉ là thứ tự bước / trigger?
│    └─ Workflow: thêm section vào skill/prompt hiện có
│
├─ Procedure suy luận tái sử dụng + output contract riêng
│  + ≥2 nơi gọi?
│    └─ Skill mới
│
├─ Khác biệt chỉ là constraint?
│    └─ Rule (prompt / GLOBAL-RULES / contract artifact)
│
└─ Agent mới? Chỉ khi TẤT CẢ cùng đúng:
     1. Authority boundary MỚI hoặc permission envelope MỚI
     2. Không diễn đạt được bằng Skill + Workflow trên agent cũ
     3. Nêu được ≥3 use case trong 3 tháng tới
   Nếu thiếu bất kỳ điều nào → quay lên các nhánh trên.
```

## Ghi chú duy trì 3–5 năm

- Đóng băng trục activity ở Pawfessor là quyết định quan trọng nhất để chống
  explosion: mọi "X-er" tương lai (TestAgent, PerfAgent, IncidentAgent) đều
  phải bị từ chối bằng rule 6 + rule 11.
- Khi số project tăng: khác biệt giữa các project xử lý bằng **project-local
  skills** (`<project>/.opencode/skills/`) — cơ chế đã có trong
  `crewkit-skill-registry` và install.sh project mode. Không tạo agent per-project.
- Khi technology stack tăng: xử lý bằng skill domain (tiền lệ họ frontend) +
  SearchPurr cho tri thức ngoài; không tạo agent per-technology.
- Review định kỳ mỗi 6 tháng: chạy rule 13 (merge trigger) và rule 14
  (skill budget) trên toàn skill registry.
